import { RemittanceService } from './remittance.service';
export declare class RemittanceController {
    private readonly remittanceService;
    constructor(remittanceService: RemittanceService);
    getPurposes(): Promise<({
        documentRequirements: {
            id: string;
            required: boolean;
            docType: string;
            purposeId: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string;
        code: string;
        isActive: boolean;
        tcsRate: import("@prisma/client/runtime/library").Decimal;
        tcsThreshold: import("@prisma/client/runtime/library").Decimal;
        tcsRateAbove: import("@prisma/client/runtime/library").Decimal;
        tcsRateBelow: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    getCountries(): Promise<({
        feeConfigurations: {
            id: string;
            countryId: string;
            minAmountInr: import("@prisma/client/runtime/library").Decimal;
            maxAmountInr: import("@prisma/client/runtime/library").Decimal;
            feeAmountInr: import("@prisma/client/runtime/library").Decimal;
            feePercentage: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        isActive: boolean;
        currencyCode: string;
        countryCode: string;
        countryName: string;
    })[]>;
    getPartners(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
    }[]>;
    calculate(req: any, amount: string, currency: string, countryCode: string, purposeCode: string, direction?: string): Promise<{
        exchangeRate: number;
        foreignAmount: number;
        inrSubtotal: number;
        feeAmount: number;
        tcsAmount: number;
        totalInr: number;
        thresholdExceeded: boolean;
        cumulativeSpentInr: number;
        purposeCode: string;
    }>;
    getMyRemittances(req: any): Promise<({
        items: ({
            currency: {
                symbol: string;
                id: string;
                name: string;
                code: string;
                isActive: boolean;
                decimals: number;
            };
            product: {
                id: string;
                name: string;
                code: string;
                isActive: boolean;
            };
            remittance: ({
                partner: {
                    id: string;
                    name: string;
                    isActive: boolean;
                } | null;
            } & {
                id: string;
                swiftCode: string;
                ibanOrAccountNumber: string;
                beneficiaryName: string;
                beneficiaryBank: string;
                beneficiaryAddress: string;
                sourceOfFunds: string | null;
                relationship: string | null;
                chargeType: string | null;
                tcsAmount: import("@prisma/client/runtime/library").Decimal | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentMethod: string | null;
                forwardedAt: Date | null;
                forwardedByUserId: string | null;
                partnerReference: string | null;
                partnerStatus: string | null;
                partnerRemarks: string | null;
                orderItemId: string;
                partnerId: string | null;
                beneficiaryId: string | null;
                purposeId: string | null;
            }) | null;
        } & {
            id: string;
            orderId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            inrSubtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            currencyId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        orderNumber: string;
        profileId: string;
        branchId: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        deliveryMethod: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        updatedAt: Date;
        quoteId: string | null;
        sessionId: string | null;
        assignedStaffId: string | null;
        assignedAt: Date | null;
        productType: string;
        workflowType: string;
        currentStage: string;
        requiresKyc: boolean;
        requiresInventory: boolean;
        requiresPickupHandover: boolean;
        requiresDelivery: boolean;
        complianceStatus: string;
        complianceCaseId: string | null;
        travelDestination: string | null;
        departureDate: Date | null;
        returnDate: Date | null;
        cancelRequested: boolean;
        cancelReason: string | null;
        cashierId: string | null;
        deliveryPartnerId: string | null;
        fulfillmentStatus: string | null;
        assignedCentralStaffId: string | null;
        assignedManagerId: string | null;
        currentBranchId: string | null;
        originalBranchId: string | null;
        reassignedBranchId: string | null;
        reassignmentReason: string | null;
        reassignedAt: Date | null;
        reassignedBy: string | null;
        complianceLocked: boolean;
        complianceCompletedAt: Date | null;
    })[]>;
    getAllMyRemittances(req: any): Promise<({
        items: ({
            currency: {
                symbol: string;
                id: string;
                name: string;
                code: string;
                isActive: boolean;
                decimals: number;
            };
            product: {
                id: string;
                name: string;
                code: string;
                isActive: boolean;
            };
            remittance: ({
                partner: {
                    id: string;
                    name: string;
                    isActive: boolean;
                } | null;
            } & {
                id: string;
                swiftCode: string;
                ibanOrAccountNumber: string;
                beneficiaryName: string;
                beneficiaryBank: string;
                beneficiaryAddress: string;
                sourceOfFunds: string | null;
                relationship: string | null;
                chargeType: string | null;
                tcsAmount: import("@prisma/client/runtime/library").Decimal | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentMethod: string | null;
                forwardedAt: Date | null;
                forwardedByUserId: string | null;
                partnerReference: string | null;
                partnerStatus: string | null;
                partnerRemarks: string | null;
                orderItemId: string;
                partnerId: string | null;
                beneficiaryId: string | null;
                purposeId: string | null;
            }) | null;
        } & {
            id: string;
            orderId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            inrSubtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            currencyId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        orderNumber: string;
        profileId: string;
        branchId: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        deliveryMethod: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        updatedAt: Date;
        quoteId: string | null;
        sessionId: string | null;
        assignedStaffId: string | null;
        assignedAt: Date | null;
        productType: string;
        workflowType: string;
        currentStage: string;
        requiresKyc: boolean;
        requiresInventory: boolean;
        requiresPickupHandover: boolean;
        requiresDelivery: boolean;
        complianceStatus: string;
        complianceCaseId: string | null;
        travelDestination: string | null;
        departureDate: Date | null;
        returnDate: Date | null;
        cancelRequested: boolean;
        cancelReason: string | null;
        cashierId: string | null;
        deliveryPartnerId: string | null;
        fulfillmentStatus: string | null;
        assignedCentralStaffId: string | null;
        assignedManagerId: string | null;
        currentBranchId: string | null;
        originalBranchId: string | null;
        reassignedBranchId: string | null;
        reassignmentReason: string | null;
        reassignedAt: Date | null;
        reassignedBy: string | null;
        complianceLocked: boolean;
        complianceCompletedAt: Date | null;
    })[]>;
    getBeneficiaries(req: any): Promise<{
        country: string;
        id: string;
        createdAt: Date;
        name: string;
        profileId: string;
        updatedAt: Date;
        bankName: string;
        address: string;
        swiftCode: string;
        ibanOrAccountNumber: string;
    }[]>;
    createBeneficiary(req: any, body: any): Promise<{
        country: string;
        id: string;
        createdAt: Date;
        name: string;
        profileId: string;
        updatedAt: Date;
        bankName: string;
        address: string;
        swiftCode: string;
        ibanOrAccountNumber: string;
    }>;
    deleteBeneficiary(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getRemittanceById(id: string, req: any): Promise<{
        branch: {
            id: string;
            createdAt: Date;
            status: string;
            updatedAt: Date;
            email: string | null;
            companyId: string;
            branchCode: string;
            branchName: string;
            branchAddress: string;
            branchCity: string;
            cityId: string | null;
            managerId: string | null;
            branchType: string;
            lat: number | null;
            lng: number | null;
            phone: string | null;
            vaultCapacity: import("@prisma/client/runtime/library").Decimal;
            workingHours: string | null;
            cashLimitInr: import("@prisma/client/runtime/library").Decimal;
        };
        items: ({
            currency: {
                symbol: string;
                id: string;
                name: string;
                code: string;
                isActive: boolean;
                decimals: number;
            };
            product: {
                id: string;
                name: string;
                code: string;
                isActive: boolean;
            };
            remittance: ({
                purpose: {
                    id: string;
                    name: string;
                    description: string;
                    code: string;
                    isActive: boolean;
                    tcsRate: import("@prisma/client/runtime/library").Decimal;
                    tcsThreshold: import("@prisma/client/runtime/library").Decimal;
                    tcsRateAbove: import("@prisma/client/runtime/library").Decimal;
                    tcsRateBelow: import("@prisma/client/runtime/library").Decimal;
                } | null;
                partner: {
                    id: string;
                    name: string;
                    isActive: boolean;
                } | null;
            } & {
                id: string;
                swiftCode: string;
                ibanOrAccountNumber: string;
                beneficiaryName: string;
                beneficiaryBank: string;
                beneficiaryAddress: string;
                sourceOfFunds: string | null;
                relationship: string | null;
                chargeType: string | null;
                tcsAmount: import("@prisma/client/runtime/library").Decimal | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentMethod: string | null;
                forwardedAt: Date | null;
                forwardedByUserId: string | null;
                partnerReference: string | null;
                partnerStatus: string | null;
                partnerRemarks: string | null;
                orderItemId: string;
                partnerId: string | null;
                beneficiaryId: string | null;
                purposeId: string | null;
            }) | null;
        } & {
            id: string;
            orderId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            inrSubtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            currencyId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        orderNumber: string;
        profileId: string;
        branchId: string;
        totalAmountInr: import("@prisma/client/runtime/library").Decimal;
        deliveryMethod: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        updatedAt: Date;
        quoteId: string | null;
        sessionId: string | null;
        assignedStaffId: string | null;
        assignedAt: Date | null;
        productType: string;
        workflowType: string;
        currentStage: string;
        requiresKyc: boolean;
        requiresInventory: boolean;
        requiresPickupHandover: boolean;
        requiresDelivery: boolean;
        complianceStatus: string;
        complianceCaseId: string | null;
        travelDestination: string | null;
        departureDate: Date | null;
        returnDate: Date | null;
        cancelRequested: boolean;
        cancelReason: string | null;
        cashierId: string | null;
        deliveryPartnerId: string | null;
        fulfillmentStatus: string | null;
        assignedCentralStaffId: string | null;
        assignedManagerId: string | null;
        currentBranchId: string | null;
        originalBranchId: string | null;
        reassignedBranchId: string | null;
        reassignmentReason: string | null;
        reassignedAt: Date | null;
        reassignedBy: string | null;
        complianceLocked: boolean;
        complianceCompletedAt: Date | null;
    }>;
}
