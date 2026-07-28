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
var InvoiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const domain_event_bus_service_1 = require("../common/event-bus/domain-event-bus.service");
const notification_service_1 = require("../notification/notification.service");
let InvoiceService = InvoiceService_1 = class InvoiceService {
    prisma;
    eventBus;
    notificationService;
    logger = new common_1.Logger(InvoiceService_1.name);
    constructor(prisma, eventBus, notificationService) {
        this.prisma = prisma;
        this.eventBus = eventBus;
        this.notificationService = notificationService;
    }
    onModuleInit() {
        this.eventBus.ofEvent('PaymentCompleted').subscribe({
            next: async (event) => {
                try {
                    await this.generateInvoiceAndReceipt(event.payload);
                }
                catch (err) {
                    this.logger.error(`Failed to handle PaymentCompleted for order ${event.payload?.orderId}: ${err.message}`, err.stack);
                }
            },
        });
    }
    async generateInvoiceAndReceipt(payload) {
        const { orderId, userId, paymentId, amount, order } = payload;
        this.logger.log(`[InvoiceService] Generating invoice for Order ID: ${orderId}`);
        const orderDetails = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { profile: { include: { user: true } } },
        });
        if (!orderDetails) {
            this.logger.error(`Order not found for ID: ${orderId}`);
            return;
        }
        const netAmount = orderDetails.totalAmountInr;
        await this.prisma.$transaction(async (tx) => {
            const existingInvoice = await tx.invoice.findFirst({
                where: { orderId },
            });
            if (existingInvoice) {
                this.logger.log(`Invoice already exists for Order ${orderId}. Skipping creation.`);
                return;
            }
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
            await tx.invoiceReceipt.create({
                data: {
                    invoiceId: invoice.id,
                    receiptNo: `REC-${Date.now()}`,
                    amountPaid: netAmount,
                    paymentMode: orderDetails.deliveryMethod === 'HOME_DELIVERY' ? 'PAY_ON_DELIVERY' : 'PAY_AT_BRANCH',
                },
            });
            await tx.inAppNotification.create({
                data: {
                    userId: orderDetails.profile.userId,
                    title: 'Payment Confirmed & Invoice Generated',
                    message: `Your payment of ₹${Number(netAmount).toLocaleString('en-IN')} has been verified. Invoice ${invoice.invoiceNumber} is now available in your dashboard.`,
                    orderId,
                    actionUrl: `/dashboard/orders/${orderId}`,
                },
            });
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
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = InvoiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        domain_event_bus_service_1.DomainEventBus,
        notification_service_1.NotificationService])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map