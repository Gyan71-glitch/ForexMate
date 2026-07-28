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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkforceJwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
let WorkforceJwtStrategy = class WorkforceJwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'workforce-jwt') {
    prisma;
    constructor(prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'forexmate-secret',
        });
        this.prisma = prisma;
    }
    async validate(payload) {
        if (payload.type !== 'WORKFORCE') {
            throw new common_1.UnauthorizedException('Invalid token type for workforce access.');
        }
        const employee = await this.prisma.employee.findUnique({
            where: { id: payload.sub },
            include: { branch: true },
        });
        if (!employee || employee.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Employee account not found or deactivated.');
        }
        return {
            id: employee.id,
            employeeCode: employee.employeeCode,
            name: employee.name,
            role: employee.role,
            branchId: employee.branchId,
            branchName: employee.branch?.branchName || '',
        };
    }
};
exports.WorkforceJwtStrategy = WorkforceJwtStrategy;
exports.WorkforceJwtStrategy = WorkforceJwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkforceJwtStrategy);
//# sourceMappingURL=workforce-jwt.strategy.js.map