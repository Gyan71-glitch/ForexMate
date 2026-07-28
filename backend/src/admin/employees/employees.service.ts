import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, ResetPasswordDto, UpdateEmployeeStatusDto } from './dto/employee.dto';
import * as bcrypt from 'bcrypt';
import { EmployeeRole, EmployeeStatus } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Auto-generates unique sequential employee code formatted as EMP-000001
   */
  private async autoGenerateEmployeeCode(): Promise<string> {
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

  /**
   * Syncs Employee with Cashier / DeliveryPartner models for seamless legacy ops compatibility
   */
  private async syncLegacyRoleModels(employee: any) {
    if ((employee.role as string) === 'BRANCH_CASHIER') {
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
    } else if (employee.role === 'DELIVERY_PARTNER') {
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
    } else if ((employee.role as string) === 'BRANCH_MANAGER' && employee.branchId) {
      await this.prisma.branch.update({
        where: { id: employee.branchId },
        data: { managerId: employee.id }
      });
    }
  }

  async create(dto: CreateEmployeeDto, currentUser?: any) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId }
    });
    if (!branch) {
      throw new BadRequestException(`Branch with ID ${dto.branchId} not found`);
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
        status: dto.status || EmployeeStatus.ACTIVE,
        mustChangePassword: true,
        createdBy: currentUser?.email || currentUser?.id || 'SYSTEM'
      },
      include: {
        branch: true
      }
    });

    await this.syncLegacyRoleModels(employee);

    // Write Audit Log
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

  async findAll(query: {
    search?: string;
    role?: string;
    branchId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.role) {
      where.role = query.role as EmployeeRole;
    }

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.status) {
      where.status = query.status as EmployeeStatus;
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

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        branch: true
      }
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
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

  async update(id: string, dto: UpdateEmployeeDto, currentUser?: any) {
    const existing = await this.prisma.employee.findUnique({
      where: { id }
    });
    if (!existing) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    if (dto.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: dto.branchId }
      });
      if (!branch) {
        throw new BadRequestException(`Branch with ID ${dto.branchId} not found`);
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

    // Write Audit Log
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

  async resetPassword(id: string, dto: ResetPasswordDto, currentUser?: any) {
    const existing = await this.prisma.employee.findUnique({
      where: { id }
    });
    if (!existing) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
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

  async updateStatus(id: string, dto: UpdateEmployeeStatusDto, currentUser?: any) {
    const existing = await this.prisma.employee.findUnique({
      where: { id }
    });
    if (!existing) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
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
  async remove(id: string, currentUser?: any) {
    const existing = await this.prisma.employee.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        // Delete legacy records if they exist
        if ((existing.role as string) === 'BRANCH_CASHIER') {
          await tx.cashier.deleteMany({
            where: { employeeCode: existing.employeeCode }
          });
        } else if (existing.role === 'DELIVERY_PARTNER') {
          await tx.deliveryPartner.deleteMany({
            where: { employeeCode: existing.employeeCode }
          });
        }

        // Delete the employee
        await tx.employee.delete({
          where: { id }
        });

        // Log the deletion
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
    } catch (error: any) {
      if (error?.code === 'P2003') {
        throw new BadRequestException(
          `Cannot delete employee ${existing.name} because they have historical records (like orders) assigned to them. Please deactivate their account instead.`
        );
      }
      throw error;
    }
  }
}
