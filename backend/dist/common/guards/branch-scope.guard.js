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
exports.BranchScopeGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const roles_enum_1 = require("../enums/roles.enum");
const OPS_BLOCKED_ROLES = [roles_enum_1.AppRole.CUSTOMER];
let BranchScopeGuard = class BranchScopeGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated.');
        }
        const role = await this.prisma.role.findUnique({
            where: { id: user.roleId },
        });
        if (!role) {
            throw new common_1.ForbiddenException('User role not found.');
        }
        if (OPS_BLOCKED_ROLES.includes(role.name)) {
            throw new common_1.ForbiddenException('Access denied. Operations portal is for staff only.');
        }
        const globalRoles = [
            roles_enum_1.AppRole.SUPER_ADMIN,
            roles_enum_1.AppRole.OPERATIONS_ADMIN,
            roles_enum_1.AppRole.COMPLIANCE_ADMIN,
        ];
        if (globalRoles.includes(role.name)) {
            return true;
        }
        const targetBranchId = request.params?.branchId ||
            request.query?.branchId ||
            request.body?.branchId;
        if (!targetBranchId) {
            return true;
        }
        const staffProfile = await this.prisma.branchStaff.findUnique({
            where: { userId: user.userId || user.id },
        });
        if (!staffProfile || staffProfile.branchId !== targetBranchId) {
            throw new common_1.ForbiddenException('Access denied. You do not have access to this branch.');
        }
        return true;
    }
};
exports.BranchScopeGuard = BranchScopeGuard;
exports.BranchScopeGuard = BranchScopeGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BranchScopeGuard);
//# sourceMappingURL=branch-scope.guard.js.map