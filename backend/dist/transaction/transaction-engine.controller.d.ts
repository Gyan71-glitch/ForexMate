import { TransactionEngineService } from './transaction-engine.service';
export declare class TransactionEngineController {
    private readonly engineService;
    constructor(engineService: TransactionEngineService);
    createSession(req: any): Promise<{
        userId: string | null;
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SessionStatus;
        updatedAt: Date;
        idempotencyKey: string | null;
        draftState: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateDraft(req: any, id: string, draftState: any): Promise<{
        userId: string | null;
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SessionStatus;
        updatedAt: Date;
        idempotencyKey: string | null;
        draftState: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getWorkflowNextStep(req: any, id: string): Promise<{
        sessionId: string;
        currentState: import(".prisma/client").$Enums.SessionStatus;
        allowedActions: string[];
        progress: number;
    }>;
    generateAndLockQuote(id: string, dto: {
        currency: string;
        product: string;
        amount: number;
        branchId: string;
    }): Promise<{
        quoteId: string;
        quoteNumber: string;
        currency: string;
        lockedInrRate: number;
        amountForeign: number;
        totalInr: number;
        expiresAt: Date;
        timeRemainingMinutes: number;
    }>;
    checkout(id: string, body: {
        idempotencyKey: string;
    }): Promise<{
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
    } | null>;
}
