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
exports.OpsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const compliance_service_1 = require("../compliance/compliance.service");
const workflow_1 = require("../common/utils/workflow");
const workflow_validator_service_1 = require("../common/services/workflow-validator.service");
const domain_event_bus_service_1 = require("../common/event-bus/domain-event-bus.service");
let OpsService = class OpsService {
    prisma;
    complianceService;
    validator;
    eventBus;
    constructor(prisma, complianceService, validator, eventBus) {
        this.prisma = prisma;
        this.complianceService = complianceService;
        this.validator = validator;
        this.eventBus = eventBus;
    }
    async getBranchTasks(branchId) {
        const whereClause = branchId ? { branchId } : {};
        return this.prisma.branchTask.findMany({
            where: whereClause,
            include: {
                order: {
                    include: {
                        profile: {
                            include: { user: { select: { fullName: true, email: true, mobile: true } } }
                        },
                        items: {
                            include: {
                                product: true,
                                currency: true
                            }
                        },
                        deliveryJob: true,
                        deliveries: { include: { address: true } },
                    }
                },
                assignedTo: { select: { fullName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getBranchOrders(branchId) {
        return this.prisma.order.findMany({
            where: { branchId },
            include: {
                profile: {
                    include: { user: { select: { fullName: true, email: true, mobile: true } } }
                },
                items: {
                    include: {
                        product: true,
                        currency: true
                    }
                },
                quote: {
                    include: {
                        currency: true
                    }
                },
                deliveryJob: true,
                deliveries: { include: { address: true } },
                history: { orderBy: { createdAt: 'desc' } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getBranchVaults(branchId) {
        return this.prisma.branchVault.findMany({
            where: { branchId },
            include: {
                currency: true,
                denominations: {
                    orderBy: { denomination: 'desc' }
                }
            }
        });
    }
    async resolveTask(taskId, user, data) {
        const task = await this.prisma.branchTask.findUnique({
            where: { id: taskId },
            include: { order: true }
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
            throw new common_1.BadRequestException(`Task is already ${task.status}`);
        }
        const isAssignedUser = task.assignedToId === user.id;
        const isManager = user.role === 'BRANCH_MANAGER';
        const isSuper = user.role === 'SUPER_ADMIN';
        if (!isAssignedUser && !isManager && !isSuper) {
            throw new common_1.BadRequestException('Only the assigned staff member or a manager can complete this task');
        }
        return this.prisma.$transaction(async (tx) => {
            if (task.taskType === 'KYC_REVIEW' && data.status === 'COMPLETED' && task.orderId) {
                const order = await tx.order.findUnique({
                    where: { id: task.orderId },
                    include: { profile: true }
                });
                if (!order) {
                    throw new common_1.NotFoundException('Order linked to task not found');
                }
                if (order.requiresKyc && order.profile) {
                    if (order.profile.kycOverallStatus !== 'VERIFIED') {
                        let requiredDocTypes = [];
                        if (order.productType === 'REMITTANCE') {
                            const rd = await tx.remittanceDetail.findFirst({
                                where: { orderItem: { orderId: order.id } },
                                include: { purpose: { include: { documentRequirements: true } } }
                            });
                            requiredDocTypes = rd?.purpose?.documentRequirements.map((d) => d.docType) || ['PAN', 'PASSPORT'];
                        }
                        else {
                            const purpose = order.profile.travelPurpose || 'TOURISM';
                            let requiredRules = await tx.kycVerificationRule.findMany({
                                where: {
                                    isActive: true,
                                    required: true,
                                    OR: [
                                        { product: null },
                                        { product: order.productType }
                                    ],
                                    AND: [
                                        {
                                            OR: [
                                                { purpose: null },
                                                { purpose }
                                            ]
                                        }
                                    ]
                                }
                            });
                            if (order.productType === 'CASH_SELL') {
                                requiredRules = requiredRules.filter(r => r.docType === 'PAN' || r.docType === 'PASSPORT');
                            }
                            requiredDocTypes = requiredRules.map(r => r.docType);
                        }
                        const userDocs = await tx.kycDocument.findMany({
                            where: { userId: order.profile.userId }
                        });
                        const allApproved = requiredDocTypes.every(type => {
                            const doc = userDocs.find(d => d.docType === type);
                            return doc && doc.status === 'APPROVED';
                        });
                        if (!allApproved) {
                            throw new common_1.BadRequestException(`Cannot mark KYC review completed. The customer must have all required documents (${requiredDocTypes.join(', ')}) approved first in the compliance queue.`);
                        }
                    }
                }
            }
            if (task.taskType === 'HANDOVER' && data.status === 'COMPLETED' && task.orderId) {
                const order = await tx.order.findUnique({
                    where: { id: task.orderId }
                });
                if (!order) {
                    throw new common_1.NotFoundException('Order linked to task not found');
                }
                if (order.requiresKyc && order.complianceStatus !== 'APPROVED') {
                    throw new common_1.BadRequestException('Cannot complete handover. KYC verification is not approved.');
                }
                if (order.requiresInventory) {
                    const inventoryTask = await tx.branchTask.findFirst({
                        where: { orderId: order.id, taskType: 'INVENTORY_PREP' }
                    });
                    if (!inventoryTask || inventoryTask.status !== 'COMPLETED') {
                        throw new common_1.BadRequestException('Cannot complete handover. Inventory preparation is not completed.');
                    }
                }
            }
            if (task.taskType === 'TREASURY_TRANSFER' && data.status === 'COMPLETED' && task.orderId) {
                const order = await tx.order.findUnique({
                    where: { id: task.orderId }
                });
                if (!order) {
                    throw new common_1.NotFoundException('Order linked to task not found');
                }
                if (order.complianceStatus !== 'APPROVED') {
                    throw new common_1.BadRequestException('Cannot complete transfer. KYC verification is not approved.');
                }
                if (order.status !== 'PAYMENT_COMPLETED') {
                    throw new common_1.BadRequestException('Cannot complete transfer. Payment is not completed.');
                }
            }
            const updatedTask = await tx.branchTask.update({
                where: { id: taskId },
                data: {
                    status: data.status,
                    notes: data.notes,
                    updatedAt: new Date(),
                    resolvedByUserId: user.id
                }
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: `RESOLVE_TASK_${task.taskType}`,
                    entityName: 'BranchTask',
                    entityId: taskId,
                    newData: { status: data.status, notes: data.notes }
                }
            });
            if (task.orderId && data.status === 'COMPLETED') {
                const order = await tx.order.findUnique({
                    where: { id: task.orderId }
                });
                if (order) {
                    let nextStatus = order.status;
                    let nextStage = order.currentStage;
                    let complianceStatus = order.complianceStatus;
                    if (task.taskType === 'KYC_REVIEW') {
                        complianceStatus = 'APPROVED';
                        if (order.productType === 'REMITTANCE') {
                            nextStatus = 'READY_TO_FORWARD';
                            nextStage = 'READY_TO_FORWARD';
                            await tx.auditLog.create({
                                data: {
                                    userId: user.id,
                                    action: 'REMITTANCE_COMPLIANCE_APPROVED',
                                    entityName: 'Order',
                                    entityId: order.id,
                                    newData: { status: 'READY_TO_FORWARD', complianceStatus: 'APPROVED' }
                                }
                            });
                        }
                        else {
                            nextStage = 'INVENTORY_STAGE';
                        }
                    }
                    else if (task.taskType === 'INVENTORY_PREP') {
                        nextStage = 'FULFILLMENT_STAGE';
                        if (order.status !== 'PAYMENT_COMPLETED' && order.status !== 'COMPLETED' && order.status !== 'DELIVERED') {
                            nextStatus = 'PAYMENT_PENDING';
                        }
                    }
                    else if (task.taskType === 'HANDOVER') {
                        nextStatus = order.requiresDelivery ? 'DELIVERED' : 'COMPLETED';
                        nextStage = 'COMPLETED';
                    }
                    else if (task.taskType === 'TREASURY_TRANSFER') {
                        nextStatus = 'COMPLETED';
                        nextStage = 'COMPLETED';
                    }
                    await tx.order.update({
                        where: { id: order.id },
                        data: {
                            status: nextStatus,
                            currentStage: nextStage,
                            complianceStatus
                        }
                    });
                    await tx.orderStatusHistory.create({
                        data: {
                            orderId: order.id,
                            status: nextStatus,
                            changedById: user.id,
                            comments: `Task ${task.taskType} marked completed. Stage updated to ${nextStage}. Notes: ${data.notes || 'None'}`
                        }
                    });
                }
            }
            return updatedTask;
        });
    }
    async claimTask(taskId, user) {
        const task = await this.prisma.branchTask.findUnique({
            where: { id: taskId },
            include: { order: true }
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (user.role !== 'SUPER_ADMIN' && task.branchId !== user.branchId) {
            throw new common_1.BadRequestException('Cannot claim task from another branch');
        }
        if (task.assignedToId) {
            throw new common_1.BadRequestException('Task is already claimed/assigned');
        }
        if (task.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Task status is ${task.status}, which is not claimable`);
        }
        if (task.orderId) {
            if (task.taskType === 'INVENTORY_PREP') {
                const kycTask = await this.prisma.branchTask.findFirst({
                    where: { orderId: task.orderId, taskType: 'KYC_REVIEW' }
                });
                if (kycTask && kycTask.status !== 'COMPLETED') {
                    throw new common_1.BadRequestException('Cannot claim Inventory Prep task. KYC Review is not yet completed.');
                }
            }
            else if (task.taskType === 'HANDOVER') {
                const kycTask = await this.prisma.branchTask.findFirst({
                    where: { orderId: task.orderId, taskType: 'KYC_REVIEW' }
                });
                if (kycTask && kycTask.status !== 'COMPLETED') {
                    throw new common_1.BadRequestException('Cannot claim Handover task. KYC Review is not yet completed.');
                }
                const inventoryTask = await this.prisma.branchTask.findFirst({
                    where: { orderId: task.orderId, taskType: 'INVENTORY_PREP' }
                });
                if (inventoryTask && inventoryTask.status !== 'COMPLETED') {
                    throw new common_1.BadRequestException('Cannot claim Handover task. Inventory Preparation is not yet completed.');
                }
            }
        }
        const isSuper = user.role === 'SUPER_ADMIN';
        const isManager = user.role === 'BRANCH_MANAGER';
        const isGeneralStaff = user.role === 'STAFF' || user.role === 'BRANCH_OPERATIONS_STAFF' || user.role === 'BRANCH_OPERATIONS';
        let isAuthorized = isSuper || isManager || isGeneralStaff;
        if (!isAuthorized) {
            if (task.taskType === 'KYC_REVIEW') {
                isAuthorized = user.role === 'BRANCH_KYC_STAFF';
            }
            else if (task.taskType === 'INVENTORY_PREP') {
                isAuthorized = user.role === 'BRANCH_INVENTORY_STAFF';
            }
            else if (task.taskType === 'HANDOVER') {
                isAuthorized = user.role === 'BRANCH_CASHIER' || user.role === 'BRANCH_FULFILLMENT_STAFF';
            }
        }
        if (!isAuthorized) {
            throw new common_1.BadRequestException(`Role ${user.role} is not authorized to claim task type ${task.taskType}`);
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedTask = await tx.branchTask.update({
                where: { id: taskId },
                data: {
                    assignedToId: user.id,
                    status: 'IN_PROGRESS'
                }
            });
            if (task.orderId && task.order) {
                await tx.orderStatusHistory.create({
                    data: {
                        orderId: task.orderId,
                        status: task.order.status,
                        changedById: user.id,
                        comments: `Task ${task.taskType} claimed by ${user.fullName || user.email}. Status set to IN_PROGRESS.`,
                    }
                });
            }
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'CLAIM_TASK',
                    entityName: 'BranchTask',
                    entityId: taskId,
                    newData: { assignedToId: user.id, status: 'IN_PROGRESS' }
                }
            });
            return updatedTask;
        });
    }
    async getBranchLeads(branchId, user) {
        const whereClause = {};
        if (branchId) {
            whereClause.branchId = branchId;
        }
        const [orders, vaults, allBranches] = await Promise.all([
            this.prisma.order.findMany({
                where: whereClause,
                include: {
                    profile: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                    mobile: true,
                                    KycDocument: {
                                        include: {
                                            ocrData: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    items: {
                        include: {
                            product: true,
                            currency: true,
                            remittance: {
                                include: {
                                    beneficiary: true,
                                    purpose: true,
                                    partner: true
                                }
                            }
                        }
                    },
                    branch: true,
                    deliveries: { include: { address: true } },
                    deliveryJob: true,
                    cashier: { include: { branch: { select: { branchName: true } } } },
                    deliveryPartner: { include: { branch: { select: { branchName: true } } } },
                    history: { orderBy: { createdAt: 'desc' } },
                    payments: true,
                    assignedStaff: { select: { fullName: true, email: true } },
                    tasks: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.branchVault.findMany(),
            this.prisma.branch.findMany()
        ]);
        const enriched = orders.map(order => {
            const itemsWithStock = order.items.map(item => {
                const matchingVault = vaults.find(v => v.branchId === order.branchId && v.currencyId === item.currencyId);
                return {
                    ...item,
                    vaultStock: matchingVault ? matchingVault.totalAmount : 0
                };
            });
            const branchObj = order.branch || allBranches.find(b => b.id === order.branchId);
            const originalBranchObj = allBranches.find(b => b.id === order.originalBranchId) || branchObj;
            const currentBranchObj = allBranches.find(b => b.id === order.currentBranchId) || branchObj;
            const reassignedBranchObj = allBranches.find(b => b.id === order.reassignedBranchId);
            return {
                ...order,
                branch: branchObj,
                originalBranch: originalBranchObj,
                currentBranch: currentBranchObj,
                reassignedBranch: reassignedBranchObj,
                items: itemsWithStock,
                mappedStatus: (0, workflow_1.mapOrderStatus)(order)
            };
        });
        const staffId = user?.id;
        const isManager = user?.role === 'BRANCH_MANAGER';
        const isSuper = user?.role === 'SUPER_ADMIN';
        const isOpsAdmin = user?.role === 'OPERATIONS_ADMIN';
        let filteredOrders = enriched;
        if (!isManager && !isSuper && !isOpsAdmin) {
            filteredOrders = enriched.filter(o => !o.assignedStaffId || o.assignedStaffId === staffId);
        }
        return {
            unassigned: filteredOrders.filter(o => !o.assignedStaffId && !o.cancelRequested && o.status !== 'CANCELLED' && o.status !== 'REJECTED' && o.status !== 'COMPLETED' && o.status !== 'DELIVERED'),
            myLeads: staffId ? filteredOrders.filter(o => o.assignedStaffId === staffId && !o.cancelRequested && o.status !== 'CANCELLED' && o.status !== 'REJECTED' && o.status !== 'COMPLETED' && o.status !== 'DELIVERED') : [],
            allLeads: filteredOrders
        };
    }
    async claimLead(orderId, user) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.cancelRequested && user.role !== 'BRANCH_MANAGER' && user.role !== 'SUPER_ADMIN' && user.role !== 'OPERATIONS_ADMIN') {
            throw new common_1.BadRequestException('Only a branch manager or administrator can claim orders with active cancellation requests.');
        }
        if (order.assignedStaffId) {
            throw new common_1.BadRequestException('Lead is already claimed by another staff member');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    assignedStaffId: user.id,
                    assignedAt: new Date()
                }
            });
            try {
                await tx.branchTask.updateMany({
                    where: { orderId, assignedToId: null, status: 'PENDING' },
                    data: {
                        assignedToId: user.id,
                        status: 'IN_PROGRESS'
                    }
                });
            }
            catch (err) {
            }
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: order.status,
                    changedById: user.id,
                    comments: `Lead claimed by ${user.fullName || user.email}.`
                }
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'CLAIM_LEAD',
                    entityName: 'Order',
                    entityId: orderId,
                    newData: { assignedStaffId: user.id }
                }
            });
            await tx.inAppNotification.create({
                data: {
                    userId: user.id,
                    title: 'Lead Claimed',
                    message: `Lead ${updatedOrder.orderNumber} claimed successfully.`,
                    actionUrl: `/ops/tasks`,
                    orderId: updatedOrder.id
                }
            });
            return updatedOrder;
        }, { maxWait: 10000, timeout: 20000 });
        this.eventBus.publish('LeadClaimed', { orderId: result.id, userId: result.profileId, branchId: result.branchId, order: result });
        return result;
    }
    async processLeadAction(orderId, action, notes, user) {
        await this.validator.validateTransition(orderId, action);
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { profile: true, items: { include: { currency: true } } }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const isAssigned = order.assignedStaffId === user.id;
        const isManager = user.role === 'BRANCH_MANAGER';
        const isSuper = user.role === 'SUPER_ADMIN';
        if (!isAssigned && !isManager && !isSuper) {
            throw new common_1.BadRequestException('Only the assigned lead owner or a manager can perform actions on this lead');
        }
        if (action === 'APPROVE_CANCEL') {
            if (!isManager && !isSuper) {
                throw new common_1.BadRequestException('Only a branch manager or admin can approve order cancellation requests.');
            }
            if (!order.cancelRequested) {
                throw new common_1.BadRequestException('No cancellation request found for this order.');
            }
        }
        const result = await this.prisma.$transaction(async (tx) => {
            let nextStatus = order.status;
            let nextStage = order.currentStage;
            let complianceStatus = order.complianceStatus;
            if (action === 'APPROVE_KYC') {
                const userDocs = await tx.kycDocument.findMany({
                    where: { userId: order.profile.userId, status: { in: ['PENDING', 'REVIEWING'] } }
                });
                for (const doc of userDocs) {
                    await tx.kycDocument.update({
                        where: { id: doc.id },
                        data: { status: 'APPROVED' }
                    });
                    await tx.kycReview.create({
                        data: {
                            documentId: doc.id,
                            reviewerId: user.id,
                            decision: 'APPROVED',
                            notes: notes || 'Approved via CRM Lead Workspace'
                        }
                    });
                }
                const kycTask = await tx.branchTask.findFirst({
                    where: { orderId, taskType: 'KYC_REVIEW' }
                });
                if (kycTask) {
                    await tx.branchTask.update({
                        where: { id: kycTask.id },
                        data: { status: 'COMPLETED', resolvedByUserId: user.id }
                    });
                }
                await tx.customerProfile.update({
                    where: { id: order.profile.id },
                    data: { kycOverallStatus: 'VERIFIED', lastKycReviewedAt: new Date() }
                });
                complianceStatus = 'APPROVED';
                if (order.productType === 'CASH_SELL') {
                    nextStatus = 'KYC_APPROVED';
                    nextStage = 'FULFILLMENT_STAGE';
                    await tx.inAppNotification.create({
                        data: {
                            userId: order.profile.userId,
                            title: 'KYC Approved',
                            message: `Your KYC documents have been approved for order ${order.orderNumber}.`,
                            actionUrl: `/dashboard/orders/${order.id}`,
                            orderId: order.id
                        }
                    });
                    await tx.inAppNotification.create({
                        data: {
                            userId: order.profile.userId,
                            title: 'Waiting For Fulfillment',
                            message: `Your Cash Sell order ${order.orderNumber} is now waiting for fulfillment.`,
                            actionUrl: `/dashboard/orders/${order.id}`,
                            orderId: order.id
                        }
                    });
                    const branchStaff = await tx.branchStaff.findMany({
                        where: { branchId: order.branchId },
                        include: { user: { include: { roleRef: true } } }
                    });
                    const managers = branchStaff.filter((s) => s.user.roleRef?.name === 'BRANCH_MANAGER' || s.designation === 'MANAGER');
                    for (const mgr of managers) {
                        await tx.inAppNotification.create({
                            data: {
                                userId: mgr.userId,
                                title: 'KYC Approved',
                                message: `Order ${order.orderNumber} KYC approved.`,
                                actionUrl: `/manager/queue`,
                                orderId: order.id
                            }
                        });
                        await tx.inAppNotification.create({
                            data: {
                                userId: mgr.userId,
                                title: 'Waiting For Fulfillment',
                                message: `Order ${order.orderNumber} is now waiting for fulfillment.`,
                                actionUrl: `/manager/queue`,
                                orderId: order.id
                            }
                        });
                    }
                }
                else if (order.productType === 'REMITTANCE') {
                    nextStatus = 'READY_TO_FORWARD';
                    nextStage = 'READY_TO_FORWARD';
                    await tx.inAppNotification.create({
                        data: {
                            userId: order.profile.userId,
                            title: 'Remittance Verified & Ready',
                            message: `Your remittance order ${order.orderNumber} documents have been verified by compliance.`,
                            actionUrl: `/dashboard/remittances`,
                            orderId: order.id
                        }
                    });
                }
                else {
                    nextStage = 'INVENTORY_STAGE';
                }
            }
            else if (action === 'REJECT_KYC') {
                const userDocs = await tx.kycDocument.findMany({
                    where: { userId: order.profile.userId, status: { in: ['PENDING', 'REVIEWING'] } }
                });
                for (const doc of userDocs) {
                    await tx.kycDocument.update({
                        where: { id: doc.id },
                        data: { status: 'REJECTED' }
                    });
                    await tx.kycReview.create({
                        data: {
                            documentId: doc.id,
                            reviewerId: user.id,
                            decision: 'REJECTED',
                            notes: notes || 'Rejected via CRM Lead Workspace'
                        }
                    });
                }
                const kycTask = await tx.branchTask.findFirst({
                    where: { orderId, taskType: 'KYC_REVIEW' }
                });
                if (kycTask) {
                    await tx.branchTask.update({
                        where: { id: kycTask.id },
                        data: {
                            status: 'PENDING',
                            notes: `KYC Rejected: ${notes || 'Reason not specified'}`
                        }
                    });
                }
                await tx.customerProfile.update({
                    where: { id: order.profile.id },
                    data: { kycOverallStatus: 'REJECTED', lastKycReviewedAt: new Date() }
                });
                complianceStatus = 'REJECTED';
                nextStage = 'KYC_STAGE';
            }
            else if (action === 'RESERVE_CURRENCY') {
                for (const item of order.items) {
                    const branchVault = await tx.branchVault.findFirst({
                        where: { branchId: order.branchId, currencyId: item.currencyId }
                    });
                    if (!branchVault || branchVault.totalAmount.toNumber() < item.amount.toNumber()) {
                        const vaultAmt = branchVault ? branchVault.totalAmount.toNumber() : 0;
                        throw new common_1.BadRequestException(`Insufficient branch vault stock for ${item.currency.code}. Needed: ${item.amount}, Available: ${vaultAmt}`);
                    }
                    await tx.inventoryReservation.create({
                        data: {
                            branchId: order.branchId,
                            orderId: order.id,
                            currencyCode: item.currency.code,
                            amount: item.amount,
                            status: 'ACTIVE'
                        }
                    });
                    await tx.vaultTransaction.create({
                        data: {
                            vaultId: branchVault.id,
                            type: 'RESERVE',
                            amount: item.amount
                        }
                    });
                }
                const inventoryTask = await tx.branchTask.findFirst({
                    where: { orderId, taskType: 'INVENTORY_PREP' }
                });
                if (inventoryTask) {
                    await tx.branchTask.update({
                        where: { id: inventoryTask.id },
                        data: { status: 'COMPLETED', resolvedByUserId: user.id }
                    });
                }
                nextStage = 'FULFILLMENT_STAGE';
                if (order.status !== 'PAYMENT_COMPLETED' && order.status !== 'COMPLETED' && order.status !== 'DELIVERED') {
                    nextStatus = 'PAYMENT_PENDING';
                }
            }
            else if (action === 'MARK_READY') {
                nextStage = 'FULFILLMENT_STAGE';
            }
            else if (action === 'COMPLETE_HANDOVER') {
                for (const item of order.items) {
                    const branchVault = await tx.branchVault.findFirst({
                        where: { branchId: order.branchId, currencyId: item.currencyId }
                    });
                    if (branchVault) {
                        await tx.branchVault.update({
                            where: { id: branchVault.id },
                            data: { totalAmount: { decrement: item.amount } }
                        });
                        await tx.vaultTransaction.create({
                            data: {
                                vaultId: branchVault.id,
                                type: 'DEBIT',
                                amount: item.amount
                            }
                        });
                    }
                    await tx.inventoryReservation.updateMany({
                        where: { orderId: order.id, currencyCode: item.currency.code, status: 'ACTIVE' },
                        data: { status: 'CONSUMED' }
                    });
                    await tx.inventoryMovement.create({
                        data: {
                            branchId: order.branchId,
                            currencyCode: item.currency.code,
                            amount: item.amount,
                            direction: 'OUT',
                            movementType: 'ORDER_CONSUMPTION',
                            referenceId: order.id
                        }
                    });
                }
                const handoverTask = await tx.branchTask.findFirst({
                    where: { orderId, taskType: 'HANDOVER' }
                });
                if (handoverTask) {
                    await tx.branchTask.update({
                        where: { id: handoverTask.id },
                        data: { status: 'COMPLETED', resolvedByUserId: user.id }
                    });
                }
                nextStatus = order.deliveryMethod === 'HOME_DELIVERY' ? 'DELIVERED' : 'COMPLETED';
                nextStage = 'COMPLETED';
            }
            else if (action === 'APPROVE_CANCEL') {
                nextStatus = 'CANCELLED';
                nextStage = 'KYC_STAGE';
                await tx.inventoryReservation.updateMany({
                    where: { orderId: order.id, status: 'ACTIVE' },
                    data: { status: 'CANCELLED' }
                });
                await tx.branchTask.updateMany({
                    where: { orderId: order.id, status: 'PENDING' },
                    data: { status: 'CANCELLED', resolvedByUserId: user.id }
                });
            }
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: nextStatus,
                    currentStage: nextStage,
                    complianceStatus,
                    cancelRequested: action === 'APPROVE_CANCEL' ? false : order.cancelRequested
                }
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: nextStatus,
                    changedById: user.id,
                    comments: action === 'ADD_NOTE'
                        ? `CRM Note: ${notes}`
                        : `CRM Checklist Action: ${action} processed. Stage updated to ${nextStage}. Notes: ${notes || 'None'}`
                }
            });
            return updatedOrder;
        });
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: `CRM_ACTION_${action}`,
                entityName: 'Order',
                entityId: orderId,
                newData: { status: result.status, currentStage: result.currentStage }
            }
        }).catch(() => { });
        if (action === 'APPROVE_KYC') {
            this.eventBus.publish('KycApproved', { orderId: result.id, userId: result.profileId, branchId: result.branchId, order: result });
        }
        else if (action === 'REJECT_KYC') {
            this.eventBus.publish('KycRejected', { orderId: result.id, userId: result.profileId, branchId: result.branchId, order: result });
        }
        else if (action === 'RESERVE_CURRENCY') {
            this.eventBus.publish('InventoryReserved', { orderId: result.id, userId: result.profileId, branchId: result.branchId, order: result });
        }
        else if (action === 'COMPLETE_HANDOVER') {
            this.eventBus.publish('OrderCompleted', { orderId: result.id, userId: result.profileId, branchId: result.branchId, order: result });
        }
        return result;
    }
    async reassignLead(orderId, newStaffId, user) {
        const isManager = user.role === 'BRANCH_MANAGER';
        const isSuper = user.role === 'SUPER_ADMIN';
        const isOpsAdmin = user.role === 'OPERATIONS_ADMIN';
        if (!isManager && !isSuper && !isOpsAdmin) {
            throw new common_1.BadRequestException('Only branch managers or admins can reassign leads');
        }
        const order = await this.prisma.order.findUnique({
            where: { id: orderId }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const staff = await this.prisma.user.findUnique({
            where: { id: newStaffId },
            include: { staffProfile: true }
        });
        if (!staff) {
            throw new common_1.BadRequestException('New staff member not found');
        }
        if (user.role !== 'SUPER_ADMIN' && staff.staffProfile?.branchId !== order.branchId) {
            throw new common_1.BadRequestException('Cannot assign lead to a staff member in a different branch');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    assignedStaffId: newStaffId,
                    assignedAt: new Date()
                }
            });
            await tx.branchTask.updateMany({
                where: { orderId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
                data: {
                    assignedToId: newStaffId
                }
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: order.status,
                    changedById: user.id,
                    comments: `Lead reassigned from ${order.assignedStaffId || 'unassigned'} to ${staff.fullName || staff.email}.`
                }
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'REASSIGN_LEAD',
                    entityName: 'Order',
                    entityId: orderId,
                    newData: { oldStaffId: order.assignedStaffId, newStaffId }
                }
            });
            return updatedOrder;
        });
        this.eventBus.publish('LeadClaimed', { orderId: result.id, userId: result.profileId, branchId: result.branchId, order: result });
        return result;
    }
    async getBranchStaff(branchId) {
        if (!branchId)
            return [];
        return this.prisma.user.findMany({
            where: {
                staffProfile: {
                    branchId
                }
            },
            select: {
                id: true,
                fullName: true,
                email: true
            }
        });
    }
    async getBranchCashiers(branchId) {
        if (!branchId)
            return [];
        const employees = await this.prisma.employee.findMany({
            where: {
                branchId,
                status: 'ACTIVE',
                role: 'BRANCH_MANAGER',
                NOT: [
                    { name: { contains: 'Test', mode: 'insensitive' } },
                    { employeeCode: 'EMP-000001' },
                ],
            },
            include: { branch: true },
            orderBy: { name: 'asc' },
        });
        const result = await Promise.all(employees.map(async (emp) => {
            let cashier = await this.prisma.cashier.findUnique({
                where: { employeeCode: emp.employeeCode },
            });
            if (!cashier) {
                cashier = await this.prisma.cashier.create({
                    data: {
                        employeeCode: emp.employeeCode,
                        name: emp.name,
                        branchId: emp.branchId,
                        status: emp.status,
                    },
                });
            }
            const activeOrdersCount = await this.prisma.order.count({
                where: {
                    cashierId: cashier.id,
                    status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
                },
            });
            return {
                id: cashier.id,
                employeeId: emp.id,
                employeeCode: emp.employeeCode,
                name: emp.name,
                branchId: emp.branchId,
                branchName: emp.branch?.branchName || '',
                status: emp.status,
                availability: 'Available',
                activeOrdersCount,
            };
        }));
        return result;
    }
    async getBranchDeliveryPartners(branchId) {
        if (!branchId)
            return [];
        const employees = await this.prisma.employee.findMany({
            where: {
                branchId,
                status: 'ACTIVE',
                role: 'DELIVERY_PARTNER',
                NOT: [
                    { name: { contains: 'Test', mode: 'insensitive' } },
                ],
            },
            include: { branch: true },
            orderBy: { name: 'asc' },
        });
        const result = await Promise.all(employees.map(async (emp) => {
            let dp = await this.prisma.deliveryPartner.findUnique({
                where: { employeeCode: emp.employeeCode },
            });
            if (!dp) {
                dp = await this.prisma.deliveryPartner.create({
                    data: {
                        employeeCode: emp.employeeCode,
                        name: emp.name,
                        branchId: emp.branchId,
                        status: emp.status,
                    },
                });
            }
            const activeOrdersCount = await this.prisma.order.count({
                where: {
                    deliveryPartnerId: dp.id,
                    status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
                },
            });
            return {
                id: dp.id,
                employeeId: emp.id,
                employeeCode: emp.employeeCode,
                name: emp.name,
                branchId: emp.branchId,
                branchName: emp.branch?.branchName || '',
                status: emp.status,
                availability: 'Available',
                activeOrdersCount,
            };
        }));
        return result;
    }
    async assignFulfillment(orderId, data, user) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                cashAllocation: true,
                items: { include: { product: true } }
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (!order.cashAllocation && order.productType !== 'CASH_SELL') {
            throw new common_1.BadRequestException('Cash allocation must be completed before assigning fulfillment.');
        }
        const isManager = user.role === 'BRANCH_MANAGER';
        const isSuper = user.role === 'SUPER_ADMIN';
        const isOpsAdmin = user.role === 'OPERATIONS_ADMIN';
        const isAssigned = order.assignedStaffId === user.id;
        if (!isAssigned && !isManager && !isSuper && !isOpsAdmin) {
            throw new common_1.BadRequestException('Only the assigned lead owner or a manager/admin can assign fulfillment.');
        }
        const isAlreadyAssigned = !!(order.cashierId || order.deliveryPartnerId);
        if (isAlreadyAssigned && !isManager && !isSuper && !isOpsAdmin) {
            throw new common_1.BadRequestException('Only a branch manager or administrator can override existing fulfillment assignments.');
        }
        const isPickup = order.deliveryMethod === 'PICKUP' || order.deliveryMethod === 'STORE_PICKUP';
        return this.prisma.$transaction(async (tx) => {
            let cashierName = '';
            let partnerName = '';
            let updateData = {};
            if (isPickup) {
                if (!data.cashierId) {
                    throw new common_1.BadRequestException('Cashier ID is required for branch pickup orders.');
                }
                const cashier = await tx.cashier.findUnique({
                    where: { id: data.cashierId }
                });
                if (!cashier || cashier.branchId !== order.branchId) {
                    throw new common_1.BadRequestException('Selected cashier is invalid or not in this branch.');
                }
                const emp = await tx.employee.findUnique({
                    where: { employeeCode: cashier.employeeCode }
                });
                if (!emp || emp.status !== 'ACTIVE' || (emp.role !== 'BRANCH_CASHIER' && emp.role !== 'BRANCH_MANAGER') || emp.branchId !== order.branchId) {
                    throw new common_1.BadRequestException('Selected manager is not active in this branch.');
                }
                cashierName = cashier.name;
                updateData = {
                    cashierId: data.cashierId,
                    deliveryPartnerId: null,
                    fulfillmentStatus: 'ASSIGNED_TO_CASHIER'
                };
            }
            else {
                if (!data.deliveryPartnerId) {
                    throw new common_1.BadRequestException('Delivery partner ID is required for home delivery orders.');
                }
                const partner = await tx.deliveryPartner.findUnique({
                    where: { id: data.deliveryPartnerId }
                });
                if (!partner || partner.branchId !== order.branchId) {
                    throw new common_1.BadRequestException('Selected delivery partner is invalid or not in this branch.');
                }
                const emp = await tx.employee.findUnique({
                    where: { employeeCode: partner.employeeCode }
                });
                if (!emp || emp.status !== 'ACTIVE' || emp.role !== 'DELIVERY_PARTNER' || emp.branchId !== order.branchId) {
                    throw new common_1.BadRequestException('Selected delivery partner is not an active Delivery Partner in this branch.');
                }
                partnerName = partner.name;
                updateData = {
                    cashierId: null,
                    deliveryPartnerId: data.deliveryPartnerId,
                    fulfillmentStatus: 'ASSIGNED_TO_DELIVERY'
                };
            }
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: updateData,
                include: {
                    cashier: true,
                    deliveryPartner: true
                }
            });
            const handoverTask = await tx.branchTask.findFirst({
                where: { orderId, taskType: 'HANDOVER', status: { not: 'COMPLETED' } }
            });
            if (handoverTask) {
                await tx.branchTask.update({
                    where: { id: handoverTask.id },
                    data: {
                        notes: isPickup
                            ? `Assigned to cashier: ${cashierName}`
                            : `Assigned to delivery agent: ${partnerName}`,
                    }
                });
            }
            let auditAction = '';
            if (isAlreadyAssigned) {
                auditAction = isManager || isSuper || isOpsAdmin ? 'MANAGER_OVERRIDE' : 'ASSIGNMENT_CHANGED';
            }
            else {
                auditAction = isPickup ? 'CASHIER_ASSIGNED' : 'DELIVERY_PARTNER_ASSIGNED';
            }
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: auditAction,
                    entityName: 'Order',
                    entityId: order.id,
                    newData: {
                        cashierId: updateData.cashierId,
                        deliveryPartnerId: updateData.deliveryPartnerId,
                        fulfillmentStatus: updateData.fulfillmentStatus,
                        reassigned: isAlreadyAssigned
                    },
                    branchId: order.branchId
                }
            });
            if (isPickup) {
                this.eventBus.publish('CashierAssigned', {
                    orderId: order.id,
                    cashierId: data.cashierId,
                    cashierName,
                    branchId: order.branchId,
                    userId: user.id,
                    reassigned: isAlreadyAssigned
                });
            }
            else {
                this.eventBus.publish('DeliveryPartnerAssigned', {
                    orderId: order.id,
                    deliveryPartnerId: data.deliveryPartnerId,
                    partnerName,
                    branchId: order.branchId,
                    userId: user.id,
                    reassigned: isAlreadyAssigned
                });
            }
            this.eventBus.publish('FulfillmentAssigned', {
                orderId: order.id,
                branchId: order.branchId,
                fulfillmentStatus: updateData.fulfillmentStatus,
                deliveryMethod: order.deliveryMethod
            });
            return updatedOrder;
        });
    }
    async forwardRemittanceToPartner(orderId, data, user) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId }
            });
            if (!order || order.productType !== 'REMITTANCE') {
                throw new common_1.NotFoundException('Remittance order not found');
            }
            if (order.complianceStatus === 'REJECTED' || order.complianceStatus !== 'APPROVED') {
                throw new common_1.BadRequestException('Cannot forward remittance order to partner dealer because KYC / Compliance status is REJECTED or not APPROVED');
            }
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: 'FORWARDED_TO_PARTNER',
                    currentStage: 'FORWARDED_TO_PARTNER'
                }
            });
            const detail = await tx.remittanceDetail.findFirst({
                where: { orderItem: { orderId } }
            });
            if (detail) {
                await tx.remittanceDetail.update({
                    where: { id: detail.id },
                    data: {
                        forwardedAt: new Date(),
                        forwardedByUserId: user.id,
                        partnerReference: data.partnerReference || null,
                        partnerRemarks: data.partnerRemarks || null,
                        partnerStatus: 'FORWARDED'
                    }
                });
            }
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: 'FORWARDED_TO_PARTNER',
                    changedById: user.id,
                    comments: `Remittance case manually forwarded to Partner Dealer by ${user.fullName || user.email}. Ref: ${data.partnerReference || 'N/A'}`
                }
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'REMITTANCE_FORWARDED_TO_PARTNER',
                    entityName: 'Order',
                    entityId: orderId,
                    newData: {
                        partnerReference: data.partnerReference,
                        partnerRemarks: data.partnerRemarks,
                        status: 'FORWARDED_TO_PARTNER'
                    },
                    branchId: order.branchId
                }
            });
            return updatedOrder;
        });
    }
    async updateRemittancePartnerStatus(orderId, data, user) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId }
            });
            if (!order || order.productType !== 'REMITTANCE') {
                throw new common_1.NotFoundException('Remittance order not found');
            }
            let newOrderStatus = order.status;
            let auditAction = 'REMITTANCE_PARTNER_STATUS_UPDATED';
            if (data.partnerStatus === 'PARTNER_PROCESSING') {
                newOrderStatus = 'PARTNER_PROCESSING';
            }
            else if (data.partnerStatus === 'TRANSFER_COMPLETED' || data.partnerStatus === 'COMPLETED') {
                newOrderStatus = 'TRANSFER_COMPLETED';
                auditAction = 'REMITTANCE_TRANSFER_COMPLETED';
            }
            else if (data.partnerStatus === 'REJECTED') {
                newOrderStatus = 'REJECTED';
                auditAction = 'REMITTANCE_TRANSFER_REJECTED';
            }
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: newOrderStatus,
                    currentStage: newOrderStatus === 'TRANSFER_COMPLETED' ? 'COMPLETED' : newOrderStatus
                }
            });
            const detail = await tx.remittanceDetail.findFirst({
                where: { orderItem: { orderId } }
            });
            if (detail) {
                await tx.remittanceDetail.update({
                    where: { id: detail.id },
                    data: {
                        partnerStatus: data.partnerStatus,
                        ...(data.partnerReference ? { partnerReference: data.partnerReference } : {}),
                        ...(data.partnerRemarks ? { partnerRemarks: data.partnerRemarks } : {})
                    }
                });
            }
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: newOrderStatus,
                    changedById: user.id,
                    comments: `Partner status updated to ${data.partnerStatus}. Remarks: ${data.partnerRemarks || 'N/A'}`
                }
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: auditAction,
                    entityName: 'Order',
                    entityId: orderId,
                    newData: {
                        partnerStatus: data.partnerStatus,
                        partnerReference: data.partnerReference,
                        partnerRemarks: data.partnerRemarks,
                        orderStatus: newOrderStatus
                    },
                    branchId: order.branchId
                }
            });
            return updatedOrder;
        });
    }
    async sendToBranch(orderId, data, user) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { profile: true, branch: true }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.complianceLocked) {
            throw new common_1.BadRequestException('Compliance is already completed and locked for this order.');
        }
        const destinationBranchId = data.targetBranchId || order.branchId;
        const targetBranch = await this.prisma.branch.findUnique({ where: { id: destinationBranchId } });
        if (!targetBranch) {
            throw new common_1.NotFoundException('Destination branch not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    assignedCentralStaffId: user.id,
                    currentBranchId: destinationBranchId,
                    branchId: destinationBranchId,
                    complianceLocked: true,
                    complianceCompletedAt: new Date(),
                    complianceStatus: 'APPROVED',
                    currentStage: 'BRANCH_EXECUTION_STAGE',
                }
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: order.status,
                    changedById: user.id,
                    comments: `Central Operations completed compliance and sent order to Branch: ${targetBranch.branchName}. ${data.remarks ? 'Remarks: ' + data.remarks : ''}`,
                }
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'COMPLIANCE_COMPLETED_SENT_TO_BRANCH',
                    entityName: 'Order',
                    entityId: orderId,
                    newData: { destinationBranchId, complianceLocked: true, staffId: user.id },
                    branchId: destinationBranchId
                }
            });
            try {
                await this.eventBus.publish('OrderSentToBranch', {
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    branchId: destinationBranchId,
                    branchName: targetBranch.branchName,
                    centralStaffId: user.id,
                    timestamp: new Date().toISOString()
                });
            }
            catch (e) {
            }
            return updatedOrder;
        });
    }
    async getSameCityBranches(branchId) {
        if (!branchId) {
            return this.prisma.branch.findMany();
        }
        const currentBranch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!currentBranch || !currentBranch.branchCity) {
            return this.prisma.branch.findMany();
        }
        return this.prisma.branch.findMany({
            where: {
                branchCity: { equals: currentBranch.branchCity, mode: 'insensitive' },
            },
            orderBy: { branchName: 'asc' },
        });
    }
    async reassignBranch(orderId, data, user) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { branch: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const currentBranch = await this.prisma.branch.findUnique({ where: { id: order.branchId } });
        const targetBranch = await this.prisma.branch.findUnique({ where: { id: data.targetBranchId } });
        if (!targetBranch) {
            throw new common_1.NotFoundException('Destination branch not found');
        }
        if (currentBranch?.branchCity && targetBranch.branchCity) {
            if (currentBranch.branchCity.toLowerCase() !== targetBranch.branchCity.toLowerCase()) {
                throw new common_1.BadRequestException(`Branch reassignment restricted to same city (${currentBranch.branchCity}). Target branch city: ${targetBranch.branchCity}`);
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    currentBranchId: data.targetBranchId,
                    branchId: data.targetBranchId,
                    reassignedBranchId: data.targetBranchId,
                    reassignedBy: user.fullName || user.email || user.id,
                    reassignedAt: new Date(),
                    reassignmentReason: data.reason,
                },
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: order.status,
                    changedById: user.id,
                    comments: `Branch reassigned from ${currentBranch?.branchName || order.branchId} to ${targetBranch.branchName}. Reason: ${data.reason}`,
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'BRANCH_REASSIGNED',
                    entityName: 'Order',
                    entityId: orderId,
                    newData: {
                        fromBranchId: order.branchId,
                        toBranchId: data.targetBranchId,
                        reason: data.reason,
                    },
                    branchId: data.targetBranchId,
                },
            });
            return updatedOrder;
        });
    }
    async getCityBranchInventoryComparison(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                branch: true,
                items: { include: { currency: true } },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const prefBranch = order.branch;
        const item = order.items?.[0];
        const currencyCode = item?.currency?.code || 'USD';
        const currencySymbol = item?.currency?.symbol || '$';
        const requestedAmount = Number(item?.amount || 0);
        const sameCityBranches = await this.prisma.branch.findMany({
            where: prefBranch?.branchCity
                ? { branchCity: { equals: prefBranch.branchCity, mode: 'insensitive' } }
                : {},
            orderBy: { branchName: 'asc' },
        });
        const branchIds = sameCityBranches.map(b => b.id);
        const branchInventories = await this.prisma.branchInventory.findMany({
            where: {
                branchId: { in: branchIds },
                currencyCode: currencyCode,
            },
        });
        const branchVaults = await this.prisma.branchVault.findMany({
            where: {
                branchId: { in: branchIds },
            },
        });
        const comparisonList = sameCityBranches.map(branch => {
            const inv = branchInventories.find(i => i.branchId === branch.id);
            const vault = branchVaults.find(v => v.branchId === branch.id);
            const availableStock = inv ? Number(inv.availableAmount) : (vault ? Number(vault.totalAmount) : 0);
            const reservedStock = inv ? Number(inv.reservedAmount) : 0;
            const remainingStock = Math.max(0, availableStock - reservedStock);
            const isPreferred = branch.id === (order.originalBranchId || order.branchId);
            const isCurrent = branch.id === (order.currentBranchId || order.branchId);
            let status = 'HEALTHY';
            if (availableStock < requestedAmount) {
                status = 'CRITICAL';
            }
            else if (availableStock < requestedAmount * 1.5) {
                status = 'LOW';
            }
            const shortage = Math.max(0, requestedAmount - availableStock);
            const canFulfill = availableStock >= requestedAmount;
            return {
                id: branch.id,
                branchName: branch.branchName,
                branchCode: branch.branchCode,
                branchCity: branch.branchCity,
                isPreferred,
                isCurrent,
                requestedCurrency: currencyCode,
                currencySymbol,
                requestedAmount,
                availableStock,
                reservedStock,
                remainingStock,
                status,
                shortage,
                canFulfill,
                recommendationTag: 'NOT_RECOMMENDED',
                recommendationReason: '',
            };
        });
        const preferredItem = comparisonList.find(b => b.isPreferred) || comparisonList[0];
        const prefCanFulfill = preferredItem ? preferredItem.canFulfill : false;
        const prefShortage = preferredItem ? preferredItem.shortage : requestedAmount;
        const candidates = comparisonList.filter(b => b.canFulfill);
        candidates.sort((a, b) => {
            if (a.reservedStock !== b.reservedStock) {
                return a.reservedStock - b.reservedStock;
            }
            return b.availableStock - a.availableStock;
        });
        let recommendedBranchItem = candidates.find(b => !b.isPreferred) || candidates[0] || null;
        if (!prefCanFulfill && candidates.length > 0) {
            recommendedBranchItem = candidates[0];
        }
        comparisonList.forEach(b => {
            if (b.canFulfill) {
                if (recommendedBranchItem && b.id === recommendedBranchItem.id) {
                    b.recommendationTag = 'RECOMMENDED';
                    b.recommendationReason = 'Sufficient inventory available in same city. Can fulfill order immediately.';
                }
                else if (b.isPreferred) {
                    b.recommendationTag = 'RECOMMENDED';
                    b.recommendationReason = 'Customer preferred branch has sufficient inventory.';
                }
                else {
                    b.recommendationTag = 'ALTERNATIVE';
                    b.recommendationReason = 'Healthy inventory backup in same city.';
                }
            }
            else {
                if (b.isPreferred) {
                    b.recommendationTag = 'NOT_RECOMMENDED';
                    b.recommendationReason = `Inventory shortage of ${currencySymbol}${prefShortage.toLocaleString()} ${currencyCode}.`;
                }
                else {
                    b.recommendationTag = 'UNAVAILABLE';
                    b.recommendationReason = `Insufficient stock for requested ${currencySymbol}${requestedAmount.toLocaleString()} ${currencyCode}.`;
                }
            }
        });
        return {
            orderId: order.id,
            orderNumber: order.orderNumber,
            city: prefBranch?.branchCity || 'Bengaluru',
            requestedCurrency: currencyCode,
            currencySymbol,
            requestedAmount,
            preferredBranch: preferredItem,
            preferredCanFulfill: prefCanFulfill,
            preferredShortage: prefShortage,
            recommendedBranch: recommendedBranchItem,
            sameCityBranches: comparisonList,
        };
    }
    async smartAssignBranch(orderId, data, user) {
        const comparison = await this.getCityBranchInventoryComparison(orderId);
        const targetBranch = comparison.sameCityBranches.find(b => b.id === data.targetBranchId);
        if (!targetBranch) {
            throw new common_1.NotFoundException('Selected target branch not found in city network.');
        }
        const defaultReason = comparison.preferredCanFulfill
            ? `Assigned to customer preferred branch ${targetBranch.branchName}.`
            : `Reassigned from ${comparison.preferredBranch?.branchName || 'Preferred Branch'} to ${targetBranch.branchName} due to inventory shortage (${comparison.currencySymbol}${comparison.preferredShortage} ${comparison.requestedCurrency} short).`;
        const reason = data.reason || defaultReason;
        const updatedOrder = await this.reassignBranch(orderId, { targetBranchId: data.targetBranchId, reason }, user);
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'SMART_BRANCH_ASSIGNMENT',
                entityName: 'Order',
                entityId: orderId,
                newData: {
                    preferredBranch: comparison.preferredBranch?.branchName,
                    assignedBranch: targetBranch.branchName,
                    requestedAmount: `${comparison.currencySymbol}${comparison.requestedAmount} ${comparison.requestedCurrency}`,
                    preferredAvailable: `${comparison.currencySymbol}${comparison.preferredBranch?.availableStock || 0} ${comparison.requestedCurrency}`,
                    assignedAvailable: `${comparison.currencySymbol}${targetBranch.availableStock} ${comparison.requestedCurrency}`,
                    reason,
                },
                branchId: data.targetBranchId,
            },
        });
        this.eventBus.publish('ORDER_UPDATED', { orderId: updatedOrder.id, status: updatedOrder.status });
        this.eventBus.publish('BRANCH_REASSIGNED', { orderId: updatedOrder.id, branchId: data.targetBranchId });
        return {
            success: true,
            order: updatedOrder,
            assignedBranch: targetBranch,
            message: `Order #${updatedOrder.orderNumber} successfully assigned to ${targetBranch.branchName}.`,
        };
    }
};
exports.OpsService = OpsService;
exports.OpsService = OpsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        compliance_service_1.ComplianceService,
        workflow_validator_service_1.WorkflowValidatorService,
        domain_event_bus_service_1.DomainEventBus])
], OpsService);
//# sourceMappingURL=ops.service.js.map