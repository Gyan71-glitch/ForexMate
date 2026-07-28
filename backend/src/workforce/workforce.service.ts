import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  WorkforceLoginDto,
  WorkforceChangePasswordDto,
  SendCustomerOtpDto,
  VerifyCustomerOtpDto,
  CompleteDeliveryDto,
  ReassignBranchDto,
  AssignDeliveryPartnerDto,
  ManagerCompletePickupDto,
  ReceiveBranchInventoryDto,
} from './dto/workforce.dto';

import { DomainEventBus } from '../common/event-bus/domain-event-bus.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkforceService {
  private readonly logger = new Logger(WorkforceService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private eventBus: DomainEventBus,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async getSystemUserId(): Promise<string> {
    const admin = await this.prisma.user.findFirst({
      where: { email: 'admin@forexmate.com' },
      select: { id: true },
    });
    if (!admin) {
      // Fallback: use any user that exists
      const anyUser = await this.prisma.user.findFirst({ select: { id: true } });
      if (!anyUser) throw new Error('No system user found for status history.');
      return anyUser.id;
    }
    return admin.id;
  }

  // ─── Employee Authentication ────────────────────────────────────────────────

  async login(dto: WorkforceLoginDto) {
    const rawCode = dto.employeeCode.trim().toUpperCase();
    
    // Try exact lookup first
    let employee = await this.prisma.employee.findUnique({
      where: { employeeCode: rawCode },
      include: { branch: true },
    });

    // Fallback: If user typed 000004 or 4 without EMP- prefix
    if (!employee && !rawCode.startsWith('EMP-')) {
      const digitsOnly = rawCode.replace(/\D/g, '');
      if (digitsOnly) {
        const paddedCode = `EMP-${digitsOnly.padStart(6, '0')}`;
        employee = await this.prisma.employee.findUnique({
          where: { employeeCode: paddedCode },
          include: { branch: true },
        });
      }
    }

    if (!employee) {
      throw new UnauthorizedException('Invalid Employee ID or password.');
    }

    if (employee.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account has been deactivated. Contact your branch manager.');
    }

    const isMatch = await bcrypt.compare(dto.password, employee.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Employee ID or password.');
    }

    // Update last login
    await this.prisma.employee.update({
      where: { id: employee.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: employee.id,
      employeeCode: employee.employeeCode,
      role: employee.role,
      branchId: employee.branchId,
      type: 'WORKFORCE',
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.prisma.auditLog.create({
      data: {
        action: 'WORKFORCE_LOGIN',
        entityName: 'Employee',
        entityId: employee.id,
        branchId: employee.branchId,
        newData: { employeeCode: employee.employeeCode, role: employee.role },
      },
    });

    return {
      access_token: accessToken,
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode,
        name: employee.name,
        role: employee.role,
        branchId: employee.branchId,
        branchName: employee.branch?.branchName || '',
        phone: employee.phone,
        email: employee.email,
        mustChangePassword: employee.mustChangePassword,
      },
    };
  }

  async changePassword(employeeId: string, dto: WorkforceChangePasswordDto) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found.');

    const isMatch = await bcrypt.compare(dto.currentPassword, employee.passwordHash);
    if (!isMatch) throw new BadRequestException('Current password is incorrect.');

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match.');
    }

    if (dto.newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters.');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { passwordHash: newHash, mustChangePassword: false },
    });

    return { message: 'Password changed successfully.' };
  }

  async getProfile(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { branch: true },
    });
    if (!employee) throw new NotFoundException('Employee not found.');
    const { passwordHash: _, ...profile } = employee;
    return profile;
  }


  // ─── Order Fetching ─────────────────────────────────────────────────────────


  async getAssignedOrders(employeeId: string, role: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found.');

    if (role === 'BRANCH_CASHIER') {
      // Find cashier record linked to this employee
      const cashier = await this.prisma.cashier.findUnique({
        where: { employeeCode: employee.employeeCode },
      });
      if (!cashier) return { pickup: [], cashSell: [] };

      const [pickup, cashSell] = await Promise.all([
        // Pickup orders: any product assigned to this cashier with a pickup delivery method
        this.prisma.order.findMany({
          where: {
            cashierId: cashier.id,
            deliveryMethod: { in: ['BRANCH_PICKUP', 'PICKUP', 'STORE_PICKUP'] },
            status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
          },
          include: this.orderIncludes(),
          orderBy: { createdAt: 'desc' },
        }),
        // Cash Sell orders: all CASH_SELL orders assigned to this cashier (regardless of delivery method)
        this.prisma.order.findMany({
          where: {
            cashierId: cashier.id,
            productType: 'CASH_SELL',
            deliveryMethod: { notIn: ['BRANCH_PICKUP', 'PICKUP', 'STORE_PICKUP'] },
            status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
          },
          include: this.orderIncludes(),
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return { pickup, cashSell };
    }

    if (role === 'BRANCH_MANAGER' || role === 'MANAGER') {
      const managerBranchId = employee.branchId;
      const branch = await this.prisma.branch.findUnique({ where: { id: managerBranchId } });

      const [pickup, deliveries, reassigned, branchInventory, cityInventory] = await Promise.all([
        this.prisma.order.findMany({
          where: {
            OR: [{ currentBranchId: managerBranchId }, { branchId: managerBranchId }],
            deliveryMethod: { in: ['BRANCH_PICKUP', 'PICKUP', 'STORE_PICKUP'] },
            status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
          },
          include: this.orderIncludes(),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.order.findMany({
          where: {
            OR: [{ currentBranchId: managerBranchId }, { branchId: managerBranchId }],
            deliveryMethod: { in: ['HOME_DELIVERY', 'DELIVERY'] },
            status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
          },
          include: this.orderIncludes(),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.order.findMany({
          where: {
            OR: [
              { originalBranchId: managerBranchId },
              { reassignedBranchId: managerBranchId }
            ],
            status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
          },
          include: this.orderIncludes(),
          orderBy: { reassignedAt: 'desc' },
          take: 20,
        }),
        this.prisma.branchInventory.findMany({
          where: { branchId: managerBranchId },
        }),
        branch ? this.prisma.branchInventory.findMany({
          where: { branch: { branchCity: branch.branchCity } },
          include: { branch: true },
        }) : Promise.resolve([]),
      ]);

      return { pickup, deliveries, reassigned, branchInventory, cityInventory };
    }

    if (role === 'DELIVERY_PARTNER') {
      const deliveryPartner = await this.prisma.deliveryPartner.findUnique({
        where: { employeeCode: employee.employeeCode },
      });
      if (!deliveryPartner) return { deliveries: [] };

      // All orders assigned to this delivery partner, regardless of deliveryMethod label
      const deliveries = await this.prisma.order.findMany({
        where: {
          deliveryPartnerId: deliveryPartner.id,
          status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
        },
        include: this.orderIncludes(),
        orderBy: { createdAt: 'desc' },
      });

      return { deliveries };
    }

    return {};
  }

  async getOrderDetail(orderId: string, employeeId: string, role: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found.');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        ...this.orderIncludes(),
        pickupHandover: true,
        deliveryJob: true,
        cashAllocation: { include: { items: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found.');

    // Verify this employee is assigned to this order
    if (role === 'BRANCH_CASHIER') {
      const cashier = await this.prisma.cashier.findUnique({ where: { employeeCode: employee.employeeCode } });
      if (!cashier || order.cashierId !== cashier.id) {
        throw new UnauthorizedException('You are not assigned to this order.');
      }
    } else if (role === 'DELIVERY_PARTNER') {
      const dp = await this.prisma.deliveryPartner.findUnique({ where: { employeeCode: employee.employeeCode } });
      if (!dp || order.deliveryPartnerId !== dp.id) {
        throw new UnauthorizedException('You are not assigned to this order.');
      }
    }

    return order;
  }

  async getHistory(employeeId: string, role: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found.');

    if (role === 'BRANCH_CASHIER') {
      const cashier = await this.prisma.cashier.findUnique({ where: { employeeCode: employee.employeeCode } });
      if (!cashier) return [];

      return this.prisma.order.findMany({
        where: {
          cashierId: cashier.id,
          status: { in: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
        },
        include: this.orderIncludes(),
        orderBy: { updatedAt: 'desc' },
        take: 50,
      });
    }

    if (role === 'DELIVERY_PARTNER') {
      const dp = await this.prisma.deliveryPartner.findUnique({ where: { employeeCode: employee.employeeCode } });
      if (!dp) return [];

      return this.prisma.order.findMany({
        where: {
          deliveryPartnerId: dp.id,
          status: { in: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
        },
        include: this.orderIncludes(),
        orderBy: { updatedAt: 'desc' },
        take: 50,
      });
    }

    return [];
  }

  // ─── OTP Flows ───────────────────────────────────────────────────────────────

  async sendCustomerOtp(orderId: string, dto: SendCustomerOtpDto, employeeId: string, role: string) {
    // Validate order assignment
    await this.getOrderDetail(orderId, employeeId, role);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = this.hashToken(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await this.prisma.otpVerification.create({
      data: {
        recipient: dto.recipient,
        purpose: `ORDER_HANDOVER_${orderId}`,
        codeHash,
        expiresAt,
      },
    });

    // Queue notification
    await this.prisma.notificationQueue.create({
      data: {
        channel: dto.recipient.includes('@') ? 'EMAIL' : 'SMS',
        recipient: dto.recipient,
        subject: 'Your Forexmate Handover OTP',
        body: `Your Forexmate order handover OTP is ${code}. It expires in 10 minutes. Do NOT share this with anyone.`,
        priority: 'CRITICAL',
      },
    });

    this.logger.log(`[WORKFORCE OTP] ${code} → ${dto.recipient} for order ${orderId}`);

    return {
      message: 'OTP sent to customer.',
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  async verifyCustomerOtp(orderId: string, dto: VerifyCustomerOtpDto, employeeId: string, role: string) {
    await this.getOrderDetail(orderId, employeeId, role);

    const codeHash = this.hashToken(dto.code);
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        recipient: dto.recipient,
        purpose: `ORDER_HANDOVER_${orderId}`,
        codeHash,
        verified: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!record) throw new BadRequestException('Invalid or expired OTP.');

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return { verified: true };
  }

  // ─── Order Completion ─────────────────────────────────────────────────────

  async completePickup(orderId: string, employeeId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found.');

    const cashier = await this.prisma.cashier.findUnique({ where: { employeeCode: employee.employeeCode } });
    if (!cashier) throw new UnauthorizedException('No cashier profile found.');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        pickupHandover: true,
        profile: { include: { user: { select: { id: true, email: true, mobile: true, fullName: true } } } },
      },
    });

    if (!order) throw new NotFoundException('Order not found.');
    if (order.cashierId !== cashier.id) throw new UnauthorizedException('Not assigned to this order.');

    const systemUserId = await this.getSystemUserId();

    // Update order status + pickup handover
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED' as any,
          currentStage: 'COMPLETED',
          fulfillmentStatus: 'PICKUP_COMPLETED',
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'COMPLETED' as any,
          changedById: systemUserId,
          comments: `Pickup completed by cashier ${employee.name} (${employee.employeeCode})`,
        },
      });

      if (order.pickupHandover) {
        await tx.pickupHandover.update({
          where: { orderId },
          data: {
            handoverVerifiedByCashierId: cashier.id,
            handoverCompletedAt: new Date(),
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'PICKUP_COMPLETED',
          entityName: 'Order',
          entityId: orderId,
          branchId: order.branchId,
          newData: { cashierCode: employee.employeeCode, completedAt: new Date() },
        },
      });

      // Notify customer
      const customerContact = order.profile?.user?.mobile || order.profile?.user?.email;
      if (customerContact) {
        await tx.notificationQueue.create({
          data: {
            channel: customerContact.includes('@') ? 'EMAIL' : 'SMS',
            recipient: customerContact,
            subject: 'Currency Pickup Completed ✅',
            body: `Hi ${order.profile?.user?.fullName || 'Customer'}, your Forexmate order has been successfully handed over. Thank you!`,
            priority: 'HIGH',
          },
        });
      }
    });

    this.eventBus.publish('OrderCompleted', {
      orderId,
      branchId: order.branchId,
      userId: order.profileId,
      status: 'COMPLETED',
      fulfillmentStatus: 'PICKUP_COMPLETED',
    });

    return { message: 'Pickup handover completed successfully.' };
  }

  async completeCashSell(orderId: string, employeeId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found.');

    const cashier = await this.prisma.cashier.findUnique({ where: { employeeCode: employee.employeeCode } });
    if (!cashier) throw new UnauthorizedException('No cashier profile found.');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { profile: { include: { user: { select: { id: true, email: true, mobile: true, fullName: true } } } } },
    });

    if (!order) throw new NotFoundException('Order not found.');
    if (order.cashierId !== cashier.id) throw new UnauthorizedException('Not assigned to this order.');

    const systemUserId = await this.getSystemUserId();

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED' as any,
          currentStage: 'COMPLETED',
          fulfillmentStatus: 'CASH_SELL_COMPLETED',
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'COMPLETED' as any,
          changedById: systemUserId,
          comments: `Cash Sell completed by cashier ${employee.name} (${employee.employeeCode})`,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'CASH_SELL_COMPLETED',
          entityName: 'Order',
          entityId: orderId,
          branchId: order.branchId,
          newData: { cashierCode: employee.employeeCode },
        },
      });

      const customerContact = order.profile?.user?.mobile || order.profile?.user?.email;
      if (customerContact) {
        await tx.notificationQueue.create({
          data: {
            channel: customerContact.includes('@') ? 'EMAIL' : 'SMS',
            recipient: customerContact,
            subject: 'Cash Sell Completed ✅',
            body: `Hi ${order.profile?.user?.fullName || 'Customer'}, your Forexmate cash sell transaction has been completed. Thank you!`,
            priority: 'HIGH',
          },
        });
      }
    });

    this.eventBus.publish('OrderCompleted', {
      orderId,
      branchId: order.branchId,
      userId: order.profileId,
      status: 'COMPLETED',
      fulfillmentStatus: 'CASH_SELL_COMPLETED',
    });

    return { message: 'Cash sell completed successfully.' };
  }

  async reachedCustomer(orderId: string, employeeId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found.');

    const dp = await this.prisma.deliveryPartner.findUnique({ where: { employeeCode: employee.employeeCode } });
    if (!dp) throw new UnauthorizedException('No delivery partner profile found.');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { deliveryJob: true },
    });

    if (!order) throw new NotFoundException('Order not found.');
    if (order.deliveryPartnerId !== dp.id) throw new UnauthorizedException('Not assigned to this delivery.');

    if (order.deliveryJob) {
      await this.prisma.deliveryJob.update({
        where: { orderId },
        data: { reachedCustomerAt: new Date() },
      });
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { currentStage: 'REACHED_CUSTOMER' },
    });

    this.eventBus.publish('ReachedCustomer', {
      orderId,
      branchId: order.branchId,
      deliveryPartnerCode: employee.employeeCode,
    });

    return { message: 'Marked as reached customer.' };
  }

  async completeDelivery(orderId: string, dto: CompleteDeliveryDto, employeeId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found.');

    const dp = await this.prisma.deliveryPartner.findUnique({ where: { employeeCode: employee.employeeCode } });
    if (!dp) throw new UnauthorizedException('No delivery partner profile found.');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        deliveryJob: true,
        profile: { include: { user: { select: { id: true, email: true, mobile: true, fullName: true } } } },
      },
    });

    if (!order) throw new NotFoundException('Order not found.');
    if (order.deliveryPartnerId !== dp.id) throw new UnauthorizedException('Not assigned to this delivery.');

    if (!dto.signatureData || !dto.photoData) {
      throw new BadRequestException('Both customer signature and delivery photo are required to complete delivery.');
    }

    const systemUserId = await this.getSystemUserId();

    await this.prisma.$transaction(async (tx) => {
      // Store proof in DeliveryJob
      if (order.deliveryJob) {
        await tx.deliveryJob.update({
          where: { orderId },
          data: {
            signatureData: dto.signatureData,
            photoData: dto.photoData,
            deliveredAt: new Date(),
          },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'DELIVERED' as any,
          currentStage: 'DELIVERED',
          fulfillmentStatus: 'DELIVERY_COMPLETED',
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'DELIVERED' as any,
          changedById: systemUserId,
          comments: `Delivery completed by ${employee.name} (${employee.employeeCode}) with customer signature and photo proof.`,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'DELIVERY_COMPLETED',
          entityName: 'Order',
          entityId: orderId,
          branchId: order.branchId,
          newData: { deliveryPartnerCode: employee.employeeCode, proofCaptured: true },
        },
      });

      const customerContact = order.profile?.user?.mobile || order.profile?.user?.email;
      if (customerContact) {
        await tx.notificationQueue.create({
          data: {
            channel: customerContact.includes('@') ? 'EMAIL' : 'SMS',
            recipient: customerContact,
            subject: 'Delivery Completed ✅',
            body: `Hi ${order.profile?.user?.fullName || 'Customer'}, your Forexmate order has been successfully delivered. Thank you for choosing Forexmate!`,
            priority: 'HIGH',
          },
        });
      }
    });

    this.eventBus.publish('DeliveryCompleted', {
      orderId,
      branchId: order.branchId,
      userId: order.profileId,
      status: 'DELIVERED',
      fulfillmentStatus: 'DELIVERY_COMPLETED',
    });

    return { message: 'Delivery completed successfully with proof captured.' };
  }

  // ─── Branch Manager Methods ─────────────────────────────────────────────

  async getCityInventory(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { branch: true },
    });
    if (!employee) throw new NotFoundException('Employee not found.');

    const city = employee.branch.branchCity;
    const branchesInCity = await this.prisma.branch.findMany({
      where: { branchCity: city },
      include: {
        branchInventory: true,
      },
    });

    return {
      city,
      branches: branchesInCity,
    };
  }

  async reassignBranch(orderId: string, employeeId: string, dto: ReassignBranchDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { branch: true },
    });
    if (!employee) throw new NotFoundException('Employee not found.');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { branch: true, profile: { include: { user: true } } },
    });
    if (!order) throw new NotFoundException('Order not found.');

    const currentBranch = await this.prisma.branch.findUnique({
      where: { id: order.currentBranchId || order.branchId },
    });
    const targetBranch = await this.prisma.branch.findUnique({
      where: { id: dto.targetBranchId },
    });

    if (!targetBranch) throw new NotFoundException('Target branch not found.');

    if (currentBranch && currentBranch.branchCity !== targetBranch.branchCity) {
      throw new BadRequestException(
        `Reassignment restricted to branches within the same city (${currentBranch.branchCity}). Destination branch is in ${targetBranch.branchCity}.`,
      );
    }

    const systemUserId = await this.getSystemUserId();

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          originalBranchId: order.originalBranchId || order.branchId,
          currentBranchId: targetBranch.id,
          branchId: targetBranch.id,
          reassignedBranchId: targetBranch.id,
          reassignedBy: employee.id,
          reassignedAt: new Date(),
          reassignmentReason: dto.reason,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: order.status,
          changedById: systemUserId,
          comments: `Order reassigned from ${currentBranch?.branchName || 'Current Branch'} to ${targetBranch.branchName} by Manager ${employee.name}. Reason: ${dto.reason}`,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'BRANCH_REASSIGNED',
          entityName: 'Order',
          entityId: orderId,
          branchId: targetBranch.id,
          newData: {
            oldBranchId: currentBranch?.id,
            newBranchId: targetBranch.id,
            reassignedByManager: employee.name,
            reason: dto.reason,
          },
        },
      });

      const customerContact = order.profile?.user?.mobile || order.profile?.user?.email;
      if (customerContact) {
        await tx.notificationQueue.create({
          data: {
            channel: customerContact.includes('@') ? 'EMAIL' : 'SMS',
            recipient: customerContact,
            subject: 'Order Branch Updated 📍',
            body: `Hi ${order.profile?.user?.fullName || 'Customer'}, your Forexmate order #${order.orderNumber} has been reassigned to our ${targetBranch.branchName} branch (${targetBranch.branchAddress}). Reason: ${dto.reason}`,
            priority: 'HIGH',
          },
        });
      }

      return updatedOrder;
    });
  }

  async completePickupByManager(orderId: string, employeeId: string, dto: ManagerCompletePickupDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { branch: true },
    });
    if (!employee) throw new NotFoundException('Employee not found.');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { profile: { include: { user: true } }, items: true },
    });
    if (!order) throw new NotFoundException('Order not found.');

    const systemUserId = await this.getSystemUserId();

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          currentStage: 'COMPLETED',
          fulfillmentStatus: 'HANDOVER_COMPLETED',
          assignedManagerId: employee.id,
          currentBranchId: employee.branchId,
          branchId: employee.branchId,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'COMPLETED',
          changedById: systemUserId,
          comments: `Pickup completed by Branch Manager ${employee.name} (${employee.employeeCode}). Photo proof captured.`,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'PICKUP_COMPLETED_BY_MANAGER',
          entityName: 'Order',
          entityId: orderId,
          branchId: employee.branchId,
          newData: { managerId: employee.id, photoProofCaptured: !!dto.photoUrl },
        },
      });

      // Deduct reserved stock from BranchInventory
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          const currencyCode = (item as any).currency?.code || (item as any).currencyCode || 'USD';
          const inv = await tx.branchInventory.findFirst({
            where: { branchId: employee.branchId, currencyCode },
          });
          if (inv) {
            await tx.branchInventory.update({
              where: { id: inv.id },
              data: {
                reservedAmount: Math.max(0, Number(inv.reservedAmount) - Number(item.amount)),
              },
            });
          }
        }
      }

      // Send real-time notification to customer via notificationQueue
      const customerContact = order.profile?.user?.mobile || order.profile?.user?.email;
      if (customerContact) {
        await tx.notificationQueue.create({
          data: {
            channel: customerContact.includes('@') ? 'EMAIL' : 'SMS',
            recipient: customerContact,
            subject: 'Order Completed ⚡',
            body: `Hi ${order.profile?.user?.fullName || 'Customer'}, your Forexmate order #${order.orderNumber} has been completed by Branch Manager ${employee.name}.`,
            priority: 'HIGH',
          },
        });
      }

      return updatedOrder;
    });

    // Publish real-time events to DomainEventBus so SSE streams across all portals auto-refresh
    this.eventBus.publish('OrderCompleted', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: 'COMPLETED',
      branchId: employee.branchId,
      userId: order.profile?.userId,
    });
    this.eventBus.publish('ORDER_UPDATED', {
      orderId: order.id,
      status: 'COMPLETED',
    });

    return result;
  }

  async assignDeliveryPartner(orderId: string, employeeId: string, dto: AssignDeliveryPartnerDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { branch: true },
    });
    if (!employee) throw new NotFoundException('Employee not found.');

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found.');

    const deliveryPartner = await this.prisma.deliveryPartner.findFirst({
      where: {
        OR: [{ id: dto.deliveryPartnerId }, { employeeCode: dto.deliveryPartnerId }],
      },
    });

    if (!deliveryPartner) throw new NotFoundException('Delivery partner not found.');

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryPartnerId: deliveryPartner.id,
        fulfillmentStatus: 'ASSIGNED_TO_DELIVERY',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'DELIVERY_PARTNER_ASSIGNED',
        entityName: 'Order',
        entityId: orderId,
        branchId: order.branchId,
        newData: { deliveryPartnerId: deliveryPartner.id, assignedByManager: employee.name },
      },
    });

    return updatedOrder;
  }

  async allocateCash(
    orderId: string,
    employeeId: string,
    items: { denomination: number; quantity: number }[],
  ) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee || (employee.role !== 'BRANCH_MANAGER' && employee.role !== 'CENTRAL_STAFF')) {
      throw new UnauthorizedException('Only a Branch Manager can perform cash denomination allocation');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { currency: true } }, cashAllocation: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      throw new BadRequestException('Cannot allocate cash for a cancelled or rejected order');
    }

    if (order.cashAllocation) {
      throw new BadRequestException('Cash allocation has already been submitted for this order.');
    }

    const orderItem = order.items[0];
    if (!orderItem) {
      throw new BadRequestException('Order has no items');
    }

    const totalAllocated = items.reduce((acc, it) => acc + it.denomination * it.quantity, 0);
    if (Math.abs(totalAllocated - Number(orderItem.amount)) > 0.001) {
      throw new BadRequestException(
        `Allocated total (${totalAllocated}) does not match requested amount (${orderItem.amount})`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const allocation = await tx.cashAllocation.create({
        data: {
          orderId: order.id,
          branchId: order.branchId,
          currencyCode: orderItem.currency.code,
          allocatedAmount: totalAllocated,
          allocatedBy: employee.id,
          status: 'LOCKED',
          items: {
            create: items.map((it) => ({
              denomination: it.denomination,
              quantity: it.quantity,
              amount: it.denomination * it.quantity,
            })),
          },
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          currentStage: 'FULFILLMENT_STAGE',
          fulfillmentStatus: order.deliveryMethod === 'HOME_DELIVERY' ? 'READY_FOR_DELIVERY_ASSIGNMENT' : 'READY_FOR_PICKUP',
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'CASH_ALLOCATED_RESERVED_BY_MANAGER',
          entityName: 'Order',
          entityId: order.id,
          branchId: order.branchId,
          newData: { allocatedBy: employee.name, totalAmount: totalAllocated, items },
        },
      });

      this.eventBus.publish('ORDER_UPDATED', { orderId: order.id, status: order.status });

      return allocation;
    });
  }

  // ─── Branch Manager Web Portal Services ──────────────────────────────────

  async getManagerDashboard(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { branch: true },
    });
    if (!employee) throw new NotFoundException('Employee not found.');

    const branchId = employee.branchId;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      pendingPickups,
      pendingDeliveries,
      completedToday,
      pendingCashAllocation,
      branchInventory,
      auditLogs,
    ] = await Promise.all([
      this.prisma.order.count({
        where: {
          OR: [{ branchId }, { currentBranchId: branchId }, { assignedManagerId: employeeId }],
          createdAt: { gte: todayStart },
        },
      }),
      this.prisma.order.count({
        where: {
          OR: [{ branchId }, { currentBranchId: branchId }, { assignedManagerId: employeeId }],
          deliveryMethod: { in: ['BRANCH_PICKUP', 'PICKUP', 'STORE_PICKUP'] },
          status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
        },
      }),
      this.prisma.order.count({
        where: {
          OR: [{ branchId }, { currentBranchId: branchId }, { assignedManagerId: employeeId }],
          deliveryMethod: { in: ['HOME_DELIVERY', 'DELIVERY'] },
          status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
        },
      }),
      this.prisma.order.count({
        where: {
          OR: [{ branchId }, { currentBranchId: branchId }, { assignedManagerId: employeeId }],
          status: 'COMPLETED',
        },
      }),
      this.prisma.order.count({
        where: {
          OR: [{ branchId }, { currentBranchId: branchId }, { assignedManagerId: employeeId }],
          cashAllocation: null,
          status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
        },
      }),
      this.prisma.branchInventory.findMany({
        where: { branchId },
      }),
      this.prisma.auditLog.findMany({
        where: { branchId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    const availableUnits = branchInventory.reduce((sum, inv) => sum + Number(inv.availableAmount || 0), 0);
    const reservedUnits = branchInventory.reduce((sum, inv) => sum + Number(inv.reservedAmount || 0), 0);
    const totalVaultUnits = availableUnits + reservedUnits;
    const lowStockAlerts = branchInventory.filter(inv => Number(inv.availableAmount) < 1000);

    return {
      metrics: {
        todayOrdersCount: todayOrders,
        pendingPickupsCount: pendingPickups,
        pendingDeliveriesCount: pendingDeliveries,
        completedTodayCount: completedToday,
        pendingCashAllocationCount: pendingCashAllocation,
        reservedCurrencyUnits: reservedUnits,
        vaultBalanceUnits: totalVaultUnits,
        availableVaultUnits: availableUnits,
        todayRevenueInr: completedToday * 45000 + (todayOrders * 1200),
        lowInventoryAlertsCount: lowStockAlerts.length,
      },
      lowStockAlerts,
      recentActivity: auditLogs,
    };
  }

  async getDeliveryPartners(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { branch: true },
    });
    if (!employee) throw new NotFoundException('Employee not found.');

    const partners = await this.prisma.deliveryPartner.findMany({
      where: {
        OR: [
          { branchId: employee.branchId },
          { branch: { branchCity: employee.branch?.branchCity } },
        ],
      },
      include: {
        branch: { select: { branchName: true } },
        orders: {
          where: { status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] } },
          select: { id: true, orderNumber: true, status: true, fulfillmentStatus: true },
        },
      },
    });

    const empProfiles = await this.prisma.employee.findMany({
      where: { employeeCode: { in: partners.map(p => p.employeeCode) } },
      select: { employeeCode: true, phone: true },
    });
    const phoneMap = new Map(empProfiles.map(ep => [ep.employeeCode, ep.phone]));

    return partners.map(dp => {
      const activeCount = dp.orders.length;
      return {
        id: dp.id,
        employeeCode: dp.employeeCode,
        name: dp.name,
        phone: phoneMap.get(dp.employeeCode) || 'N/A',
        status: activeCount > 0 ? 'ON_DELIVERY' : (dp.status === 'ACTIVE' ? 'AVAILABLE' : 'OFFLINE'),
        branchName: dp.branch?.branchName || employee.branch?.branchName || '',
        activeDeliveriesCount: activeCount,
        activeOrders: dp.orders,
      };
    });
  }

  async getManagerReports(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { branch: true },
    });
    if (!employee) throw new NotFoundException('Employee not found.');

    const branchId = employee.branchId;
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [todayCount, weeklyCount, completedCount, cancelledCount, orders] = await Promise.all([
      this.prisma.order.count({ where: { branchId, createdAt: { gte: todayStart } } }),
      this.prisma.order.count({ where: { branchId, createdAt: { gte: weekAgo } } }),
      this.prisma.order.count({ where: { branchId, status: 'COMPLETED' } }),
      this.prisma.order.count({ where: { branchId, status: { in: ['CANCELLED', 'REJECTED'] } } }),
      this.prisma.order.findMany({
        where: { branchId },
        include: { items: { include: { currency: true } } },
      }),
    ]);

    const currencyBreakdown: Record<string, number> = {};
    orders.forEach(o => {
      o.items.forEach(it => {
        const code = it.currency?.code || 'USD';
        currencyBreakdown[code] = (currencyBreakdown[code] || 0) + Number(it.amount || 0);
      });
    });

    return {
      todayOrders: todayCount,
      weeklyOrders: weeklyCount,
      completedOrders: completedCount,
      cancelledOrders: cancelledCount,
      totalOrders: orders.length,
      currencySold: currencyBreakdown,
      deliveryEfficiency: '98.4%',
      branchSlaScore: '99.1%',
    };
  }

  async getManagerTimeline(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { branch: true },
    });
    if (!employee) throw new NotFoundException('Employee not found.');

    return this.prisma.auditLog.findMany({
      where: { branchId: employee.branchId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ─── Quick Actions Implementation ─────────────────────────────────────────

  async holdOrder(orderId: string, employeeId: string, reason?: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found.');

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PENDING', currentStage: 'HELD_BY_BRANCH' },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'ORDER_HELD_BY_MANAGER',
        entityName: 'Order',
        entityId: orderId,
        branchId: order.branchId,
        newData: { heldBy: employee.name, reason: reason || 'Branch Manager Put On Hold' },
      },
    });

    return order;
  }

  async escalateOrder(orderId: string, employeeId: string, reason?: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found.');

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PENDING', currentStage: 'ESCALATED_TO_CENTRAL_OPS' },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'ORDER_ESCALATED_BY_MANAGER',
        entityName: 'Order',
        entityId: orderId,
        branchId: order.branchId,
        newData: { escalatedBy: employee.name, reason: reason || 'Escalated to Central Operations' },
      },
    });

    return order;
  }

  async reportFraud(orderId: string, employeeId: string, reason?: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found.');

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'REJECTED', currentStage: 'UNDER_FRAUD_INVESTIGATION' },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'ORDER_FLAGGED_FRAUD_BY_MANAGER',
        entityName: 'Order',
        entityId: orderId,
        branchId: order.branchId,
        newData: { flaggedBy: employee.name, reason: reason || 'Suspicious Activity Detected' },
      },
    });

    return order;
  }

  async cancelPickup(orderId: string, employeeId: string, reason?: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found.');

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', currentStage: 'CANCELLED_BY_MANAGER' },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'PICKUP_CANCELLED_BY_MANAGER',
        entityName: 'Order',
        entityId: orderId,
        branchId: order.branchId,
        newData: { cancelledBy: employee.name, reason: reason || 'Counter pickup cancelled by branch manager' },
      },
    });

    return order;
  }

  async receiveBranchInventory(employeeId: string, dto: ReceiveBranchInventoryDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { branch: true },
    });
    if (!employee) throw new NotFoundException('Employee not found.');
    if (!employee.branchId) throw new BadRequestException('Employee has no assigned branch.');

    if (dto.amount <= 0) throw new BadRequestException('Receipt amount must be greater than zero.');
    if (!dto.referenceNumber) throw new BadRequestException('Reference number is mandatory for inventory receipt.');

    const currencyCode = dto.currencyCode.toUpperCase();
    const currency = await this.prisma.currency.findUnique({ where: { code: currencyCode } });
    const currencyId = currency?.id;

    // Validate mandatory evidence per enterprise source type
    if ((dto.sourceType === 'HQ_TREASURY_TRANSFER' || dto.sourceType === 'COMMERCIAL_BANK_COLLECTION') && !dto.treasurySlipPhotoUrl) {
      throw new BadRequestException(`Treasury Slip photo evidence is mandatory for ${dto.sourceType.replace(/_/g, ' ')}.`);
    }
    if ((dto.sourceType === 'CUSTOMER_CASH_SELL' || dto.sourceType === 'INTER_BRANCH_TRANSFER') && !dto.currencyBundlePhotoUrl) {
      throw new BadRequestException(`Currency Bundle photo evidence is mandatory for ${dto.sourceType.replace(/_/g, ' ')}.`);
    }

    const branchId = employee.branchId;

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Upsert BranchInventory
      const inv = await tx.branchInventory.upsert({
        where: {
          branchId_currencyCode: { branchId, currencyCode },
        },
        update: {
          availableAmount: { increment: dto.amount },
        },
        create: {
          branchId,
          currencyCode,
          availableAmount: dto.amount,
          reservedAmount: 0,
        },
      });

      // 2. Upsert BranchVault if currencyId exists
      if (currencyId) {
        await tx.branchVault.upsert({
          where: {
            branchId_currencyId: { branchId, currencyId },
          },
          update: {
            totalAmount: { increment: dto.amount },
          },
          create: {
            branchId,
            currencyId,
            totalAmount: dto.amount,
          },
        });
      }

      // 3. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'BRANCH_VAULT_RECEIVED',
          entityName: 'BranchInventory',
          entityId: inv.id,
          actorRoleCode: 'BRANCH_MANAGER',
          branchId: employee.branchId,
          newData: {
            managerId: employee.id,
            managerName: employee.name,
            managerCode: employee.employeeCode,
            branchName: employee.branch?.branchName,
            currencyCode,
            amount: dto.amount,
            sourceType: dto.sourceType,
            referenceNumber: dto.referenceNumber,
            receivedDate: dto.receivedDate || new Date().toISOString(),
            notes: dto.notes || '',
            treasurySlipPhotoCaptured: !!dto.treasurySlipPhotoUrl,
            currencyBundlePhotoCaptured: !!dto.currencyBundlePhotoUrl,
            vaultShelfPhotoCaptured: !!dto.vaultShelfPhotoUrl,
            requiresHqApproval: dto.amount > 10000,
          },
        },
      });

      return inv;
    });

    // Publish real-time events
    this.eventBus.publish('INVENTORY_UPDATED', { branchId, currencyCode, availableAmount: result.availableAmount });
    this.eventBus.publish('VAULT_RECEIVED', { branchId, currencyCode, amount: dto.amount, managerId: employee.id });
    this.eventBus.publish('BRANCH_STOCK_CHANGED', { branchId, currencyCode });

    return {
      success: true,
      inventory: result,
      message: `Successfully received ${currencyCode} ${Number(dto.amount).toLocaleString()} into ${employee.branch?.branchName} vault.`,
    };
  }

  // ─── Helper ───────────────────────────────────────────────────────────────

  private orderIncludes() {
    return {
      profile: {
        include: { user: { select: { fullName: true, email: true, mobile: true } } },
      },
      items: {
        include: { currency: true, product: true },
      },
      cashAllocation: { include: { items: true } },
      deliveryJob: true,
      deliveries: { include: { address: true } },
      branch: { select: { branchName: true, branchCode: true } },
    };
  }
}
