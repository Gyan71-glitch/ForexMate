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
var ComplianceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ocr_adapter_1 = require("./providers/ocr.adapter");
const path = __importStar(require("path"));
let ComplianceService = ComplianceService_1 = class ComplianceService {
    prisma;
    ocrAdapter;
    logger = new common_1.Logger(ComplianceService_1.name);
    constructor(prisma, ocrAdapter) {
        this.prisma = prisma;
        this.ocrAdapter = ocrAdapter;
    }
    async evaluateCashBuyKycEligibility(userId) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId }
        });
        if (!profile) {
            return { eligible: false, complianceStatus: 'PENDING', docStates: {}, requiredDocTypes: [] };
        }
        const purpose = profile.travelPurpose || 'TOURISM';
        const requiredRules = await this.getKycRules('CASH_BUY', purpose);
        const requiredDocTypes = requiredRules.filter(r => r.required).map(r => r.type);
        const userDocs = await this.prisma.kycDocument.findMany({
            where: { userId }
        });
        const docStates = {};
        for (const type of requiredDocTypes) {
            const doc = userDocs.find(d => d.docType === type);
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
        let complianceStatus;
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
            complianceStatus,
            docStates,
            requiredDocTypes
        };
    }
    async getPendingKyc() {
        return this.prisma.kycDocument.findMany({
            where: { status: { in: ['PENDING', 'REVIEWING'] } },
            include: {
                user: {
                    select: { fullName: true, email: true, mobile: true }
                },
                ocrData: true
            },
            orderBy: { createdAt: 'asc' }
        });
    }
    async getKycRules(product, purpose) {
        let rules = await this.prisma.kycVerificationRule.findMany({
            where: {
                isActive: true,
                OR: [
                    { product: null },
                    { product: product }
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
        if (product === 'CASH_SELL') {
            rules = rules.filter(r => r.docType === 'PAN' || r.docType === 'PASSPORT');
        }
        const docsMap = new Map();
        rules.forEach(r => {
            if (!docsMap.has(r.docType) || (r.required && !docsMap.get(r.docType).required)) {
                docsMap.set(r.docType, {
                    type: r.docType,
                    name: r.ruleName,
                    required: r.required,
                    reason: r.description,
                    usedFor: r.usedFor || []
                });
            }
        });
        return Array.from(docsMap.values());
    }
    async evaluateLrsEligibility(tx, profileId, orderAmountInr, skipOrderId) {
        const profile = await tx.customerProfile.findUnique({
            where: { id: profileId },
            include: { user: true }
        });
        if (!profile) {
            return { eligible: false, reason: 'Profile not found' };
        }
        if (profile.passportExpiry) {
            const currentDate = new Date();
            if (new Date(profile.passportExpiry) < currentDate) {
                return { eligible: false, reason: 'Passport is expired' };
            }
            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
            if (new Date(profile.passportExpiry) < sixMonthsFromNow) {
                return { eligible: false, reason: 'Passport expires in less than 6 months' };
            }
        }
        let isRemittance = false;
        let remittancePurposeCode = '';
        let remittanceRequiredDocs = [];
        if (skipOrderId) {
            const order = await tx.order.findUnique({
                where: { id: skipOrderId }
            });
            if (order) {
                if (order.productType === 'REMITTANCE') {
                    isRemittance = true;
                    const rd = await tx.remittanceDetail.findFirst({
                        where: { orderItem: { orderId: skipOrderId } },
                        include: { purpose: { include: { documentRequirements: true } } }
                    });
                    if (rd && rd.purpose) {
                        remittancePurposeCode = rd.purpose.code;
                        remittanceRequiredDocs = rd.purpose.documentRequirements.map((d) => d.docType);
                    }
                }
                else if (order.productType !== 'CASH_SELL') {
                    if (!order.travelDestination) {
                        return { eligible: false, reason: 'Travel destination is missing in order details' };
                    }
                    if (!order.departureDate) {
                        return { eligible: false, reason: 'Travel departure date is missing in order details' };
                    }
                    const currentDate = new Date();
                    if (new Date(order.departureDate) < currentDate) {
                        return { eligible: false, reason: 'Departure date cannot be in the past' };
                    }
                }
            }
        }
        const docs = await tx.kycDocument.findMany({
            where: { userId: profile.userId }
        });
        const panDoc = docs.find((d) => d.docType === 'PAN');
        const passportDoc = docs.find((d) => d.docType === 'PASSPORT');
        if (!panDoc || panDoc.status !== 'APPROVED') {
            return { eligible: false, reason: 'PAN is not approved' };
        }
        if (!passportDoc || passportDoc.status !== 'APPROVED') {
            return { eligible: false, reason: 'Passport is not approved' };
        }
        let requiredDocTypes = [];
        if (isRemittance) {
            if (!remittancePurposeCode) {
                return { eligible: false, reason: 'Remittance purpose is missing' };
            }
            requiredDocTypes = remittanceRequiredDocs.filter((type) => type !== 'PAN' && type !== 'PASSPORT');
        }
        else {
            if (!profile.travelPurpose) {
                return { eligible: false, reason: 'Travel purpose is not selected' };
            }
            const purpose = profile.travelPurpose;
            const rules = await tx.kycVerificationRule.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { product: null },
                        { product: 'CASH_BUY' }
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
            requiredDocTypes = rules.filter((r) => r.required && r.docType !== 'PAN' && r.docType !== 'PASSPORT').map((r) => r.docType);
        }
        for (const type of requiredDocTypes) {
            const doc = docs.find((d) => d.docType === type);
            if (!doc || doc.status !== 'APPROVED') {
                return { eligible: false, reason: `${type} is not approved` };
            }
        }
        const currentYear = new Date().getFullYear();
        const financialYear = `${currentYear}-${currentYear + 1}`;
        const lrsTracker = await tx.lrsLimitTracker.findUnique({
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
        const activeOrders = await tx.order.findMany({
            where: {
                profileId,
                status: { notIn: ['CANCELLED', 'REJECTED'] },
                ...(skipOrderId ? { id: { not: skipOrderId } } : {})
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
    async reviewKyc(docId, dto, reviewerId) {
        const doc = await this.prisma.kycDocument.findUnique({
            where: { id: docId }
        });
        if (!doc) {
            throw new common_1.NotFoundException('KYC Document not found');
        }
        if (doc.status !== 'REVIEWING') {
            throw new common_1.BadRequestException('Document is not ready for review or has already been reviewed');
        }
        const decision = dto.status;
        return this.prisma.$transaction(async (tx) => {
            const updatedDoc = await tx.kycDocument.update({
                where: { id: docId },
                data: { status: decision }
            });
            await tx.kycReview.create({
                data: {
                    documentId: docId,
                    reviewerId,
                    decision,
                    notes: dto.remarks || ''
                }
            });
            if (decision === 'APPROVED') {
                const ocrData = await tx.documentOcrData.findFirst({
                    where: { documentId: docId }
                });
                if (ocrData && ocrData.extractedData) {
                    const extData = ocrData.extractedData;
                    const updateData = {};
                    if (doc.docType === 'PAN' && extData.documentNumber) {
                        updateData.panNumber = extData.documentNumber;
                    }
                    else if (doc.docType === 'PASSPORT' && extData.documentNumber) {
                        updateData.passportNo = extData.documentNumber;
                        if (extData.expiryDate) {
                            try {
                                updateData.passportExpiry = new Date(extData.expiryDate);
                            }
                            catch (_) { }
                        }
                    }
                    if (extData.dob) {
                        try {
                            updateData.dob = new Date(extData.dob);
                        }
                        catch (_) { }
                    }
                    const userProfile = await tx.customerProfile.findUnique({
                        where: { userId: doc.userId }
                    });
                    if (userProfile && Object.keys(updateData).length > 0) {
                        await tx.customerProfile.update({
                            where: { id: userProfile.id },
                            data: updateData
                        });
                    }
                }
            }
            await tx.auditLog.create({
                data: {
                    userId: reviewerId,
                    action: `REVIEW_KYC_${decision}`,
                    entityName: 'KycDocument',
                    entityId: docId,
                    newData: { status: decision, remarks: dto.remarks }
                }
            });
            const userProfile = await tx.customerProfile.findUnique({
                where: { userId: doc.userId }
            });
            if (userProfile) {
                const purpose = userProfile.travelPurpose || 'TOURISM';
                const latestOrder = await tx.order.findFirst({
                    where: { profileId: userProfile.id },
                    orderBy: { createdAt: 'desc' }
                });
                const isSell = latestOrder?.productType === 'CASH_SELL';
                let rules = await tx.kycVerificationRule.findMany({
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
                const userDocs = await tx.kycDocument.findMany({
                    where: { userId: doc.userId }
                });
                const docStates = {};
                for (const type of requiredDocTypes) {
                    const uDoc = userDocs.find(d => d.docType === type);
                    if (!uDoc) {
                        docStates[type] = 'MISSING';
                    }
                    else {
                        docStates[type] = uDoc.id === docId ? decision : uDoc.status;
                    }
                }
                const allApproved = requiredDocTypes.every(type => docStates[type] === 'APPROVED');
                const hasRejected = requiredDocTypes.some(type => docStates[type] === 'REJECTED');
                let kycOverallStatus = 'PENDING';
                if (allApproved) {
                    kycOverallStatus = 'VERIFIED';
                }
                else if (hasRejected) {
                    kycOverallStatus = 'REJECTED';
                }
                await tx.customerProfile.update({
                    where: { id: userProfile.id },
                    data: {
                        kycOverallStatus,
                        lastKycReviewedAt: new Date()
                    }
                });
                const orders = await tx.order.findMany({
                    where: {
                        profileId: userProfile.id,
                        status: { notIn: ['COMPLETED', 'CANCELLED', 'DELIVERED'] }
                    }
                });
                for (const order of orders) {
                    let newComplianceStatus = 'PENDING';
                    let newStage = order.currentStage;
                    let nextStatus = order.status;
                    if (allApproved) {
                        const isHighRisk = userProfile.riskCategory === 'HIGH';
                        if (isHighRisk) {
                            await tx.auditLog.create({
                                data: {
                                    userId: reviewerId,
                                    action: 'AML_SCREENING_FLAGGED',
                                    entityName: 'Order',
                                    entityId: order.id,
                                    newData: { riskCategory: 'HIGH', orderNumber: order.orderNumber }
                                }
                            });
                            const alertRecipients = await tx.user.findMany({
                                where: {
                                    roleRef: {
                                        name: { in: ['SUPER_ADMIN', 'COMPLIANCE'] }
                                    }
                                }
                            });
                            for (const recipient of alertRecipients) {
                                await tx.inAppNotification.create({
                                    data: {
                                        userId: recipient.id,
                                        title: 'AML Risk Detected',
                                        message: `Risk flag detected for customer ${userProfile.id || 'User'} on order ${order.orderNumber}. Processing continued.`,
                                        actionUrl: `/ops/kyc`,
                                        orderId: order.id
                                    }
                                });
                            }
                        }
                        else {
                            await tx.auditLog.create({
                                data: {
                                    userId: reviewerId,
                                    action: 'AML_SCREENING_CLEARED',
                                    entityName: 'Order',
                                    entityId: order.id,
                                    newData: { riskCategory: userProfile.riskCategory, orderNumber: order.orderNumber }
                                }
                            });
                        }
                        const lrsCheck = await this.evaluateLrsEligibility(tx, userProfile.id, order.totalAmountInr.toNumber(), order.id);
                        if (lrsCheck.eligible) {
                            newComplianceStatus = 'APPROVED';
                            if (order.productType === 'CASH_SELL') {
                                nextStatus = 'KYC_APPROVED';
                                newStage = 'FULFILLMENT_STAGE';
                            }
                            else if (order.status === 'PAYMENT_COMPLETED') {
                                nextStatus = 'PAYMENT_COMPLETED';
                                newStage = 'INVENTORY_STAGE';
                            }
                            else {
                                nextStatus = 'PAYMENT_PENDING';
                                newStage = 'PAYMENT_STAGE';
                            }
                            await tx.order.update({
                                where: { id: order.id },
                                data: {
                                    complianceStatus: newComplianceStatus,
                                    status: nextStatus,
                                    currentStage: newStage
                                }
                            });
                            await tx.branchTask.updateMany({
                                where: {
                                    orderId: order.id,
                                    taskType: 'KYC_REVIEW',
                                    status: { in: ['PENDING', 'IN_PROGRESS'] }
                                },
                                data: {
                                    status: 'COMPLETED',
                                    resolvedByUserId: reviewerId,
                                    notes: dto.remarks || 'KYC approved globally, AML cleared, and LRS eligible.'
                                }
                            });
                            await tx.orderStatusHistory.create({
                                data: {
                                    orderId: order.id,
                                    status: nextStatus,
                                    changedById: reviewerId,
                                    comments: `KYC approved, AML ${isHighRisk ? 'FLAGGED' : 'CLEARED'}, LRS ELIGIBLE. Status updated to ${nextStatus}.`
                                }
                            });
                            if (order.productType === 'CASH_SELL') {
                                await tx.inAppNotification.create({
                                    data: {
                                        userId: userProfile.userId,
                                        title: 'KYC Approved',
                                        message: `Your KYC documents have been approved for order ${order.orderNumber}.`,
                                        actionUrl: `/dashboard/orders/${order.id}`,
                                        orderId: order.id
                                    }
                                });
                                await tx.inAppNotification.create({
                                    data: {
                                        userId: userProfile.userId,
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
                            const currentYear = new Date().getFullYear();
                            const financialYear = `${currentYear}-${currentYear + 1}`;
                            const usdSpent = order.totalAmountInr.toNumber() / 83;
                            await tx.lrsLimitTracker.upsert({
                                where: {
                                    profileId_financialYear: {
                                        profileId: userProfile.id,
                                        financialYear
                                    }
                                },
                                update: {
                                    systemSpentAmountUsd: { increment: usdSpent }
                                },
                                create: {
                                    profileId: userProfile.id,
                                    financialYear,
                                    systemSpentAmountUsd: usdSpent
                                }
                            });
                        }
                        else {
                            newComplianceStatus = 'LRS_FAILED';
                            nextStatus = 'CANCELLED';
                            await tx.order.update({
                                where: { id: order.id },
                                data: {
                                    complianceStatus: newComplianceStatus,
                                    status: nextStatus
                                }
                            });
                            await tx.branchTask.updateMany({
                                where: {
                                    orderId: order.id,
                                    taskType: 'KYC_REVIEW',
                                    status: { in: ['PENDING', 'IN_PROGRESS'] }
                                },
                                data: {
                                    status: 'CANCELLED',
                                    resolvedByUserId: reviewerId,
                                    notes: `LRS Failed: ${lrsCheck.reason}. Remaining limit: ₹${lrsCheck.remainingInr || 0}`
                                }
                            });
                            await tx.orderStatusHistory.create({
                                data: {
                                    orderId: order.id,
                                    status: nextStatus,
                                    changedById: reviewerId,
                                    comments: `LRS Limit Exceeded. You cannot purchase this amount. Remaining Limit: ₹${lrsCheck.remainingInr || 0}`
                                }
                            });
                            await tx.inAppNotification.create({
                                data: {
                                    userId: userProfile.userId,
                                    title: 'LRS Limit Exceeded',
                                    message: `Your order ${order.orderNumber} was cancelled. You cannot purchase this amount. Remaining LRS Limit: ₹${lrsCheck.remainingInr || 0}`,
                                    actionUrl: `/dashboard/orders/${order.id}`,
                                    orderId: order.id
                                }
                            });
                        }
                    }
                    else if (kycOverallStatus === 'REJECTED') {
                        newComplianceStatus = 'REJECTED';
                        nextStatus = order.status;
                        await tx.order.update({
                            where: { id: order.id },
                            data: {
                                complianceStatus: newComplianceStatus,
                                status: nextStatus,
                                currentStage: 'KYC_STAGE'
                            }
                        });
                        await tx.branchTask.updateMany({
                            where: {
                                orderId: order.id,
                                taskType: 'KYC_REVIEW',
                                status: { in: ['PENDING', 'IN_PROGRESS'] }
                            },
                            data: {
                                status: 'PENDING',
                                notes: `KYC Rejected: ${dto.remarks || 'Documents invalid'}`
                            }
                        });
                        await tx.orderStatusHistory.create({
                            data: {
                                orderId: order.id,
                                status: nextStatus,
                                changedById: reviewerId,
                                comments: `KYC rejected by reviewer: ${dto.remarks || 'Documents invalid'}. Awaiting customer re-upload.`
                            }
                        });
                        await tx.inAppNotification.create({
                            data: {
                                userId: userProfile.userId,
                                title: 'KYC Verification Rejected',
                                message: `Your KYC documents were rejected. Reason: ${dto.remarks || 'Please upload valid documents'}.`,
                                actionUrl: `/dashboard/kyc`,
                                orderId: order.id
                            }
                        });
                    }
                }
            }
            return updatedDoc;
        });
    }
    async getMyKycDocuments(userId) {
        const docs = await this.prisma.kycDocument.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                ocrData: true,
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
        const userProfile = await this.prisma.customerProfile.findUnique({
            where: { userId }
        });
        const lrsFailedOrder = userProfile
            ? await this.prisma.order.findFirst({
                where: {
                    profileId: userProfile.id,
                    complianceStatus: 'LRS_FAILED'
                }
            })
            : null;
        const hasApproved = docs.some(d => d.status === 'APPROVED');
        const hasRejected = docs.some(d => d.status === 'REJECTED');
        const hasReviewing = docs.some(d => d.status === 'REVIEWING');
        const hasPending = docs.some(d => d.status === 'PENDING');
        let overallStatus;
        if (lrsFailedOrder) {
            overallStatus = 'LRS_FAILED';
        }
        else if (userProfile?.kycOverallStatus === 'VERIFIED') {
            overallStatus = 'APPROVED';
        }
        else if (hasApproved) {
            overallStatus = 'APPROVED';
        }
        else if (hasReviewing) {
            overallStatus = 'REVIEWING';
        }
        else if (hasPending) {
            overallStatus = 'PENDING';
        }
        else if (hasRejected) {
            overallStatus = 'REJECTED';
        }
        else {
            overallStatus = 'NOT_SUBMITTED';
        }
        return { overallStatus, documents: docs };
    }
    async uploadKycDocument(userId, docType, filePath, ocr, knownDocNumber, knownDob, knownName, knownExpiryDate) {
        await this.prisma.kycDocument.deleteMany({
            where: { userId, docType, status: { in: ['PENDING', 'REJECTED'] } }
        });
        const existing = await this.prisma.kycDocument.findFirst({
            where: { userId, docType, status: { in: ['REVIEWING', 'APPROVED'] } }
        });
        if (existing) {
            throw new common_1.BadRequestException(`A ${docType} is already ${existing.status}.`);
        }
        let parsedOcr = ocr;
        if (!parsedOcr || filePath) {
            try {
                const user = await this.prisma.user.findUnique({ where: { id: userId } });
                const customerName = knownName || user?.fullName || 'Customer';
                const ocrResult = await this.ocrAdapter.extractDocumentData(filePath, customerName, docType, knownDocNumber);
                if (!ocrResult.isValidDocType) {
                    if (docType === 'PAN') {
                        throw new common_1.BadRequestException('Could not detect a valid PAN card layout. Please upload an original PAN card photo.');
                    }
                    else if (docType === 'PASSPORT') {
                        throw new common_1.BadRequestException('Could not detect a valid Passport layout. Please upload an original Passport photo.');
                    }
                }
                const extractedDob = ocrResult.extractedText?.dob || knownDob || null;
                const extractedExpiry = ocrResult.extractedText?.expiryDate || knownExpiryDate || null;
                parsedOcr = {
                    confidence: ocrResult.confidence,
                    nameMatch: ocrResult.nameMatch,
                    isExpired: extractedExpiry ? new Date(extractedExpiry) < new Date() : false,
                    ...ocrResult.extractedText,
                    name: ocrResult.extractedText?.name || customerName,
                    dob: extractedDob,
                    expiryDate: extractedExpiry,
                };
            }
            catch (err) {
                this.logger.error('Automatic OCR document extraction failed', err);
                throw new common_1.BadRequestException(err.message || 'Automatic OCR document extraction failed');
            }
        }
        const savedFilename = path.basename(filePath);
        return this.prisma.kycDocument.create({
            data: {
                userId,
                docType,
                filePath: savedFilename,
                status: 'PENDING',
                ...(parsedOcr ? {
                    ocrData: {
                        create: {
                            extractedData: parsedOcr,
                            ocrConfidence: parsedOcr.confidence || 0.95,
                            nameMatched: parsedOcr.nameMatch ?? true,
                            expiryValid: !(parsedOcr.isExpired ?? false)
                        }
                    }
                } : {})
            },
            include: { ocrData: true }
        });
    }
    async deleteKycDocument(userId, docId) {
        const doc = await this.prisma.kycDocument.findUnique({ where: { id: docId } });
        if (!doc || doc.userId !== userId) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (doc.status !== 'PENDING' && doc.status !== 'REJECTED') {
            throw new common_1.BadRequestException('Can only delete documents that are pending or rejected');
        }
        await this.prisma.kycDocument.delete({ where: { id: docId } });
        return { success: true };
    }
    async submitKyc(userId) {
        return this.prisma.$transaction(async (tx) => {
            const result = await tx.kycDocument.updateMany({
                where: { userId, status: 'PENDING' },
                data: { status: 'REVIEWING' }
            });
            const docs = await tx.kycDocument.findMany({
                where: { userId }
            });
            const submittedCount = docs.filter(d => ['REVIEWING', 'APPROVED'].includes(d.status)).length;
            if (submittedCount === 0) {
                throw new common_1.BadRequestException('No documents have been uploaded yet. Please upload your KYC documents first.');
            }
            const hasReviewing = docs.some(d => d.status === 'REVIEWING');
            const hasRejected = docs.some(d => d.status === 'REJECTED');
            let kycOverallStatus = 'PENDING';
            if (hasReviewing) {
                kycOverallStatus = 'REVIEWING';
            }
            else if (hasRejected) {
                kycOverallStatus = 'REJECTED';
            }
            const profile = await tx.customerProfile.findUnique({
                where: { userId }
            });
            if (profile) {
                await tx.customerProfile.update({
                    where: { id: profile.id },
                    data: { kycOverallStatus }
                });
                const orders = await tx.order.findMany({
                    where: {
                        profileId: profile.id,
                        status: { notIn: ['COMPLETED', 'CANCELLED', 'DELIVERED'] }
                    }
                });
                for (const order of orders) {
                    if (order.complianceStatus === 'REJECTED' || order.complianceStatus === 'PENDING') {
                        await tx.order.update({
                            where: { id: order.id },
                            data: { complianceStatus: 'REVIEWING' }
                        });
                        await tx.branchTask.updateMany({
                            where: {
                                orderId: order.id,
                                taskType: 'KYC_REVIEW'
                            },
                            data: {
                                status: 'PENDING',
                                notes: 'KYC re-submitted by customer. Ready for review.'
                            }
                        });
                        await tx.orderStatusHistory.create({
                            data: {
                                orderId: order.id,
                                status: order.status,
                                comments: 'KYC documents re-submitted by customer. Order returned to Review queue.',
                                changedById: userId
                            }
                        });
                    }
                }
            }
            return { success: true, submittedCount };
        });
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = ComplianceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ocr_adapter_1.OcrAdapter])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map