import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    getInvoices(req: any): Promise<({
        order: {
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
        };
        items: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
        }[];
        receipts: {
            id: string;
            createdAt: Date;
            invoiceId: string;
            receiptNo: string;
            amountPaid: import("@prisma/client/runtime/library").Decimal;
            paymentMode: string;
        }[];
    } & {
        id: string;
        orderId: string;
        createdAt: Date;
        invoiceNumber: string;
        netAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    getInvoiceById(id: string, req: any): Promise<{
        order: {
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
            profile: {
                userId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                passportNo: string | null;
                passportExpiry: Date | null;
                panNumber: string | null;
                dob: Date | null;
                gender: string | null;
                nationality: string | null;
                occupation: string | null;
                annualIncome: import("@prisma/client/runtime/library").Decimal | null;
                travelPurpose: string | null;
                riskCategory: string;
                kycOverallStatus: string;
                lastKycReviewedAt: Date | null;
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
        };
        items: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
        }[];
        receipts: {
            id: string;
            createdAt: Date;
            invoiceId: string;
            receiptNo: string;
            amountPaid: import("@prisma/client/runtime/library").Decimal;
            paymentMode: string;
        }[];
    } & {
        id: string;
        orderId: string;
        createdAt: Date;
        invoiceNumber: string;
        netAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    getReceipts(req: any): Promise<({
        invoice: {
            order: {
                items: ({
                    currency: {
                        symbol: string;
                        id: string;
                        name: string;
                        code: string;
                        isActive: boolean;
                        decimals: number;
                    };
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
            };
        } & {
            id: string;
            orderId: string;
            createdAt: Date;
            invoiceNumber: string;
            netAmount: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        invoiceId: string;
        receiptNo: string;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        paymentMode: string;
    })[]>;
}
