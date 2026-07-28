import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { NotificationService } from '../../notification/notification.service';
import { activateBranchWorkflow } from '../../common/utils/workflow';

@Injectable()
export class DevPaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async mockPayOrder(orderId: string, scenario: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true, profile: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Find or create default MOCK gateway provider
    let provider = await this.prisma.paymentProvider.findFirst({
      where: { name: 'MOCK_GATEWAY' },
    });

    if (!provider) {
      provider = await this.prisma.paymentProvider.create({
        data: { name: 'MOCK_GATEWAY', isActive: true },
      });
    }

    // Remove existing payments for clean scenario execution
    await this.prisma.paymentAttempt.deleteMany({
      where: { payment: { orderId } },
    });
    await this.prisma.payment.deleteMany({
      where: { orderId },
    });

    switch (scenario) {
      case 'SUCCESS': {
        const payment = await this.prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.totalAmountInr,
            status: PaymentStatus.SUCCESS,
            providerId: provider.id,
          },
        });

        await this.prisma.paymentAttempt.create({
          data: {
            paymentId: payment.id,
            status: PaymentStatus.SUCCESS,
            gatewayTxnId: `mock_success_${Date.now()}`,
          },
        });

        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PAYMENT_COMPLETED },
        });

        // Activate branch tasks
        await activateBranchWorkflow(orderId, this.prisma);

        await this.prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: OrderStatus.PAYMENT_COMPLETED,
            changedById: order.profile.userId,
            comments: 'Simulated payment SUCCESS webhook processed.',
          },
        });

        await this.prisma.auditLog.create({
          data: {
            userId: order.profile.userId,
            action: 'PAYMENT_SUCCESS',
            entityName: 'Payment',
            entityId: payment.id,
            newData: { amount: order.totalAmountInr, status: PaymentStatus.SUCCESS }
          }
        });

        // Generate Invoice and Receipt
        const invoice = await this.prisma.invoice.create({
          data: {
            orderId,
            invoiceNumber: `INV-${Date.now()}`,
            netAmount: order.totalAmountInr,
            items: {
              create: {
                description: 'Currency Exchange',
                amount: order.totalAmountInr
              }
            }
          }
        });

        await this.prisma.invoiceReceipt.create({
          data: {
            invoiceId: invoice.id,
            receiptNo: `REC-${Date.now()}`,
            amountPaid: order.totalAmountInr,
            paymentMode: 'MOCK_GATEWAY'
          }
        });
        break;
      }

      case 'FAILURE': {
        const payment = await this.prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.totalAmountInr,
            status: PaymentStatus.FAILED,
            providerId: provider.id,
          },
        });

        await this.prisma.paymentAttempt.create({
          data: {
            paymentId: payment.id,
            status: PaymentStatus.FAILED,
            gatewayTxnId: `mock_fail_${Date.now()}`,
          },
        });

        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PAYMENT_PENDING },
        });

        await this.prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: OrderStatus.PAYMENT_PENDING,
            changedById: order.profile.userId,
            comments: 'Simulated payment FAILED gateway response.',
          },
        });
        break;
      }

      case 'PENDING': {
        await this.prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.totalAmountInr,
            status: PaymentStatus.PENDING,
            providerId: provider.id,
          },
        });

        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PAYMENT_PENDING },
        });
        break;
      }

      case 'TIMEOUT': {
        const payment = await this.prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.totalAmountInr,
            status: PaymentStatus.TIMEOUT,
            providerId: provider.id,
          },
        });

        await this.prisma.paymentAttempt.create({
          data: {
            paymentId: payment.id,
            status: PaymentStatus.TIMEOUT,
            gatewayTxnId: `mock_timeout_${Date.now()}`,
          },
        });

        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
        });

        await this.prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: OrderStatus.CANCELLED,
            changedById: order.profile.userId,
            comments: 'Simulated payment TIMEOUT gateway response. Order automatically marked cancelled.',
          },
        });
        break;
      }

      case 'CANCELLED': {
        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
        });

        await this.prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: OrderStatus.CANCELLED,
            changedById: order.profile.userId,
            comments: 'Simulated customer canceled transaction.',
          },
        });
        break;
      }

      case 'REFUNDED': {
        // Create successful payment
        const payment = await this.prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.totalAmountInr,
            status: PaymentStatus.SUCCESS,
            providerId: provider.id,
          },
        });

        await this.prisma.paymentAttempt.create({
          data: {
            paymentId: payment.id,
            status: PaymentStatus.SUCCESS,
            gatewayTxnId: `mock_refund_base_${Date.now()}`,
          },
        });

        // Add refund row
        await this.prisma.refund.create({
          data: {
            paymentId: payment.id,
            refundId: `ref_mock_${Date.now()}`,
            amount: order.totalAmountInr,
            status: PaymentStatus.REFUNDED,
          },
        });

        // Set order status
        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
        });

        await this.prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: OrderStatus.CANCELLED,
            changedById: order.profile.userId,
            comments: 'Simulated payment REFUNDED webhook received.',
          },
        });
        break;
      }

      case 'DUPLICATE': {
        // Create TWO success payments for double-capture check
        const pay1 = await this.prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.totalAmountInr,
            status: PaymentStatus.SUCCESS,
            providerId: provider.id,
          },
        });
        await this.prisma.paymentAttempt.create({
          data: {
            paymentId: pay1.id,
            status: PaymentStatus.SUCCESS,
            gatewayTxnId: `mock_dup_1_${Date.now()}`,
          },
        });

        const pay2 = await this.prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.totalAmountInr,
            status: PaymentStatus.SUCCESS,
            providerId: provider.id,
          },
        });
        await this.prisma.paymentAttempt.create({
          data: {
            paymentId: pay2.id,
            status: PaymentStatus.SUCCESS,
            gatewayTxnId: `mock_dup_2_${Date.now()}`,
          },
        });

        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PAYMENT_COMPLETED },
        });
        break;
      }

      case 'WEBHOOK_FAILURE': {
        // Simulate gateway success but webhook not reaching backend:
        // Payment succeeded on gateway, but order remains PAYMENT_PENDING.
        const payment = await this.prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.totalAmountInr,
            status: PaymentStatus.SUCCESS,
            providerId: provider.id,
          },
        });

        await this.prisma.paymentAttempt.create({
          data: {
            paymentId: payment.id,
            status: PaymentStatus.SUCCESS,
            gatewayTxnId: `mock_webhook_fail_${Date.now()}`,
          },
        });

        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PAYMENT_PENDING },
        });

        await this.prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: OrderStatus.PAYMENT_PENDING,
            changedById: order.profile.userId,
            comments: 'Webhook failed to process. Order is PAYMENT_PENDING but gateway captured payment.',
          },
        });
        break;
      }

      default:
        throw new BadRequestException(`Unknown payment scenario: ${scenario}`);
    }

    // Check if the order is now paid
    const updatedOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    if (updatedOrder && updatedOrder.status === OrderStatus.PAYMENT_COMPLETED) {
      await this.notificationService.notifyBranchOnPayment(orderId);
    }

    return { success: true, scenario, orderId };
  }
}
