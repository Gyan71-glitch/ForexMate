import { DevAuthService } from './services/dev-auth.service';
import { DevKycService, MockDocumentOptions } from './services/dev-kyc.service';
import { DevPaymentService } from './services/dev-payment.service';
import { DevSeedService } from './services/dev-seed.service';
import { DevRateService } from './services/dev-rate.service';
import { DevEventsService } from './services/dev-events.service';
import { DevSystemService } from './services/dev-system.service';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrityCheckerService } from '../common/services/integrity-checker.service';
export declare class DevToolsController {
    private readonly prisma;
    private readonly devAuthService;
    private readonly devKycService;
    private readonly devPaymentService;
    private readonly devSeedService;
    private readonly devRateService;
    private readonly devEventsService;
    private readonly devSystemService;
    private readonly integrityService;
    constructor(prisma: PrismaService, devAuthService: DevAuthService, devKycService: DevKycService, devPaymentService: DevPaymentService, devSeedService: DevSeedService, devRateService: DevRateService, devEventsService: DevEventsService, devSystemService: DevSystemService, integrityService: IntegrityCheckerService);
    quickLogin(role: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: string;
        };
    }>;
    impersonate(body: {
        email: string;
        role?: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: string;
        };
    }>;
    getUsersList(): Promise<({
        roleRef: {
            id: number;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        email: string;
        password: string;
        fullName: string | null;
        mobile: string | null;
        userType: import(".prisma/client").$Enums.UserType;
        roleId: number | null;
        failedAttempts: number;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        lockoutUntil: Date | null;
        mfaBackupCodesHash: string | null;
        mfaEnabled: boolean;
        mfaPreferredMethod: string;
        mfaSecret: string | null;
    })[]>;
    applyKycPreset(body: {
        userId: string;
        preset: string;
    }): Promise<{
        success: boolean;
        preset: "REJECTED" | "APPROVED" | "PENDING_REVIEW" | "EXPIRED_PASSPORT" | "PASSPORT_EXPIRING_SOON" | "PAN_MISMATCH" | "OCR_LOW_CONFIDENCE" | "AML_REVIEW" | "LRS_EXCEEDED" | "MANUAL_VERIFICATION";
        userId: string;
    }>;
    uploadMockKycDocument(body: {
        userId: string;
    } & MockDocumentOptions): Promise<{
        success: boolean;
        document: {
            ocrData: {
                id: string;
                createdAt: Date;
                extractedData: import("@prisma/client/runtime/library").JsonValue;
                nameMatched: boolean;
                expiryValid: boolean;
                ocrConfidence: number;
                documentId: string;
            } | null;
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.KycStatus;
            docType: string;
            filePath: string;
        };
    }>;
    mockPayOrder(orderId: string, body: {
        scenario: string;
    }): Promise<{
        success: boolean;
        scenario: "PENDING" | "CANCELLED" | "TIMEOUT" | "SUCCESS" | "REFUNDED" | "FAILURE" | "DUPLICATE" | "WEBHOOK_FAILURE";
        orderId: string;
    }>;
    seedPreset(body: {
        presetName: string;
    }): Promise<{
        success: boolean;
        profile: "EMPTY";
        seeded: {};
    } | {
        success: boolean;
        profile: "SMALL_STARTUP" | "MEDIUM_BUSINESS" | "LARGE_ENTERPRISE" | "STRESS_TEST" | "DEMO_DAY" | "CONFERENCE_DEMO";
        seeded: any;
    }>;
    resetDatabase(body: {
        confirmation: string;
    }): Promise<{
        success: boolean;
        message: string;
        backupFile: string;
        health: {
            healthy: boolean;
            errors: string[];
            counts: {
                roles: number;
                branches: number;
                currencies: number;
                vaults: number;
                ticketCategories: number;
            };
        };
    }>;
    setRateMode(body: {
        action: string;
    }): Promise<{
        success: boolean;
        mode: string;
    }>;
    getRatesMode(): Promise<{
        mode: any;
    }>;
    getEvents(filter?: string, search?: string): Promise<import("./services/dev-events.service").DomainEvent[]>;
    replayEvent(eventId: string): Promise<import("./services/dev-events.service").DomainEvent>;
    clearEvents(): Promise<{
        success: boolean;
    }>;
    getQueues(): Promise<{
        counts: {
            PENDING: number;
            FAILED: number;
            PROCESSED: number;
        };
        recent: {
            id: string;
            createdAt: Date;
            status: string;
            recipient: string;
            channel: string;
            subject: string | null;
            body: string;
            attempts: number;
            processedAt: Date | null;
            priority: string;
        }[];
        isPaused: any;
    }>;
    executeQueueAction(body: {
        action: string;
    }): Promise<{
        success: boolean;
        action: "RETRY_FAILED" | "PAUSE" | "RESUME" | "CLEAR_DLQ" | "REPROCESS_EMAILS";
    }>;
    getPerformance(): Promise<{
        cpuUsageUser: string;
        cpuUsageSystem: string;
        heapTotal: string;
        heapUsed: string;
        rss: string;
        external: string;
        activeDbConnections: number;
        queueDepth: number;
        deadLetterQueue: number;
        cacheHitRate: string;
        eventThroughput: string;
    }>;
    getHealth(): Promise<{
        backend: string;
        database: string;
        redis: string;
        fastforex: string;
        razorpay: string;
        queue: string;
        storage: string;
        cronJobs: string;
        mail: string;
        sms: string;
    }>;
    injectError(body: {
        flag: string;
        state: boolean;
    }): Promise<{
        success: boolean;
        flags: any;
    }>;
    getInjectedErrors(): Promise<any>;
    setFeatureFlag(body: {
        flag: string;
        state: boolean;
    }): Promise<{
        success: boolean;
        flags: any;
    }>;
    getFeatureFlags(): Promise<any>;
    setMockTime(body: {
        date: string | null;
    }): Promise<{
        success: boolean;
        mockTime: any;
    }>;
    getMockTime(): Promise<{
        mockTime: any;
    }>;
    getTableRows(tableName: string): Promise<any>;
    getSessionOrder(sessionId: string): Promise<({
        payments: {
            currency: string;
            id: string;
            orderId: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            providerId: string;
        }[];
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
    }) | null>;
    logAction(body: {
        action: string;
        email?: string;
    }): Promise<{
        success: boolean;
    }>;
    checkIntegrity(): Promise<{
        healthy: boolean;
        issues: import("../common/services/integrity-checker.service").IntegrityIssue[];
    }>;
}
