"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const auth_dto_1 = require("./dto/auth.dto");
let AuthController = class AuthController {
    authService;
    jwtService;
    prisma;
    constructor(authService, jwtService, prisma) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    setRefreshCookie(res, token) {
        res.cookie('refresh_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 365 * 24 * 60 * 60 * 1000,
        });
    }
    clearRefreshCookie(res) {
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
        });
    }
    async login(dto, ip, userAgent, res) {
        const result = await this.authService.login(dto, ip, userAgent, dto.deviceId);
        this.setRefreshCookie(res, result.refresh_token);
        return {
            access_token: result.access_token,
            user: result.user,
        };
    }
    async staffLogin(dto, ip, userAgent, res) {
        const result = await this.authService.login(dto, ip, userAgent, dto.deviceId);
        const staffRoles = [
            'SUPER_ADMIN', 'ADMIN', 'OPERATIONS_ADMIN', 'COMPLIANCE_ADMIN',
            'STAFF', 'BRANCH_OPERATIONS', 'COMPLIANCE', 'DEALER', 'ACCOUNTANT',
            'AGENT', 'TELLER', 'BRANCH_KYC_STAFF', 'BRANCH_INVENTORY_STAFF',
            'BRANCH_FULFILLMENT_STAFF', 'BRANCH_CASHIER', 'BRANCH_MANAGER'
        ];
        if (!staffRoles.includes(result.user.role)) {
            throw new common_1.UnauthorizedException('You do not have staff permissions.');
        }
        this.setRefreshCookie(res, result.refresh_token);
        let workforce_token = null;
        if (result.user.role === 'BRANCH_MANAGER') {
            const employee = await this.prisma.employee.findFirst({
                where: {
                    OR: [
                        { email: dto.email?.toLowerCase() },
                        { role: 'BRANCH_MANAGER', status: 'ACTIVE' },
                    ],
                },
                include: { branch: true },
            });
            if (employee) {
                workforce_token = this.jwtService.sign({
                    sub: employee.id,
                    employeeCode: employee.employeeCode,
                    role: employee.role,
                    branchId: employee.branchId,
                    type: 'WORKFORCE',
                }, { expiresIn: '12h' });
            }
        }
        return {
            access_token: result.access_token,
            user: result.user,
            ...(workforce_token ? { workforce_token } : {}),
        };
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async googleLogin(dto, ip, userAgent, res) {
        const result = await this.authService.googleLogin(dto.credential, ip, userAgent);
        this.setRefreshCookie(res, result.refresh_token);
        return {
            access_token: result.access_token,
            user: result.user,
        };
    }
    async refresh(req, ip, userAgent, res) {
        const token = req.cookies?.['refresh_token'];
        if (!token) {
            throw new common_1.UnauthorizedException('No refresh token provided.');
        }
        const result = await this.authService.refresh(token, ip, userAgent);
        this.setRefreshCookie(res, result.refresh_token);
        return {
            access_token: result.access_token,
        };
    }
    async logout(req, res) {
        const token = req.cookies?.['refresh_token'];
        if (token) {
            await this.authService.logout(token);
        }
        this.clearRefreshCookie(res);
        return { message: 'Logged out successfully.' };
    }
    async getMe(req) {
        return req.user;
    }
    async sendOtp(dto) {
        return this.authService.sendOtp(dto.recipient, dto.purpose);
    }
    async verifyOtp(dto) {
        const verified = await this.authService.verifyOtp(dto.recipient, dto.purpose, dto.code);
        return { verified };
    }
    async requestReset(dto) {
        return this.authService.requestPasswordReset(dto.email);
    }
    async resetPassword(dto) {
        return this.authService.resetPassword(dto.token, dto.password);
    }
    async getSessions(req) {
        return this.authService.getSessions(req.user.id);
    }
    async revokeSession(req, sessionId) {
        return this.authService.revokeSession(req.user.id, sessionId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login client/user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials or account locked' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('staff-login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login staff member' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staff login successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized staff access' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "staffLogin", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new customer' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Registration successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('google'),
    (0, swagger_1.ApiOperation)({ summary: 'Login with Google OAuth' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.GoogleLoginDto, String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Rotate and refresh JWT access token using HttpOnly cookie' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokens rotated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session expired/revoked' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke and log out current session' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('otp/send'),
    (0, swagger_1.ApiOperation)({ summary: 'Queue a 6-digit verification OTP' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SendOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('otp/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify a sent OTP code' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('password-reset/request'),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset token link' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RequestResetDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestReset", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('password-reset/reset'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password using high-entropy token link' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('sessions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List user active sessions' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getSessions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('sessions/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke specific active session' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeSession", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map