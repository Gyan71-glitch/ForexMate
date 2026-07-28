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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const workflow_1 = require("../common/utils/workflow");
const notification_service_1 = require("../notification/notification.service");
const domain_event_bus_service_1 = require("../common/event-bus/domain-event-bus.service");
const crypto = __importStar(require("crypto"));
const Razorpay = require('razorpay');
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    notificationService;
    eventBus;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(prisma, notificationService, eventBus) {
        this.prisma = prisma;
        this.notificationService = notificationService;
        this.eventBus = eventBus;
    }
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
    async initializePayment(userId, dto) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId }
        });
        if (!profile) {
            throw new common_1.BadRequestException('User profile not found');
        }
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.profileId !== profile.id) {
            throw new common_1.ForbiddenException('Order belongs to a different user');
        }
        if (order.status !== 'PENDING' && order.status !== 'PAYMENT_PENDING') {
            throw new common_1.BadRequestException('Can only pay for PENDING or PAYMENT_PENDING orders');
        }
        const provider = await this.prisma.paymentProvider.findUnique({
            where: { id: dto.providerId }
        });
        if (!provider || !provider.isActive) {
            throw new common_1.BadRequestException('Invalid or inactive payment provider');
        }
        const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_MockKey12345';
        const keySecret = process.env.RAZORPAY_KEY_SECRET || 'MockKeySecret12345';
        if (provider.name === 'RAZORPAY') {
            try {
                const razorpayInstance = new Razorpay({
                    key_id: keyId,
                    key_secret: keySecret
                });
                const rzpOrder = await razorpayInstance.orders.create({
                    amount: Math.round(order.totalAmountInr.toNumber() * 100),
                    currency: 'INR',
                    receipt: `receipt_order_${order.orderNumber}`
                });
                return this.prisma.$transaction(async (tx) => {
                    const payment = await tx.payment.create({
                        data: {
                            orderId: order.id,
                            amount: order.totalAmountInr,
                            status: client_1.PaymentStatus.PENDING,
                            providerId: provider.id
                        }
                    });
                    const attempt = await tx.paymentAttempt.create({
                        data: {
                            paymentId: payment.id,
                            status: client_1.PaymentStatus.PENDING
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
            }
            catch (err) {
                this.logger.error('Failed to create Razorpay Order via SDK, falling back to mock Order ID', err);
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    orderId: order.id,
                    amount: order.totalAmountInr,
                    status: client_1.PaymentStatus.PENDING,
                    providerId: provider.id
                }
            });
            const attempt = await tx.paymentAttempt.create({
                data: {
                    paymentId: payment.id,
                    status: client_1.PaymentStatus.PENDING
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
    async confirmPayment(paymentId, dto) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { order: { include: { profile: true } } }
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status === client_1.PaymentStatus.SUCCESS) {
            throw new common_1.BadRequestException('Payment is already completed');
        }
        if (dto.razorpayOrderId && dto.razorpaySignature) {
            const keySecret = process.env.RAZORPAY_KEY_SECRET || 'MockKeySecret12345';
            const generatedSignature = crypto
                .createHmac('sha256', keySecret)
                .update(dto.razorpayOrderId + '|' + dto.gatewayTxnId)
                .digest('hex');
            if (generatedSignature !== dto.razorpaySignature) {
                this.logger.error(`Signature verification failed: generated ${generatedSignature} vs received ${dto.razorpaySignature}`);
                throw new common_1.BadRequestException('Payment signature verification failed');
            }
            this.logger.log(`Razorpay signature successfully verified for Order ${payment.order.orderNumber}`);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: paymentId },
                data: { status: client_1.PaymentStatus.SUCCESS }
            });
            await tx.paymentAttempt.updateMany({
                where: { paymentId, status: client_1.PaymentStatus.PENDING },
                data: {
                    status: client_1.PaymentStatus.SUCCESS,
                    gatewayTxnId: dto.gatewayTxnId
                }
            });
            await tx.order.update({
                where: { id: payment.orderId },
                data: { status: client_1.OrderStatus.PAYMENT_COMPLETED }
            });
            await (0, workflow_1.activateBranchWorkflow)(payment.orderId, tx);
            await tx.orderStatusHistory.create({
                data: {
                    orderId: payment.orderId,
                    status: client_1.OrderStatus.PAYMENT_COMPLETED,
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
                    newData: { amount: payment.amount, status: client_1.PaymentStatus.SUCCESS }
                }
            });
            return {
                success: true,
                message: 'Payment confirmed successfully',
                orderId: payment.orderId
            };
        });
        this.notificationService.notifyBranchOnPayment(payment.orderId);
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService,
        domain_event_bus_service_1.DomainEventBus])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map