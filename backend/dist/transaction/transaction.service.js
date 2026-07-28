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
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
function generateUniqueId(prefix) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}
let TransactionService = class TransactionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTransaction(data) {
        let profile = await this.prisma.customerProfile.findUnique({
            where: { userId: data.userId },
        });
        if (!profile) {
            profile = await this.prisma.customerProfile.create({
                data: { userId: data.userId },
            });
        }
        let branchId = data.branchId;
        if (!branchId) {
            const defaultBranch = await this.prisma.branch.findFirst({});
            branchId = defaultBranch?.id;
        }
        const product = await this.prisma.forexProduct.findUnique({
            where: { code: data.forexProduct || 'CASH' },
        });
        const currency = await this.prisma.currency.findUnique({
            where: { code: data.currency || 'USD' },
        });
        if (!product || !currency || !branchId) {
            throw new Error('Product, Currency, or Branch not found in master records.');
        }
        const productType = product.code;
        const deliveryMethod = data.deliveryMethod || 'PICKUP';
        const isPickup = deliveryMethod === 'PICKUP' || deliveryMethod === 'STORE_PICKUP';
        const isDelivery = deliveryMethod === 'HOME_DELIVERY';
        let workflowType = 'CASH_PICKUP';
        if (productType === 'CASH') {
            workflowType = isDelivery ? 'CASH_DELIVERY' : 'CASH_PICKUP';
        }
        else if (productType === 'FOREX_CARD') {
            workflowType = data.isReload ? 'CARD_RELOAD' : 'CARD_PICKUP';
        }
        else if (productType === 'REMITTANCE') {
            workflowType = 'REMITTANCE_OUTWARD';
        }
        const requiresKyc = true;
        const requiresInventory = productType === 'CASH' || (productType === 'FOREX_CARD' && !data.isReload);
        const requiresPickupHandover = isPickup;
        const requiresDelivery = isDelivery;
        const currentStage = 'KYC_STAGE';
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    orderNumber: generateUniqueId('ORD'),
                    profileId: profile.id,
                    branchId: branchId,
                    totalAmountInr: data.totalInr || data.inrAmount || 0,
                    deliveryMethod,
                    status: client_1.OrderStatus.PENDING,
                    productType,
                    workflowType,
                    currentStage,
                    requiresKyc,
                    requiresInventory,
                    requiresPickupHandover,
                    requiresDelivery,
                    complianceStatus: 'PENDING',
                    items: {
                        create: {
                            productId: product.id,
                            currencyId: currency.id,
                            amount: data.forexAmount || 0,
                            rate: data.forexRate || 1,
                            inrSubtotal: data.inrAmount || 0,
                        },
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                            currency: true,
                        },
                    },
                },
            });
            if (requiresKyc) {
                await tx.branchTask.create({
                    data: {
                        branchId: branchId,
                        orderId: order.id,
                        taskType: 'KYC_REVIEW',
                        status: 'PENDING',
                        notes: 'Perform KYC compliance check for order documents',
                        queueRoleCode: 'BRANCH_KYC_STAFF'
                    }
                });
            }
            if (requiresInventory) {
                await tx.branchTask.create({
                    data: {
                        branchId: branchId,
                        orderId: order.id,
                        taskType: 'INVENTORY_PREP',
                        status: 'PENDING',
                        notes: 'Allocate and verify notes/card inventory',
                        queueRoleCode: 'BRANCH_INVENTORY_STAFF'
                    }
                });
            }
            if (requiresPickupHandover) {
                await tx.branchTask.create({
                    data: {
                        branchId: branchId,
                        orderId: order.id,
                        taskType: 'HANDOVER',
                        status: 'PENDING',
                        notes: 'Awaiting customer branch pickup verification',
                        queueRoleCode: 'BRANCH_CASHIER'
                    }
                });
            }
            if (requiresDelivery) {
                await tx.branchTask.create({
                    data: {
                        branchId: branchId,
                        orderId: order.id,
                        taskType: 'HANDOVER',
                        status: 'PENDING',
                        notes: 'Awaiting dispatch/delivery agent assignment',
                        queueRoleCode: 'BRANCH_FULFILLMENT_STAFF'
                    }
                });
            }
            return order;
        });
    }
    async getUserTransactions(userId) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId },
        });
        if (!profile)
            return [];
        return this.prisma.order.findMany({
            where: { profileId: profile.id },
            include: {
                items: {
                    include: {
                        product: true,
                        currency: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAllTransactions() {
        return this.prisma.order.findMany({
            include: {
                profile: {
                    include: {
                        user: {
                            select: { id: true, fullName: true, email: true, mobile: true },
                        },
                    },
                },
                items: {
                    include: {
                        product: true,
                        currency: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(id, status, changedById) {
        await this.prisma.orderStatusHistory.create({
            data: {
                orderId: id,
                status,
                changedById,
                comments: `Order status transitioned to ${status}`,
            },
        });
        return this.prisma.order.update({
            where: { id },
            data: { status },
        });
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map