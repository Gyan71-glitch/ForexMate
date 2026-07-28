import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DomainEventBus } from '../common/event-bus/domain-event-bus.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class InvoiceService implements OnModuleInit {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: DomainEventBus,
    private readonly notificationService: NotificationService,
  ) {}

  onModuleInit() {
    // Subscribe to PaymentCompleted event
    this.eventBus.ofEvent('PaymentCompleted').subscribe({
      next: async (event) => {
        try {
          await this.generateInvoiceAndReceipt(event.payload);
        } catch (err: any) {
          this.logger.error(`Failed to handle PaymentCompleted for order ${event.payload?.orderId}: ${err.message}`, err.stack);
        }
      },
    });
  }

  private async generateInvoiceAndReceipt(payload: any) {
    const { orderId, userId, paymentId, amount, order } = payload;
    this.logger.log(`[InvoiceService] Generating invoice for Order ID: ${orderId}`);

    // Fetch complete order details if not fully present
    const orderDetails = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { profile: { include: { user: true } } },
    });

    if (!orderDetails) {
      this.logger.error(`Order not found for ID: ${orderId}`);
      return;
    }

    const netAmount = orderDetails.totalAmountInr;

    // Create Invoice and InvoiceReceipt inside database transaction
    await this.prisma.$transaction(async (tx) => {
      // 1. Check if invoice already exists to ensure idempotency
      const existingInvoice = await tx.invoice.findFirst({
        where: { orderId },
      });

      if (existingInvoice) {
        this.logger.log(`Invoice already exists for Order ${orderId}. Skipping creation.`);
        return;
      }

      // 2. Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          orderId,
          invoiceNumber: `INV-${Date.now()}`,
          netAmount,
          items: {
            create: {
              description: `Foreign Currency Exchange Purchase for Order #${orderDetails.orderNumber}`,
              amount: netAmount,
            },
          },
        },
      });

      // 3. Create Receipt
      await tx.invoiceReceipt.create({
        data: {
          invoiceId: invoice.id,
          receiptNo: `REC-${Date.now()}`,
          amountPaid: netAmount,
          paymentMode: orderDetails.deliveryMethod === 'HOME_DELIVERY' ? 'PAY_ON_DELIVERY' : 'PAY_AT_BRANCH',
        },
      });

      // 4. Create customer in-app notification
      await tx.inAppNotification.create({
        data: {
          userId: orderDetails.profile.userId,
          title: 'Payment Confirmed & Invoice Generated',
          message: `Your payment of ₹${Number(netAmount).toLocaleString('en-IN')} has been verified. Invoice ${invoice.invoiceNumber} is now available in your dashboard.`,
          orderId,
          actionUrl: `/dashboard/orders/${orderId}`,
        },
      });

      // 5. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: orderDetails.profile.userId,
          action: 'INVOICE_GENERATED',
          entityName: 'Invoice',
          entityId: invoice.id,
          newData: { invoiceNumber: invoice.invoiceNumber, amount: netAmount },
        },
      });
    });

    // 6. Send email notification asynchronously
    const customerEmail = orderDetails.profile.user.email;
    if (customerEmail) {
      const emailSubject = `Forexmate Order Confirmation - INV Generated for Order #${orderDetails.orderNumber}`;
      const emailBody = `Dear ${orderDetails.profile.user.fullName || 'Customer'},\n\n` +
        `We have verified your payment of ₹${Number(netAmount).toLocaleString('en-IN')} for Order #${orderDetails.orderNumber}.\n` +
        `Your invoice and transaction receipt have been successfully generated and are attached to your account dashboard.\n\n` +
        `Our branch staff is preparing your foreign currency notes/card and will coordinate fulfillment shortly.\n\n` +
        `Best regards,\n` +
        `Forexmate Operations Team`;
      
      await this.notificationService.sendEmail(customerEmail, emailSubject, emailBody);
    }
  }
}
