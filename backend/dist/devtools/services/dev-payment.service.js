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
exports.DevPaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notification_service_1 = require("../../notification/notification.service");
const workflow_1 = require("../../common/utils/workflow");
let DevPaymentService = class DevPaymentService {
    prisma;
    notificationService;
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    async mockPayOrder(orderId, scenario) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payments: true, profile: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        let provider = await this.prisma.paymentProvider.findFirst({
            where: { name: 'MOCK_GATEWAY' },
        });
        if (!provider) {
            provider = await this.prisma.paymentProvider.create({
                data: { name: 'MOCK_GATEWAY', isActive: true },
            });
        }
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
                        status: client_1.PaymentStatus.SUCCESS,
                        providerId: provider.id,
                    },
                });
                await this.prisma.paymentAttempt.create({
                    data: {
                        paymentId: payment.id,
                        status: client_1.PaymentStatus.SUCCESS,
                        gatewayTxnId: `mock_success_${Date.now()}`,
                    },
                });
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: client_1.OrderStatus.PAYMENT_COMPLETED },
                });
                await (0, workflow_1.activateBranchWorkflow)(orderId, this.prisma);
                await this.prisma.orderStatusHistory.create({
                    data: {
                        orderId,
                        status: client_1.OrderStatus.PAYMENT_COMPLETED,
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
                        newData: { amount: order.totalAmountInr, status: client_1.PaymentStatus.SUCCESS }
                    }
                });
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
                        status: client_1.PaymentStatus.FAILED,
                        providerId: provider.id,
                    },
                });
                await this.prisma.paymentAttempt.create({
                    data: {
                        paymentId: payment.id,
                        status: client_1.PaymentStatus.FAILED,
                        gatewayTxnId: `mock_fail_${Date.now()}`,
                    },
                });
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: client_1.OrderStatus.PAYMENT_PENDING },
                });
                await this.prisma.orderStatusHistory.create({
                    data: {
                        orderId,
                        status: client_1.OrderStatus.PAYMENT_PENDING,
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
                        status: client_1.PaymentStatus.PENDING,
                        providerId: provider.id,
                    },
                });
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: client_1.OrderStatus.PAYMENT_PENDING },
                });
                break;
            }
            case 'TIMEOUT': {
                const payment = await this.prisma.payment.create({
                    data: {
                        orderId: order.id,
                        amount: order.totalAmountInr,
                        status: client_1.PaymentStatus.TIMEOUT,
                        providerId: provider.id,
                    },
                });
                await this.prisma.paymentAttempt.create({
                    data: {
                        paymentId: payment.id,
                        status: client_1.PaymentStatus.TIMEOUT,
                        gatewayTxnId: `mock_timeout_${Date.now()}`,
                    },
                });
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: client_1.OrderStatus.CANCELLED },
                });
                await this.prisma.orderStatusHistory.create({
                    data: {
                        orderId,
                        status: client_1.OrderStatus.CANCELLED,
                        changedById: order.profile.userId,
                        comments: 'Simulated payment TIMEOUT gateway response. Order automatically marked cancelled.',
                    },
                });
                break;
            }
            case 'CANCELLED': {
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: client_1.OrderStatus.CANCELLED },
                });
                await this.prisma.orderStatusHistory.create({
                    data: {
                        orderId,
                        status: client_1.OrderStatus.CANCELLED,
                        changedById: order.profile.userId,
                        comments: 'Simulated customer canceled transaction.',
                    },
                });
                break;
            }
            case 'REFUNDED': {
                const payment = await this.prisma.payment.create({
                    data: {
                        orderId: order.id,
                        amount: order.totalAmountInr,
                        status: client_1.PaymentStatus.SUCCESS,
                        providerId: provider.id,
                    },
                });
                await this.prisma.paymentAttempt.create({
                    data: {
                        paymentId: payment.id,
                        status: client_1.PaymentStatus.SUCCESS,
                        gatewayTxnId: `mock_refund_base_${Date.now()}`,
                    },
                });
                await this.prisma.refund.create({
                    data: {
                        paymentId: payment.id,
                        refundId: `ref_mock_${Date.now()}`,
                        amount: order.totalAmountInr,
                        status: client_1.PaymentStatus.REFUNDED,
                    },
                });
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: client_1.OrderStatus.CANCELLED },
                });
                await this.prisma.orderStatusHistory.create({
                    data: {
                        orderId,
                        status: client_1.OrderStatus.CANCELLED,
                        changedById: order.profile.userId,
                        comments: 'Simulated payment REFUNDED webhook received.',
                    },
                });
                break;
            }
            case 'DUPLICATE': {
                const pay1 = await this.prisma.payment.create({
                    data: {
                        orderId: order.id,
                        amount: order.totalAmountInr,
                        status: client_1.PaymentStatus.SUCCESS,
                        providerId: provider.id,
                    },
                });
                await this.prisma.paymentAttempt.create({
                    data: {
                        paymentId: pay1.id,
                        status: client_1.PaymentStatus.SUCCESS,
                        gatewayTxnId: `mock_dup_1_${Date.now()}`,
                    },
                });
                const pay2 = await this.prisma.payment.create({
                    data: {
                        orderId: order.id,
                        amount: order.totalAmountInr,
                        status: client_1.PaymentStatus.SUCCESS,
                        providerId: provider.id,
                    },
                });
                await this.prisma.paymentAttempt.create({
                    data: {
                        paymentId: pay2.id,
                        status: client_1.PaymentStatus.SUCCESS,
                        gatewayTxnId: `mock_dup_2_${Date.now()}`,
                    },
                });
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: client_1.OrderStatus.PAYMENT_COMPLETED },
                });
                break;
            }
            case 'WEBHOOK_FAILURE': {
                const payment = await this.prisma.payment.create({
                    data: {
                        orderId: order.id,
                        amount: order.totalAmountInr,
                        status: client_1.PaymentStatus.SUCCESS,
                        providerId: provider.id,
                    },
                });
                await this.prisma.paymentAttempt.create({
                    data: {
                        paymentId: payment.id,
                        status: client_1.PaymentStatus.SUCCESS,
                        gatewayTxnId: `mock_webhook_fail_${Date.now()}`,
                    },
                });
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: client_1.OrderStatus.PAYMENT_PENDING },
                });
                await this.prisma.orderStatusHistory.create({
                    data: {
                        orderId,
                        status: client_1.OrderStatus.PAYMENT_PENDING,
                        changedById: order.profile.userId,
                        comments: 'Webhook failed to process. Order is PAYMENT_PENDING but gateway captured payment.',
                    },
                });
                break;
            }
            default:
                throw new common_1.BadRequestException(`Unknown payment scenario: ${scenario}`);
        }
        const updatedOrder = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: { status: true },
        });
        if (updatedOrder && updatedOrder.status === client_1.OrderStatus.PAYMENT_COMPLETED) {
            await this.notificationService.notifyBranchOnPayment(orderId);
        }
        return { success: true, scenario, orderId };
    }
};
exports.DevPaymentService = DevPaymentService;
exports.DevPaymentService = DevPaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], DevPaymentService);
//# sourceMappingURL=dev-payment.service.js.map