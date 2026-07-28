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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevAuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let DevAuthService = class DevAuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    async generateImpersonationToken(email, roleOverride) {
        let user = await this.prisma.user.findUnique({
            where: { email },
            include: { roleRef: true },
        });
        if (!user) {
            if (email.endsWith('@forexmate.com') || email.endsWith('@forexmate.dev')) {
                const defaultRole = await this.prisma.role.findFirst({
                    where: { name: roleOverride || 'CUSTOMER' },
                });
                const passHash = await bcrypt.hash('admin123', 10);
                user = await this.prisma.$transaction(async (tx) => {
                    const newUser = await tx.user.create({
                        data: {
                            email,
                            password: passHash,
                            fullName: email.split('@')[0].toUpperCase(),
                            roleId: defaultRole ? defaultRole.id : null,
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
            else {
                throw new common_1.NotFoundException(`User with email ${email} not found.`);
            }
        }
        let targetRoleId = user.roleId;
        let targetRoleName = user.roleRef?.name || 'CUSTOMER';
        if (roleOverride) {
            const roleObj = await this.prisma.role.findUnique({
                where: { name: roleOverride },
            });
            if (!roleObj) {
                throw new common_1.BadRequestException(`Role ${roleOverride} not found in database.`);
            }
            targetRoleId = roleObj.id;
            targetRoleName = roleObj.name;
        }
        const staff = await this.prisma.branchStaff.findUnique({
            where: { userId: user.id },
            include: { branch: true },
        });
        const rawRefreshToken = crypto.randomBytes(32).toString('hex');
        const hashedRefreshToken = this.hashToken(rawRefreshToken);
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        const session = await this.prisma.userSession.create({
            data: {
                userId: user.id,
                refreshTokenHash: hashedRefreshToken,
                expiresAt,
                ip: '127.0.0.1',
                country: 'India',
                city: 'Mumbai',
                os: 'macOS',
                browser: 'Chrome',
            },
        });
        const accessPayload = {
            sub: user.id,
            sessionId: session.id,
            roleId: targetRoleId,
            companyId: staff?.branch?.companyId || null,
            branchId: staff?.branchId || null,
        };
        const accessToken = this.jwtService.sign(accessPayload, {
            expiresIn: '365d',
        });
        return {
            access_token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: targetRoleName,
            },
        };
    }
    async getSessions() {
        return this.prisma.user.findMany({
            take: 20,
            include: { roleRef: true },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.DevAuthService = DevAuthService;
exports.DevAuthService = DevAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], DevAuthService);
//# sourceMappingURL=dev-auth.service.js.map