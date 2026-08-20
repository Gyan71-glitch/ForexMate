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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const workflow_1 = require("../common/utils/workflow");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getExecutiveMetrics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const [ordersToday, ordersMonth, pendingCompliance, pendingBranchExecution, pendingDeliveries, completedOrders, cancelledOrders, todayRevenueStats, monthRevenueStats, auditLogs, branchesCount, citiesCount, employeesCount,] = await Promise.all([
            this.prisma.order.count({ where: { createdAt: { gte: today } } }),
            this.prisma.order.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
            this.prisma.order.count({ where: { complianceStatus: 'PENDING' } }),
            this.prisma.order.count({ where: { currentStage: 'FULFILLMENT_STAGE', status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
            this.prisma.order.count({ where: { deliveryMethod: 'HOME_DELIVERY', status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
            this.prisma.order.count({ where: { status: 'COMPLETED' } }),
            this.prisma.order.count({ where: { status: 'CANCELLED' } }),
            this.prisma.order.aggregate({
                where: { status: 'COMPLETED', createdAt: { gte: today } },
                _sum: { totalAmountInr: true },
            }),
            this.prisma.order.aggregate({
                where: { status: 'COMPLETED', createdAt: { gte: firstDayOfMonth } },
                _sum: { totalAmountInr: true },
            }),
            this.prisma.auditLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.branch.count(),
            this.prisma.city.count(),
            this.prisma.employee.count(),
        ]);
        const branches = await this.prisma.branch.findMany({
            include: {
                branchInventory: true,
                manager: true,
                _count: { select: { orders: true } },
            },
        });
        const branchHealth = branches.map((b) => {
            const totalStock = b.branchInventory.reduce((acc, inv) => acc + Number(inv.availableAmount || 0), 0);
            return {
                id: b.id,
                name: b.branchName,
                city: b.branchCity,
                code: b.branchCode,
                manager: b.manager?.name || 'Unassigned',
                status: b.status,
                branchType: b.branchType,
                totalStock,
                orderCount: b._count.orders,
                health: totalStock < 5000 ? 'LOW_STOCK' : 'OPTIMAL',
            };
        });
        return {
            overview: {
                ordersToday,
                ordersMonth,
                pendingCompliance,
                pendingBranchExecution,
                pendingDeliveries,
                completedOrders,
                cancelledOrders,
                revenueToday: Number(todayRevenueStats._sum.totalAmountInr || 0),
                revenueMonth: Number(monthRevenueStats._sum.totalAmountInr || 0),
                branchesCount,
                citiesCount,
                employeesCount,
            },
            branchHealth,
            recentLogs: auditLogs,
        };
    }
    async getDashboardSummary(user) {
        return this.getExecutiveMetrics();
    }
    async getAllOrders(user) {
        const orders = await this.prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                profile: { include: { user: true } },
                branch: { select: { branchName: true, branchCity: true, branchCode: true } },
                cashier: { select: { name: true, employeeCode: true } },
                deliveryPartner: { select: { name: true, employeeCode: true } },
                items: { include: { product: true, currency: true } },
                cashAllocation: { include: { items: true } },
            },
        });
        return orders.map((o) => ({
            ...o,
            status: (0, workflow_1.mapOrderStatus)(o),
        }));
    }
    async getAllBranches() {
        return this.prisma.branch.findMany({
            include: {
                city: true,
                manager: {
                    select: { id: true, name: true, employeeCode: true, phone: true, email: true },
                },
                vaults: { include: { currency: true } },
                branchInventory: true,
                _count: { select: { orders: true, employees: true } },
            },
            orderBy: { branchName: 'asc' },
        });
    }
    async createBranch(dto, userId) {
        const existing = await this.prisma.branch.findUnique({ where: { branchCode: dto.branchCode } });
        if (existing) {
            throw new common_1.BadRequestException(`Branch code '${dto.branchCode}' already exists.`);
        }
        const company = await this.prisma.company.findFirst();
        if (!company) {
            throw new common_1.BadRequestException('Company profile not initialized.');
        }
        let cityId = dto.cityId;
        if (!cityId && dto.branchCity) {
            const matchedCity = await this.prisma.city.findFirst({
                where: {
                    OR: [
                        { name: { equals: dto.branchCity, mode: 'insensitive' } },
                        { name: { contains: dto.branchCity.slice(0, 4), mode: 'insensitive' } },
                    ],
                },
            });
            if (matchedCity) {
                cityId = matchedCity.id;
            }
        }
        const branch = await this.prisma.branch.create({
            data: {
                companyId: company.id,
                branchCode: dto.branchCode,
                branchName: dto.branchName,
                branchAddress: dto.branchAddress,
                branchCity: dto.branchCity,
                cityId: cityId,
                branchType: dto.branchType || 'MAIN_BRANCH',
                lat: dto.lat,
                lng: dto.lng,
                phone: dto.phone,
                email: dto.email,
                workingHours: dto.workingHours || '09:00 AM - 06:00 PM',
                vaultCapacity: dto.vaultCapacity ? dto.vaultCapacity : 10000000.00,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'BRANCH_CREATED',
                entityName: 'Branch',
                entityId: branch.id,
                newData: { branchName: branch.branchName, branchCode: branch.branchCode },
            },
        });
        return branch;
    }
    async updateBranch(id, dto) {
        const branch = await this.prisma.branch.findUnique({ where: { id } });
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        const updated = await this.prisma.branch.update({
            where: { id },
            data: dto,
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'BRANCH_UPDATED',
                entityName: 'Branch',
                entityId: id,
                oldData: { branchName: branch.branchName, status: branch.status },
                newData: dto,
            },
        });
        return updated;
    }
    async assignBranchManager(branchId, employeeId, adminUserId) {
        const [branch, employee] = await Promise.all([
            this.prisma.branch.findUnique({ where: { id: branchId }, include: { manager: true } }),
            this.prisma.employee.findUnique({ where: { id: employeeId } }),
        ]);
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        if (employee.role !== 'BRANCH_MANAGER') {
            throw new common_1.BadRequestException(`Employee '${employee.name}' does not have the BRANCH_MANAGER role.`);
        }
        const previousManager = branch.manager?.name || 'None';
        const updatedBranch = await this.prisma.branch.update({
            where: { id: branchId },
            data: {
                managerId: employee.id,
            },
            include: {
                manager: true,
            },
        });
        await this.prisma.employee.update({
            where: { id: employee.id },
            data: { branchId },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'BRANCH_MANAGER_ASSIGNED',
                entityName: 'Branch',
                entityId: branchId,
                oldData: { manager: previousManager },
                newData: { newManagerId: employee.id, newManagerName: employee.name, branchCode: branch.branchCode },
            },
        });
        return updatedBranch;
    }
    async getAuditLogs() {
        return this.prisma.auditLog.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { fullName: true, email: true } },
            },
        });
    }
    async getSystemSettings() {
        return this.prisma.systemSetting.findMany({
            orderBy: { key: 'asc' },
        });
    }
    async updateSystemSetting(key, value, category) {
        return this.prisma.systemSetting.upsert({
            where: { key },
            update: { value, ...(category ? { category } : {}) },
            create: { key, value, category: category || 'GENERAL' },
        });
    }
    async createStaff(dto) {
        const role = await this.prisma.role.findUnique({
            where: { name: dto.roleName },
        });
        if (!role) {
            throw new common_1.BadRequestException(`Role ${dto.roleName} not found`);
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                roleId: role.id,
                isEmailVerified: true,
                fullName: dto.fullName,
            },
            include: { roleRef: true },
        });
        if (dto.branchId) {
            await this.prisma.branchStaff.create({
                data: {
                    branchId: dto.branchId,
                    userId: user.id,
                    designation: dto.roleName,
                    status: 'ACTIVE',
                },
            });
        }
        return user;
    }
    async getStaffList() {
        return this.prisma.user.findMany({
            where: { roleRef: { name: { not: 'CUSTOMER' } } },
            include: {
                roleRef: true,
                staffProfile: { include: { branch: true } },
            },
        });
    }
    async changeUserRole(userId, roleName) {
        const role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role)
            throw new common_1.BadRequestException(`Role ${roleName} not found`);
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { roleId: role.id },
            include: { roleRef: true },
        });
        await this.prisma.userSession.deleteMany({ where: { userId } });
        return updatedUser;
    }
    async changeUserStatus(userId, status) {
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { status },
            include: { roleRef: true, staffProfile: true },
        });
        if (updatedUser.staffProfile) {
            await this.prisma.branchStaff.update({
                where: { id: updatedUser.staffProfile.id },
                data: { status },
            });
        }
        if (status !== 'ACTIVE') {
            await this.prisma.userSession.deleteMany({ where: { userId } });
        }
        return updatedUser;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map