"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const notification_service_1 = require("../notification/notification.service");
const SALT_ROUNDS = 10;
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    notificationService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, notificationService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    getBrowserAndOs(userAgent) {
        let os = 'Unknown OS';
        let browser = 'Unknown Browser';
        if (!userAgent)
            return { os, browser };
        if (/windows/i.test(userAgent))
            os = 'Windows';
        else if (/macintosh|mac os x/i.test(userAgent))
            os = 'macOS';
        else if (/linux/i.test(userAgent))
            os = 'Linux';
        else if (/android/i.test(userAgent))
            os = 'Android';
        else if (/iphone|ipad|ipod/i.test(userAgent))
            os = 'iOS';
        if (/chrome|crios/i.test(userAgent))
            browser = 'Chrome';
        else if (/firefox|fxios/i.test(userAgent))
            browser = 'Firefox';
        else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent))
            browser = 'Safari';
        else if (/edge|edg/i.test(userAgent))
            browser = 'Edge';
        return { os, browser };
    }
    async register(data) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing) {
            throw new common_1.ConflictException('An account with this email already exists.');
        }
        if (!data.password || data.password.length < 6) {
            throw new common_1.BadRequestException('Password must be at least 6 characters.');
        }
        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
        const customerRole = await this.prisma.role.findUnique({
            where: { name: 'CUSTOMER' },
        });
        const user = await this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    fullName: data.fullName || '',
                    mobile: data.mobile || '',
                    roleId: customerRole ? customerRole.id : null,
                },
            });
            await tx.customerProfile.create({
                data: {
                    userId: newUser.id,
                    riskCategory: 'LOW',
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: newUser.id,
                    action: 'USER_REGISTER',
                    entityName: 'User',
                    entityId: newUser.id,
                    newData: { email: newUser.email, role: 'CUSTOMER' },
                },
            });
            return newUser;
        });
        return { message: 'Account created successfully.' };
    }
    async login(data, ip, userAgent, deviceId) {
        const minuteAgo = new Date(Date.now() - 60 * 1000);
        const recentAttempts = await this.prisma.loginAttempt.count({
            where: {
                email: data.email,
                createdAt: { gte: minuteAgo },
            },
        });
        if (recentAttempts >= 5) {
            throw new common_1.UnauthorizedException('Too many login attempts. Please try again later.');
        }
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
            include: { roleRef: true, sessions: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });
        if (!user) {
            await this.prisma.loginAttempt.create({
                data: { email: data.email, ip, device: userAgent, success: false, reason: 'USER_NOT_FOUND' },
            });
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
            throw new common_1.UnauthorizedException(`Account locked due to multiple failures. Try again in ${minutesLeft} minutes.`);
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('This account was created with Google. Please use Google Sign-In.');
        }
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            const newFailed = user.failedAttempts + 1;
            let lockoutUntil = null;
            let reason = 'INVALID_PASSWORD';
            if (newFailed >= 5) {
                lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
                reason = 'ACCOUNT_LOCKED_LIMIT_EXCEEDED';
            }
            await this.prisma.user.update({
                where: { id: user.id },
                data: { failedAttempts: newFailed, lockoutUntil },
            });
            await this.prisma.loginAttempt.create({
                data: { email: data.email, ip, device: userAgent, success: false, reason },
            });
            await this.prisma.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'FAILED_LOGIN',
                    entityName: 'User',
                    entityId: user.id,
                    ipAddress: ip,
                    userAgent,
                },
            });
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { failedAttempts: 0, lockoutUntil: null },
        });
        await this.prisma.loginAttempt.create({
            data: { email: data.email, ip, device: userAgent, success: true },
        });
        const country = 'India';
        const city = 'Mumbai';
        let riskLevel = 'LOW';
        if (user.sessions.length > 0) {
            const lastSession = user.sessions[0];
            if (lastSession.country && lastSession.country !== country) {
                riskLevel = 'HIGH';
                await this.prisma.auditLog.create({
                    data: {
                        userId: user.id,
                        action: 'GEO_ANOMALY_DETECTED',
                        entityName: 'UserSession',
                        newData: { description: `Session opened from ${country} shortly after last login from ${lastSession.country}` },
                        ipAddress: ip,
                        userAgent,
                    },
                });
            }
        }
        const sessionResult = await this.createSession(user.id, deviceId, ip, userAgent, country, city);
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'USER_LOGIN',
                entityName: 'UserSession',
                entityId: sessionResult.sessionId,
                ipAddress: ip,
                userAgent,
                newData: { risk: riskLevel },
            },
        });
        return {
            access_token: sessionResult.access_token,
            refresh_token: sessionResult.refresh_token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.roleRef?.name || 'CUSTOMER',
            },
        };
    }
    async createSession(userId, deviceId, ip, userAgent, country, city) {
        const rawRefreshToken = crypto.randomBytes(32).toString('hex');
        const hashedRefreshToken = this.hashToken(rawRefreshToken);
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        const { os, browser } = this.getBrowserAndOs(userAgent);
        const staff = await this.prisma.branchStaff.findUnique({
            where: { userId },
            include: { branch: true },
        });
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { roleRef: true },
        });
        const session = await this.prisma.userSession.create({
            data: {
                userId,
                deviceId: deviceId || null,
                refreshTokenHash: hashedRefreshToken,
                expiresAt,
                ip,
                country,
                city,
                browser,
                os,
            },
        });
        const accessPayload = {
            sub: userId,
            sessionId: session.id,
            roleId: user?.roleId || null,
            role: user?.roleRef?.name || 'CUSTOMER',
            companyId: staff?.branch?.companyId || null,
            branchId: staff?.branchId || null,
        };
        const accessToken = this.jwtService.sign(accessPayload, {
            expiresIn: '365d',
        });
        return {
            sessionId: session.id,
            access_token: accessToken,
            refresh_token: rawRefreshToken,
        };
    }
    async refresh(refreshToken, ip, userAgent) {
        const minuteAgo = new Date(Date.now() - 60 * 1000);
        const hashed = this.hashToken(refreshToken);
        const activeSession = await this.prisma.userSession.findUnique({
            where: { refreshTokenHash: hashed },
            include: { user: true },
        });
        if (!activeSession) {
            const reusedSession = await this.prisma.userSession.findFirst({
                where: { refreshTokenHash: hashed },
            });
            if (reusedSession) {
                await this.prisma.userSession.updateMany({
                    where: { userId: reusedSession.userId, revokedAt: null },
                    data: { revokedAt: new Date() },
                });
                await this.prisma.user.update({
                    where: { id: reusedSession.userId },
                    data: { lockoutUntil: new Date(Date.now() + 15 * 60 * 1000) },
                });
                await this.prisma.auditLog.create({
                    data: {
                        userId: reusedSession.userId,
                        action: 'REFRESH_TOKEN_REPLAY_ATTACK',
                        entityName: 'UserSession',
                        newData: { description: `Token reuse detected. All sessions terminated and user locked.` },
                        ipAddress: ip,
                        userAgent,
                    },
                });
                throw new common_1.ForbiddenException('Security alert: Compromised session detected. All logins revoked.');
            }
            throw new common_1.UnauthorizedException('Session not found.');
        }
        if (activeSession.revokedAt) {
            throw new common_1.UnauthorizedException('Session has been logged out.');
        }
        if (activeSession.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Session has expired.');
        }
        const recentRefreshes = await this.prisma.userSession.count({
            where: {
                userId: activeSession.userId,
                createdAt: { gte: minuteAgo },
            },
        });
        if (recentRefreshes >= 30) {
            throw new common_1.BadRequestException('Too many refreshes. Wait a minute.');
        }
        await this.prisma.userSession.update({
            where: { id: activeSession.id },
            data: { revokedAt: new Date() },
        });
        const country = activeSession.country || 'India';
        const city = activeSession.city || 'Mumbai';
        const sessionResult = await this.createSession(activeSession.userId, activeSession.deviceId || undefined, ip, userAgent, country, city);
        await this.prisma.auditLog.create({
            data: {
                userId: activeSession.userId,
                action: 'REFRESH_USED',
                entityName: 'UserSession',
                entityId: sessionResult.sessionId,
                ipAddress: ip,
                userAgent,
            },
        });
        return {
            access_token: sessionResult.access_token,
            refresh_token: sessionResult.refresh_token,
        };
    }
    async logout(refreshToken) {
        const hashed = this.hashToken(refreshToken);
        const session = await this.prisma.userSession.findUnique({
            where: { refreshTokenHash: hashed },
        });
        if (session) {
            await this.prisma.userSession.update({
                where: { id: session.id },
                data: { revokedAt: new Date() },
            });
            await this.prisma.auditLog.create({
                data: {
                    userId: session.userId,
                    action: 'USER_LOGOUT',
                    entityName: 'UserSession',
                    entityId: session.id,
                },
            });
        }
        return { message: 'Logged out successfully.' };
    }
    async sendOtp(recipient, purpose) {
        const minuteAgo = new Date(Date.now() - 60 * 1000);
        const otpCount = await this.prisma.otpVerification.count({
            where: {
                recipient,
                createdAt: { gte: minuteAgo },
            },
        });
        if (otpCount >= 3) {
            throw new common_1.BadRequestException('Too many OTP requests. Please wait a minute.');
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = this.hashToken(code);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.otpVerification.create({
            data: { recipient, purpose, codeHash, expiresAt },
        });
        await this.prisma.notificationQueue.create({
            data: {
                channel: recipient.includes('@') ? 'EMAIL' : 'SMS',
                recipient,
                subject: `Your Forexmate Verification Code`,
                body: `Your OTP code is ${code}. It expires in 5 minutes. Do not share this with anyone.`,
                priority: 'CRITICAL',
            },
        });
        try {
            const msg = `Your Forexmate verification code is ${code}. It expires in 5 minutes.`;
            if (recipient.includes('@')) {
                await this.notificationService.sendEmail(recipient, 'Your Forexmate Verification Code', msg);
            }
            else {
                await this.notificationService.sendSMS(recipient, msg);
            }
        }
        catch (err) {
            this.logger.error(`Failed to dispatch real-time OTP notification to ${recipient}`, err);
        }
        await this.prisma.auditLog.create({
            data: {
                action: 'OTP_SENT',
                entityName: 'OtpVerification',
                newData: { description: `OTP code generated and queued for ${recipient} (Purpose: ${purpose})` },
            },
        });
        this.logger.log(`[LOCAL DEV OTP] Sent code ${code} to ${recipient}`);
        return {
            message: 'Verification OTP has been queued.',
            devCode: process.env.NODE_ENV !== 'production' ? code : undefined
        };
    }
    async verifyOtp(recipient, purpose, code) {
        const codeHash = this.hashToken(code);
        const verifyRecord = await this.prisma.otpVerification.findFirst({
            where: {
                recipient,
                purpose,
                codeHash,
                verified: false,
                expiresAt: { gte: new Date() },
            },
        });
        if (!verifyRecord) {
            throw new common_1.BadRequestException('Invalid or expired OTP code.');
        }
        await this.prisma.otpVerification.update({
            where: { id: verifyRecord.id },
            data: { verified: true },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'OTP_VERIFIED',
                entityName: 'OtpVerification',
                entityId: verifyRecord.id,
                newData: { description: `Successfully verified OTP for ${recipient}` },
            },
        });
        return true;
    }
    async requestPasswordReset(email) {
        const minuteAgo = new Date(Date.now() - 60 * 1000);
        const resetCount = await this.prisma.passwordResetToken.count({
            where: {
                user: { email },
                createdAt: { gte: minuteAgo },
            },
        });
        if (resetCount >= 2) {
            throw new common_1.BadRequestException('Too many reset requests. Please wait a minute.');
        }
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return { message: 'If the account exists, a reset link has been sent.' };
        }
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = this.hashToken(token);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.passwordResetToken.create({
            data: { userId: user.id, tokenHash, expiresAt },
        });
        await this.prisma.notificationQueue.create({
            data: {
                channel: 'EMAIL',
                recipient: email,
                subject: 'Reset your Forexmate Password',
                body: `Use the following link to reset your password: http://localhost:3000/reset-password?token=${token}`,
                priority: 'HIGH',
            },
        });
        return { message: 'If the account exists, a reset link has been sent.' };
    }
    async resetPassword(token, newPassword) {
        const tokenHash = this.hashToken(token);
        const resetRecord = await this.prisma.passwordResetToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!resetRecord || resetRecord.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired reset token.');
        }
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: resetRecord.userId },
                data: { password: hashedPassword, failedAttempts: 0, lockoutUntil: null },
            }),
            this.prisma.passwordResetToken.delete({
                where: { id: resetRecord.id },
            }),
        ]);
        await this.prisma.auditLog.create({
            data: {
                userId: resetRecord.userId,
                action: 'PASSWORD_CHANGED',
                entityName: 'User',
                entityId: resetRecord.userId,
            },
        });
        return { message: 'Password has been updated successfully.' };
    }
    async getSessions(userId) {
        return this.prisma.userSession.findMany({
            where: { userId, revokedAt: null, expiresAt: { gte: new Date() } },
            select: {
                id: true,
                createdAt: true,
                lastActivity: true,
                ip: true,
                country: true,
                city: true,
                browser: true,
                os: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async revokeSession(userId, sessionId) {
        const session = await this.prisma.userSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.BadRequestException('Session not found.');
        }
        if (session.userId !== userId) {
            throw new common_1.ForbiddenException('Cannot revoke other user sessions.');
        }
        await this.prisma.userSession.update({
            where: { id: sessionId },
            data: { revokedAt: new Date() },
        });
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'SESSION_REVOKED',
                entityName: 'UserSession',
                entityId: sessionId,
            },
        });
        return { message: 'Session successfully revoked.' };
    }
    async googleLogin(credential, ip, userAgent) {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${credential}` },
        });
        if (!response.ok) {
            throw new common_1.UnauthorizedException('Invalid Google token.');
        }
        const payload = await response.json();
        if (!payload?.email) {
            throw new common_1.UnauthorizedException('Could not retrieve email from Google.');
        }
        let user = await this.prisma.user.findUnique({
            where: { email: payload.email },
            include: { roleRef: true },
        });
        if (!user) {
            const customerRole = await this.prisma.role.findUnique({
                where: { name: 'CUSTOMER' },
            });
            user = await this.prisma.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                    data: {
                        email: payload.email,
                        password: '',
                        fullName: payload.name || 'Google User',
                        mobile: '',
                        roleId: customerRole ? customerRole.id : null,
                        isEmailVerified: true,
                    },
                    include: { roleRef: true },
                });
                await tx.customerProfile.create({
                    data: {
                        userId: newUser.id,
                        riskCategory: 'LOW',
                    },
                });
                return newUser;
            });
        }
        if (!user) {
            throw new common_1.UnauthorizedException('Google Login failed: User could not be created.');
        }
        const sessionResult = await this.createSession(user.id, undefined, ip, userAgent, 'India', 'Mumbai');
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'USER_LOGIN',
                entityName: 'UserSession',
                entityId: sessionResult.sessionId,
                ipAddress: ip,
                userAgent,
                newData: { provider: 'google' },
            },
        });
        return {
            access_token: sessionResult.access_token,
            refresh_token: sessionResult.refresh_token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.roleRef?.name || 'CUSTOMER',
            },
        };
    }
    async validatePayload(payload) {
        const session = await this.prisma.userSession.findUnique({
            where: { id: payload.sessionId },
        });
        if (!session || session.revokedAt || session.expiresAt < new Date()) {
            return null;
        }
        await this.prisma.userSession.update({
            where: { id: session.id },
            data: { lastActivity: new Date() },
        });
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: { roleRef: true, staffProfile: true },
        });
        if (!user)
            return null;
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            mobile: user.mobile,
            role: user.roleRef?.name || 'CUSTOMER',
            roleId: user.roleId,
            sessionId: session.id,
            branchId: user.staffProfile?.branchId || null,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        notification_service_1.NotificationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map