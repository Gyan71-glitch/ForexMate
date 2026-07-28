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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
let EmployeesService = class EmployeesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async autoGenerateEmployeeCode() {
        const empList = await this.prisma.employee.findMany({
            where: { employeeCode: { startsWith: 'EMP-' } },
            select: { employeeCode: true },
        });
        let maxNumber = 0;
        for (const emp of empList) {
            const match = emp.employeeCode.match(/EMP-(\d+)/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (!isNaN(num) && num > maxNumber) {
                    maxNumber = num;
                }
            }
        }
        const nextNumber = maxNumber + 1;
        const paddedNumber = String(nextNumber).padStart(6, '0');
        return `EMP-${paddedNumber}`;
    }
    async syncLegacyRoleModels(employee) {
        if (employee.role === 'BRANCH_CASHIER') {
            await this.prisma.cashier.upsert({
                where: { employeeCode: employee.employeeCode },
                create: {
                    employeeCode: employee.employeeCode,
                    name: employee.name,
                    branchId: employee.branchId,
                    status: employee.status
                },
                update: {
                    name: employee.name,
                    branchId: employee.branchId,
                    status: employee.status
                }
            });
        }
        else if (employee.role === 'DELIVERY_PARTNER') {
            await this.prisma.deliveryPartner.upsert({
                where: { employeeCode: employee.employeeCode },
                create: {
                    employeeCode: employee.employeeCode,
                    name: employee.name,
                    branchId: employee.branchId,
                    status: employee.status
                },
                update: {
                    name: employee.name,
                    branchId: employee.branchId,
                    status: employee.status
                }
            });
        }
        else if (employee.role === 'BRANCH_MANAGER' && employee.branchId) {
            await this.prisma.branch.update({
                where: { id: employee.branchId },
                data: { managerId: employee.id }
            });
        }
    }
    async create(dto, currentUser) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: dto.branchId }
        });
        if (!branch) {
            throw new common_1.BadRequestException(`Branch with ID ${dto.branchId} not found`);
        }
        const employeeCode = await this.autoGenerateEmployeeCode();
        const tempPassword = dto.temporaryPassword || `Temp@${Math.floor(1000 + Math.random() * 9000)}`;
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const employee = await this.prisma.employee.create({
            data: {
                employeeCode,
                name: dto.name,
                phone: dto.phone,
                email: dto.email || null,
                passwordHash,
                role: dto.role,
                branchId: dto.branchId,
                status: dto.status || client_1.EmployeeStatus.ACTIVE,
                mustChangePassword: true,
                createdBy: currentUser?.email || currentUser?.id || 'SYSTEM'
            },
            include: {
                branch: true
            }
        });
        await this.syncLegacyRoleModels(employee);
        await this.prisma.auditLog.create({
            data: {
                userId: currentUser?.id || null,
                action: 'EMPLOYEE_CREATED',
                entityName: 'Employee',
                entityId: employee.id,
                newData: {
                    employeeCode: employee.employeeCode,
                    name: employee.name,
                    role: employee.role,
                    branchId: employee.branchId,
                    status: employee.status
                },
                branchId: employee.branchId
            }
        });
        const { passwordHash: _, ...result } = employee;
        return {
            ...result,
            temporaryPassword: tempPassword
        };
    }
    async findAll(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Number(query.limit) || 10);
        const skip = (page - 1) * limit;
        const where = {};
        if (query.role) {
            where.role = query.role;
        }
        if (query.branchId) {
            where.branchId = query.branchId;
        }
        if (query.status) {
            where.status = query.status;
        }
        if (query.search) {
            const search = query.search.trim();
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { employeeCode: { contains: search, mode: 'insensitive' } }
            ];
        }
        const [total, items] = await Promise.all([
            this.prisma.employee.count({ where }),
            this.prisma.employee.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    branch: true
                }
            })
        ]);
        const sanitizedItems = items.map(({ passwordHash: _, ...emp }) => emp);
        return {
            items: sanitizedItems,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async findOne(id) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                branch: true
            }
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        const { passwordHash: _, ...sanitized } = employee;
        return {
            ...sanitized,
            stats: {
                assignedOrdersCount: 0,
                completedOrdersCount: 0,
                deliveryStats: { total: 0, completed: 0, pending: 0 },
                pickupStats: { total: 0, completed: 0, pending: 0 }
            }
        };
    }
    async update(id, dto, currentUser) {
        const existing = await this.prisma.employee.findUnique({
            where: { id }
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        if (dto.branchId) {
            const branch = await this.prisma.branch.findUnique({
                where: { id: dto.branchId }
            });
            if (!branch) {
                throw new common_1.BadRequestException(`Branch with ID ${dto.branchId} not found`);
            }
        }
        const updated = await this.prisma.employee.update({
            where: { id },
            data: {
                name: dto.name ?? existing.name,
                phone: dto.phone ?? existing.phone,
                email: dto.email !== undefined ? dto.email : existing.email,
                role: dto.role ?? existing.role,
                branchId: dto.branchId ?? existing.branchId,
                status: dto.status ?? existing.status,
                updatedBy: currentUser?.email || currentUser?.id || 'SYSTEM'
            },
            include: {
                branch: true
            }
        });
        await this.syncLegacyRoleModels(updated);
        await this.prisma.auditLog.create({
            data: {
                userId: currentUser?.id || null,
                action: 'EMPLOYEE_UPDATED',
                entityName: 'Employee',
                entityId: updated.id,
                oldData: {
                    name: existing.name,
                    phone: existing.phone,
                    email: existing.email,
                    role: existing.role,
                    branchId: existing.branchId,
                    status: existing.status
                },
                newData: {
                    name: updated.name,
                    phone: updated.phone,
                    email: updated.email,
                    role: updated.role,
                    branchId: updated.branchId,
                    status: updated.status
                },
                branchId: updated.branchId
            }
        });
        const { passwordHash: _, ...sanitized } = updated;
        return sanitized;
    }
    async resetPassword(id, dto, currentUser) {
        const existing = await this.prisma.employee.findUnique({
            where: { id }
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        const tempPassword = dto.temporaryPassword || `Reset@${Math.floor(1000 + Math.random() * 9000)}`;
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const updated = await this.prisma.employee.update({
            where: { id },
            data: {
                passwordHash,
                mustChangePassword: true,
                updatedBy: currentUser?.email || currentUser?.id || 'SYSTEM'
            }
        });
        await this.prisma.auditLog.create({
            data: {
                userId: currentUser?.id || null,
                action: 'EMPLOYEE_PASSWORD_RESET',
                entityName: 'Employee',
                entityId: updated.id,
                newData: {
                    employeeCode: updated.employeeCode,
                    mustChangePassword: true
                },
                branchId: updated.branchId
            }
        });
        return {
            message: `Password reset successfully for ${updated.name}`,
            employeeCode: updated.employeeCode,
            temporaryPassword: tempPassword
        };
    }
    async updateStatus(id, dto, currentUser) {
        const existing = await this.prisma.employee.findUnique({
            where: { id }
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        const updated = await this.prisma.employee.update({
            where: { id },
            data: {
                status: dto.status,
                updatedBy: currentUser?.email || currentUser?.id || 'SYSTEM'
            },
            include: {
                branch: true
            }
        });
        await this.syncLegacyRoleModels(updated);
        await this.prisma.auditLog.create({
            data: {
                userId: currentUser?.id || null,
                action: 'EMPLOYEE_STATUS_CHANGED',
                entityName: 'Employee',
                entityId: updated.id,
                oldData: { status: existing.status },
                newData: { status: updated.status },
                branchId: updated.branchId
            }
        });
        const { passwordHash: _, ...sanitized } = updated;
        return sanitized;
    }
    async remove(id, currentUser) {
        const existing = await this.prisma.employee.findUnique({
            where: { id }
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        try {
            await this.prisma.$transaction(async (tx) => {
                if (existing.role === 'BRANCH_CASHIER') {
                    await tx.cashier.deleteMany({
                        where: { employeeCode: existing.employeeCode }
                    });
                }
                else if (existing.role === 'DELIVERY_PARTNER') {
                    await tx.deliveryPartner.deleteMany({
                        where: { employeeCode: existing.employeeCode }
                    });
                }
                await tx.employee.delete({
                    where: { id }
                });
                await tx.auditLog.create({
                    data: {
                        userId: currentUser?.id || null,
                        action: 'EMPLOYEE_DELETED',
                        entityName: 'Employee',
                        entityId: id,
                        oldData: {
                            employeeCode: existing.employeeCode,
                            name: existing.name,
                            role: existing.role,
                            branchId: existing.branchId
                        },
                        branchId: existing.branchId
                    }
                });
            });
            return { message: `Employee ${existing.name} successfully deleted` };
        }
        catch (error) {
            if (error?.code === 'P2003') {
                throw new common_1.BadRequestException(`Cannot delete employee ${existing.name} because they have historical records (like orders) assigned to them. Please deactivate their account instead.`);
            }
            throw error;
        }
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map