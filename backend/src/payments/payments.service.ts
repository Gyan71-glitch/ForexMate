import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitializePaymentDto, ConfirmPaymentDto } from './dto/payment.dto';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { activateBranchWorkflow } from '../common/utils/workflow';
import { NotificationService } from '../notification/notification.service';
import { DomainEventBus } from '../common/event-bus/domain-event-bus.service';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly eventBus: DomainEventBus,
  ) {}

  async getProviders() {
    let mockP = await this.prisma.paymentProvider.findFirst({ where: { name: 'MOCK_GATEWAY' } });
    if (!mockP) {
      mockP = await this.prisma.paymentProvider.create({ data: { name: 'MOCK_GATEWAY', isActive: true } });
    }

    let rzpP = await this.prisma.paymentProvider.findFirst({ where: { name: 'RAZORPAY' } });
    if (!rzpP) {
      rzpP = await this.prisma.paymentProvider.create({ data: { name: 'RAZORPAY', isActive: true } });
    }

    return [mockP, rzpP];
  }

  async initializePayment(userId: string, dto: InitializePaymentDto) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new BadRequestException('User profile not found');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.profileId !== profile.id) {
      throw new ForbiddenException('Order belongs to a different user');
    }

    if (order.status !== 'PENDING' && order.status !== 'PAYMENT_PENDING') {
      throw new BadRequestException('Can only pay for PENDING or PAYMENT_PENDING orders');
    }

    const provider = await this.prisma.paymentProvider.findUnique({
      where: { id: dto.providerId }
    });

    if (!provider || !provider.isActive) {
      throw new BadRequestException('Invalid or inactive payment provider');
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_MockKey12345';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'MockKeySecret12345';

    if (provider.name === 'RAZORPAY') {
      try {
        const razorpayInstance = new (Razorpay as any)({
          key_id: keyId,
          key_secret: keySecret
        });

        const rzpOrder = await razorpayInstance.orders.create({
          amount: Math.round(order.totalAmountInr.toNumber() * 100), // in paise
          currency: 'INR',
          receipt: `receipt_order_${order.orderNumber}`
        });

        return this.prisma.$transaction(async (tx) => {
          const payment = await tx.payment.create({
            data: {
              orderId: order.id,
              amount: order.totalAmountInr,
              status: PaymentStatus.PENDING,
              providerId: provider.id
            }
          });

          const attempt = await tx.paymentAttempt.create({
            data: {
              paymentId: payment.id,
              status: PaymentStatus.PENDING
            }
          });

          return {
            paymentId: payment.id,
            attemptId: attempt.id,
            amountInr: order.totalAmountInr,
            gatewayOptions: {
              key: keyId,
              gatewayOrderId: rzpOrder.id
            }
          };
        });
      } catch (err) {
        this.logger.error('Failed to create Razorpay Order via SDK, falling back to mock Order ID', err);
      }
    }

    // Default mock gateway fallback
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalAmountInr,
          status: PaymentStatus.PENDING,
          providerId: provider.id
        }
      });

      const attempt = await tx.paymentAttempt.create({
        data: {
          paymentId: payment.id,
          status: PaymentStatus.PENDING
        }
      });

      return {
        paymentId: payment.id,
        attemptId: attempt.id,
        amountInr: order.totalAmountInr,
        gatewayOptions: {
          key: 'mock_api_key',
          gatewayOrderId: `pay_mock_${Date.now()}`
        }
      };
    });
  }

  async confirmPayment(paymentId: string, dto: ConfirmPaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { include: { profile: true } } }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('Payment is already completed');
    }

    // Secure Signature Verification for Razorpay
    if (dto.razorpayOrderId && dto.razorpaySignature) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET || 'MockKeySecret12345';
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(dto.razorpayOrderId + '|' + dto.gatewayTxnId)
        .digest('hex');

      if (generatedSignature !== dto.razorpaySignature) {
        this.logger.error(`Signature verification failed: generated ${generatedSignature} vs received ${dto.razorpaySignature}`);
        throw new BadRequestException('Payment signature verification failed');
      }
      this.logger.log(`Razorpay signature successfully verified for Order ${payment.order.orderNumber}`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Update Payment
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.SUCCESS }
      });

      // 2. Update PaymentAttempt
      await tx.paymentAttempt.updateMany({
        where: { paymentId, status: PaymentStatus.PENDING },
        data: {
          status: PaymentStatus.SUCCESS,
          gatewayTxnId: dto.gatewayTxnId
        }
      });

      // 3. Update Order Status
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAYMENT_COMPLETED }
      });

      // 3.5 Activate Branch Workflow Tasks
      await activateBranchWorkflow(payment.orderId, tx);

      // 4. Create History
      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: OrderStatus.PAYMENT_COMPLETED,
          changedById: payment.order.profile.userId,
          comments: `Payment completed via gateway Txn ID: ${dto.gatewayTxnId}`
        }
      });

      await tx.auditLog.create({
        data: {
          userId: payment.order.profile.userId,
          action: 'PAYMENT_SUCCESS',
          entityName: 'Payment',
          entityId: paymentId,
          newData: { amount: payment.amount, status: PaymentStatus.SUCCESS }
        }
      });

      return {
        success: true,
        message: 'Payment confirmed successfully',
        orderId: payment.orderId
      };
    });

    // Trigger notification async
    this.notificationService.notifyBranchOnPayment(payment.orderId);

    // Publish event
    this.eventBus.publish('PaymentCompleted', {
      orderId: payment.orderId,
      userId: payment.order.profile.userId,
      branchId: payment.order.branchId,
      paymentId,
      amount: payment.amount,
      order: payment.order,
    });

    return result;
  }
}

