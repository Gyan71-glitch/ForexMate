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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const workflow_1 = require("../common/utils/workflow");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async evaluateKycEligibilityInternal(profileId) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { id: profileId }
        });
        if (!profile)
            return { eligible: false, complianceStatus: 'PENDING' };
        const purpose = profile.travelPurpose || 'TOURISM';
        const latestOrder = await this.prisma.order.findFirst({
            where: { profileId: profile.id },
            orderBy: { createdAt: 'desc' }
        });
        const isSell = latestOrder?.productType === 'CASH_SELL';
        let rules = await this.prisma.kycVerificationRule.findMany({
            where: {
                isActive: true,
                OR: [
                    { product: null },
                    { product: 'CASH_BUY' },
                    { product: 'CASH_SELL' }
                ],
                AND: [
                    {
                        OR: [
                            { purpose: null },
                            { purpose: purpose }
                        ]
                    }
                ]
            }
        });
        if (isSell) {
            rules = rules.filter(r => r.docType === 'PAN' || r.docType === 'PASSPORT');
        }
        const requiredDocTypes = rules.filter(r => r.required).map(r => r.docType);
        const docs = await this.prisma.kycDocument.findMany({
            where: { userId: profile.userId }
        });
        const docStates = {};
        for (const type of requiredDocTypes) {
            const doc = docs.find(d => d.docType === type);
            if (!doc) {
                docStates[type] = 'MISSING';
            }
            else {
                docStates[type] = doc.status;
            }
        }
        const allApproved = requiredDocTypes.every(type => docStates[type] === 'APPROVED');
        const hasRejected = requiredDocTypes.some(type => docStates[type] === 'REJECTED');
        const hasReviewing = requiredDocTypes.some(type => docStates[type] === 'REVIEWING');
        const hasPending = requiredDocTypes.some(type => docStates[type] === 'PENDING');
        let complianceStatus = 'PENDING';
        if (profile.kycOverallStatus === 'VERIFIED' || allApproved) {
            complianceStatus = 'APPROVED';
        }
        else if (hasRejected) {
            complianceStatus = 'REJECTED';
        }
        else if (hasReviewing) {
            complianceStatus = 'REVIEWING';
        }
        else if (hasPending) {
            complianceStatus = 'PENDING';
        }
        else {
            complianceStatus = 'MISSING';
        }
        return {
            eligible: profile.kycOverallStatus === 'VERIFIED' || allApproved,
            complianceStatus
        };
    }
    async evaluateLrsEligibilityInternal(profileId, orderAmountInr) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { id: profileId },
            include: { user: true }
        });
        if (!profile)
            return { eligible: false, reason: 'Profile not found' };
        const docs = await this.prisma.kycDocument.findMany({
            where: { userId: profile.userId }
        });
        const panDoc = docs.find(d => d.docType === 'PAN');
        const passportDoc = docs.find(d => d.docType === 'PASSPORT');
        if (!panDoc || panDoc.status !== 'APPROVED') {
            return { eligible: false, reason: 'PAN is not approved' };
        }
        if (!passportDoc || passportDoc.status !== 'APPROVED') {
            return { eligible: false, reason: 'Passport is not approved' };
        }
        if (!profile.travelPurpose) {
            return { eligible: false, reason: 'Travel purpose is not selected' };
        }
        const currentYear = new Date().getFullYear();
        const financialYear = `${currentYear}-${currentYear + 1}`;
        const lrsTracker = await this.prisma.lrsLimitTracker.findUnique({
            where: {
                profileId_financialYear: {
                    profileId,
                    financialYear
                }
            }
        });
        const trackerSpentUsd = lrsTracker
            ? Number(lrsTracker.declaredAmountUsd || 0) + Number(lrsTracker.systemSpentAmountUsd || 0)
            : 0;
        const trackerSpentInr = trackerSpentUsd * 83;
        const activeOrders = await this.prisma.order.findMany({
            where: {
                profileId,
                status: { notIn: ['CANCELLED', 'REJECTED'] }
            }
        });
        const activeOrdersInr = activeOrders.reduce((sum, o) => sum + Number(o.totalAmountInr || 0), 0);
        const limitInr = 10000000;
        const totalSpentInr = trackerSpentInr + activeOrdersInr;
        const remainingInr = Math.max(0, limitInr - totalSpentInr);
        if (totalSpentInr + orderAmountInr > limitInr) {
            return {
                eligible: false,
                reason: 'LRS Limit Exceeded',
                remainingInr,
                totalSpentInr,
                orderAmountInr
            };
        }
        return {
            eligible: true,
            remainingInr: limitInr - (totalSpentInr + orderAmountInr),
            totalSpentInr,
            orderAmountInr
        };
    }
    async create(userId, dto) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId }
        });
        if (!profile) {
            throw new common_1.BadRequestException('User profile not found');
        }
        const quote = await this.prisma.quote.findUnique({
            where: { id: dto.quoteId },
            include: { currency: true }
        });
        if (!quote) {
            throw new common_1.NotFoundException('Quote not found');
        }
        if (quote.status === 'CONVERTED') {
            throw new common_1.BadRequestException('Quote has already been used');
        }
        const currentDate = global.devMockTime ? new Date(global.devMockTime) : new Date();
        if (currentDate > quote.expiresAt) {
            throw new common_1.BadRequestException('Quote has expired');
        }
        if (quote.profileId !== profile.id) {
            throw new common_1.ForbiddenException('Quote belongs to a different user');
        }
        const branch = await this.prisma.branch.findUnique({
            where: { id: dto.branchId }
        });
        if (!branch) {
            throw new common_1.BadRequestException('Invalid branch selected');
        }
        const session = quote.sessionId
            ? await this.prisma.transactionSession.findUnique({
                where: { id: quote.sessionId },
            })
            : null;
        const draftState = session?.draftState || {};
        let productCode = draftState.product || 'CASH';
        if (productCode === 'CARD')
            productCode = 'FOREX_CARD';
        const productType = productCode;
        const isPickup = dto.deliveryMethod === 'PICKUP' || dto.deliveryMethod === 'STORE_PICKUP';
        const isDelivery = dto.deliveryMethod === 'HOME_DELIVERY';
        let workflowType = 'CASH_PICKUP';
        if (productType === 'CASH') {
            workflowType = isDelivery ? 'CASH_DELIVERY' : 'CASH_PICKUP';
        }
        else if (productType === 'FOREX_CARD') {
            workflowType = draftState.isReload ? 'CARD_RELOAD' : 'CARD_PICKUP';
        }
        else if (productType === 'REMITTANCE') {
            workflowType = 'REMITTANCE_OUTWARD';
        }
        const requiresKyc = true;
        const requiresInventory = productType === 'CASH' || (productType === 'FOREX_CARD' && !draftState.isReload);
        const requiresPickupHandover = isPickup;
        const requiresDelivery = isDelivery;
        const forexProduct = await this.prisma.forexProduct.findUnique({
            where: { code: productCode },
        });
        if (!forexProduct) {
            throw new common_1.BadRequestException(`Product code ${productCode} not found in database`);
        }
        const orderNumber = `ORD-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const totalAmountInr = quote.lockedInrRate.toNumber() * quote.amountForeign.toNumber();
        const kycEligible = await this.evaluateKycEligibilityInternal(profile.id);
        let initialStatus = kycEligible.eligible ? client_1.OrderStatus.PAYMENT_PENDING : client_1.OrderStatus.PENDING;
        let currentStage = kycEligible.eligible ? 'PAYMENT_STAGE' : 'KYC_STAGE';
        let complianceStatus = kycEligible.complianceStatus;
        let lrsReason = '';
        let remainingInr = 0;
        if (kycEligible.eligible) {
            const lrsCheck = await this.evaluateLrsEligibilityInternal(profile.id, totalAmountInr);
            if (!lrsCheck.eligible) {
                initialStatus = client_1.OrderStatus.CANCELLED;
                currentStage = 'KYC_STAGE';
                complianceStatus = 'LRS_FAILED';
                lrsReason = lrsCheck.reason || 'LRS Limit Exceeded';
                remainingInr = lrsCheck.remainingInr || 0;
            }
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.quote.update({
                where: { id: quote.id },
                data: { status: 'CONVERTED' }
            });
            const order = await tx.order.create({
                data: {
                    orderNumber,
                    quoteId: quote.id,
                    profileId: profile.id,
                    branchId: branch.id,
                    totalAmountInr,
                    deliveryMethod: dto.deliveryMethod,
                    status: initialStatus,
                    productType,
                    workflowType,
                    currentStage,
                    requiresKyc,
                    requiresInventory,
                    requiresPickupHandover,
                    requiresDelivery,
                    complianceStatus,
                    items: {
                        create: {
                            productId: forexProduct.id,
                            currencyId: quote.currencyId,
                            amount: quote.amountForeign,
                            rate: quote.lockedInrRate,
                            inrSubtotal: totalAmountInr,
                        },
                    },
                }
            });
            if (requiresKyc && complianceStatus !== 'LRS_FAILED') {
                await tx.branchTask.create({
                    data: {
                        branchId: branch.id,
                        orderId: order.id,
                        taskType: 'KYC_REVIEW',
                        status: 'PENDING',
                        notes: 'Perform KYC compliance check for order documents',
                        queueRoleCode: 'BRANCH_KYC_STAFF'
                    }
                });
            }
            if (requiresInventory && complianceStatus !== 'LRS_FAILED') {
                await tx.branchTask.create({
                    data: {
                        branchId: branch.id,
                        orderId: order.id,
                        taskType: 'INVENTORY_PREP',
                        status: 'PENDING',
                        notes: 'Allocate and verify notes/card inventory',
                        queueRoleCode: 'BRANCH_INVENTORY_STAFF'
                    }
                });
            }
            if (requiresPickupHandover && complianceStatus !== 'LRS_FAILED') {
                await tx.branchTask.create({
                    data: {
                        branchId: branch.id,
                        orderId: order.id,
                        taskType: 'HANDOVER',
                        status: 'PENDING',
                        notes: 'Awaiting customer branch pickup verification',
                        queueRoleCode: 'BRANCH_CASHIER'
                    }
                });
            }
            if (requiresDelivery && complianceStatus !== 'LRS_FAILED') {
                await tx.branchTask.create({
                    data: {
                        branchId: branch.id,
                        orderId: order.id,
                        taskType: 'HANDOVER',
                        status: 'PENDING',
                        notes: 'Awaiting dispatch/delivery agent assignment',
                        queueRoleCode: 'BRANCH_FULFILLMENT_STAFF'
                    }
                });
            }
            let historyComments = kycEligible.eligible
                ? 'Order created. KYC approved, awaiting payment.'
                : 'Order created. Awaiting KYC submission/approval.';
            if (complianceStatus === 'LRS_FAILED') {
                historyComments = `LRS Limit Exceeded. You cannot purchase this amount. Remaining Limit: ₹${remainingInr}`;
            }
            await tx.orderStatusHistory.create({
                data: {
                    orderId: order.id,
                    status: initialStatus,
                    changedById: userId,
                    comments: historyComments,
                }
            });
            if (complianceStatus === 'LRS_FAILED') {
                await tx.inAppNotification.create({
                    data: {
                        userId,
                        title: 'LRS Limit Exceeded',
                        message: `Your order ${orderNumber} was cancelled. You cannot purchase this amount. Remaining LRS Limit: ₹${remainingInr}`,
                        actionUrl: `/dashboard/orders/${order.id}`,
                        orderId: order.id
                    }
                });
            }
            await tx.auditLog.create({
                data: {
                    userId,
                    action: complianceStatus === 'LRS_FAILED' ? 'CREATE_ORDER_LRS_FAILED' : 'CREATE_ORDER',
                    entityName: 'Order',
                    entityId: order.id,
                    newData: { orderNumber, totalAmountInr, initialStatus, complianceStatus }
                }
            });
            return order;
        });
    }
    async findAllForUser(userId) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId }
        });
        if (!profile)
            return [];
        const orders = await this.prisma.order.findMany({
            where: { profileId: profile.id },
            include: {
                quote: { include: { currency: true } },
                branch: true,
                tasks: true,
                items: {
                    include: {
                        product: true,
                        currency: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return orders.map(o => ({
            ...o,
            mappedStatus: (0, workflow_1.mapOrderStatus)(o),
            status: (0, workflow_1.mapOrderStatus)(o)
        }));
    }
    async findOne(orderId, userId) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId }
        });
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                quote: { include: { currency: true } },
                branch: true,
                tasks: true,
                items: {
                    include: {
                        product: true,
                        currency: true
                    }
                },
                history: { orderBy: { createdAt: 'desc' } }
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (profile && order.profileId !== profile.id) {
            const userRole = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { roleRef: true }
            });
            if (userRole?.roleRef?.name === 'CUSTOMER') {
                throw new common_1.ForbiddenException('You are not authorized to view this order');
            }
        }
        return {
            ...order,
            mappedStatus: (0, workflow_1.mapOrderStatus)(order),
            status: (0, workflow_1.mapOrderStatus)(order)
        };
    }
    async updateStatus(orderId, status) {
        const order = await this.prisma.order.update({
            where: { id: orderId },
            data: { status }
        });
        return order;
    }
    async requestCancel(orderId, reason, userId) {
        if (!reason || !reason.trim()) {
            throw new common_1.BadRequestException('A valid reason is required for cancellation.');
        }
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId }
        });
        if (!profile) {
            throw new common_1.BadRequestException('User profile not found');
        }
        const order = await this.prisma.order.findUnique({
            where: { id: orderId }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.profileId !== profile.id) {
            throw new common_1.ForbiddenException('You are not authorized to cancel this order');
        }
        const uncancellableStatuses = [
            client_1.OrderStatus.DISPATCHED,
            client_1.OrderStatus.DELIVERED,
            client_1.OrderStatus.COMPLETED,
            client_1.OrderStatus.CANCELLED,
            client_1.OrderStatus.REJECTED
        ];
        if (uncancellableStatuses.includes(order.status)) {
            throw new common_1.BadRequestException(`Order cannot be cancelled in its current status: ${order.status}`);
        }
        if (order.cancelRequested) {
            throw new common_1.BadRequestException('Cancellation has already been requested for this order.');
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    cancelRequested: true,
                    cancelReason: reason
                }
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: order.status,
                    changedById: userId,
                    comments: `Cancellation requested by customer. Reason: ${reason}`
                }
            });
            await tx.auditLog.create({
                data: {
                    userId,
                    action: 'REQUEST_CANCEL_ORDER_CUSTOMER',
                    entityName: 'Order',
                    entityId: orderId,
                    newData: { cancelRequested: true, cancelReason: reason }
                }
            });
            return {
                ...updatedOrder,
                mappedStatus: (0, workflow_1.mapOrderStatus)(updatedOrder),
                status: (0, workflow_1.mapOrderStatus)(updatedOrder)
            };
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map