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
exports.CashAllocationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const domain_event_bus_service_1 = require("../common/event-bus/domain-event-bus.service");
let CashAllocationService = class CashAllocationService {
    prisma;
    eventBus;
    constructor(prisma, eventBus) {
        this.prisma = prisma;
        this.eventBus = eventBus;
    }
    async createAllocation(userId, userRole, orderId, items) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true,
                        currency: true,
                    },
                },
                cashAllocation: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        console.log(`[CashAllocation] DEBUG Fetching order ${orderId}`);
        console.log(`[CashAllocation] DEBUG Returned Order:`, JSON.stringify(order, null, 2));
        if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
            throw new common_1.BadRequestException('Cannot allocate cash for a cancelled or rejected order');
        }
        const isAssigned = order.assignedStaffId === userId;
        const isManager = userRole === 'BRANCH_MANAGER' || !userRole;
        const isSuper = userRole === 'SUPER_ADMIN';
        const isOpsAdmin = userRole === 'OPERATIONS_ADMIN';
        if (order.cashAllocation) {
            throw new common_1.BadRequestException('Cash allocation has already been submitted for this order.');
        }
        const orderItem = order.items[0];
        if (!orderItem) {
            throw new common_1.BadRequestException('Order does not contain items.');
        }
        const currencyCode = orderItem.currency.code;
        const orderAmount = Number(orderItem.amount);
        let totalAllocated = 0;
        const allocationItemsData = [];
        for (const item of items) {
            if (item.denomination <= 0 || item.quantity <= 0) {
                throw new common_1.BadRequestException('Denomination and quantity must be positive integers.');
            }
            const lineAmount = item.denomination * item.quantity;
            totalAllocated += lineAmount;
            allocationItemsData.push({
                denomination: item.denomination,
                quantity: item.quantity,
                amount: lineAmount,
            });
        }
        if (Math.abs(totalAllocated - orderAmount) > 0.0001) {
            throw new common_1.BadRequestException(`Allocated total (${totalAllocated} ${currencyCode}) must exactly equal the order amount (${orderAmount} ${currencyCode}).`);
        }
        console.log(`[CashAllocation] Starting transaction for order ${order.id}...`);
        try {
            return await this.prisma.$transaction(async (tx) => {
                console.log(`[CashAllocation] Inside transaction, finding vault...`);
                const vault = await tx.branchVault.findFirst({
                    where: { branchId: order.branchId, currencyId: orderItem.currencyId },
                    include: { denominations: true },
                });
                if (!vault) {
                    console.error(`[CashAllocation] No vault found for ${currencyCode}`);
                    throw new common_1.BadRequestException(`No branch vault provisioned for currency ${currencyCode}`);
                }
                console.log(`[CashAllocation] Checking stock availability...`);
                for (const item of allocationItemsData) {
                    const vaultDenom = vault.denominations.find(d => d.denomination === item.denomination);
                    if (!vaultDenom || vaultDenom.noteCount < item.quantity) {
                        const available = vaultDenom ? vaultDenom.noteCount : 0;
                        throw new common_1.BadRequestException(`Insufficient vault stock for ${item.denomination} ${currencyCode} notes. Requested: ${item.quantity}, Available: ${available}`);
                    }
                    console.log(`[CashAllocation] Reserving notes for denomination ${item.denomination}...`);
                    await tx.vaultDenomination.update({
                        where: { id: vaultDenom.id },
                        data: { noteCount: { decrement: item.quantity } },
                    });
                }
                console.log(`[CashAllocation] Creating CashAllocation record...`);
                const allocation = await tx.cashAllocation.create({
                    data: {
                        orderId: order.id,
                        branchId: order.branchId,
                        currencyCode,
                        allocatedAmount: totalAllocated,
                        allocatedBy: userId,
                        status: 'LOCKED',
                        items: {
                            create: allocationItemsData,
                        },
                    },
                    include: {
                        items: true,
                    },
                });
                const reservation = await tx.inventoryReservation.create({
                    data: {
                        branchId: order.branchId,
                        orderId: order.id,
                        currencyCode,
                        amount: totalAllocated,
                        status: 'ACTIVE',
                    },
                });
                console.log(`[CashAllocation] Creating VaultTransaction log...`);
                await tx.vaultTransaction.create({
                    data: {
                        vaultId: vault.id,
                        type: 'RESERVE',
                        amount: totalAllocated,
                    },
                });
                await tx.inventoryMovement.create({
                    data: {
                        branchId: order.branchId,
                        currencyCode,
                        amount: totalAllocated,
                        direction: 'OUT',
                        movementType: 'RESERVATION',
                        referenceId: order.id,
                    },
                });
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        currentStage: 'FULFILLMENT_STAGE',
                    },
                });
                console.log(`[CashAllocation] Completing INVENTORY_PREP task...`);
                const inventoryTask = await tx.branchTask.findFirst({
                    where: { orderId: order.id, taskType: 'INVENTORY_PREP', status: { not: 'COMPLETED' } },
                });
                if (inventoryTask) {
                    await tx.branchTask.update({
                        where: { id: inventoryTask.id },
                        data: {
                            status: 'COMPLETED',
                            resolvedByUserId: userId,
                            notes: 'Cash allocation completed and vault notes reserved.',
                        },
                    });
                }
                await tx.auditLog.create({
                    data: {
                        userId,
                        action: 'ALLOCATED_CASH',
                        entityName: 'Order',
                        entityId: order.id,
                        newData: {
                            allocationId: allocation.id,
                            totalAllocated,
                            currencyCode,
                        },
                        branchId: order.branchId,
                    },
                });
                console.log(`[CashAllocation] Publishing events...`);
                this.eventBus.publish('CashAllocated', {
                    orderId: order.id,
                    allocationId: allocation.id,
                    branchId: order.branchId,
                    currencyCode,
                    amount: totalAllocated,
                    userId,
                });
                this.eventBus.publish('ReservationCreated', {
                    orderId: order.id,
                    reservationId: reservation.id,
                    branchId: order.branchId,
                    currencyCode,
                    amount: totalAllocated,
                });
                console.log(`[CashAllocation] Transaction complete.`);
                return allocation;
            });
        }
        catch (e) {
            throw new common_1.BadRequestException(`CASH_ALLOCATION_FAIL: ${e.message}`);
        }
    }
    async getAllocation(orderId) {
        const allocation = await this.prisma.cashAllocation.findUnique({
            where: { orderId },
            include: {
                items: true,
            },
        });
        if (!allocation) {
            return null;
        }
        return allocation;
    }
};
exports.CashAllocationService = CashAllocationService;
exports.CashAllocationService = CashAllocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        domain_event_bus_service_1.DomainEventBus])
], CashAllocationService);
//# sourceMappingURL=cash-allocation.service.js.map