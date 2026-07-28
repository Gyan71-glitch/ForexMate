import { PrismaService } from '../prisma/prisma.service';
import { ReviewKycDto } from './dto/compliance.dto';
import { OcrAdapter } from './providers/ocr.adapter';
export declare class ComplianceService {
    private readonly prisma;
    private readonly ocrAdapter;
    private readonly logger;
    constructor(prisma: PrismaService, ocrAdapter: OcrAdapter);
    evaluateCashBuyKycEligibility(userId: string): Promise<{
        eligible: boolean;
        complianceStatus: string;
        docStates: Record<string, string>;
        requiredDocTypes: any[];
    }>;
    getPendingKyc(): Promise<({
        user: {
            email: string;
            fullName: string | null;
            mobile: string | null;
        };
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
    })[]>;
    getKycRules(product?: string, purpose?: string): Promise<any[]>;
    evaluateLrsEligibility(tx: any, profileId: string, orderAmountInr: number, skipOrderId?: string): Promise<{
        eligible: boolean;
        reason: string;
        remainingInr?: undefined;
        totalSpentInr?: undefined;
        orderAmountInr?: undefined;
    } | {
        eligible: boolean;
        reason: string;
        remainingInr: number;
        totalSpentInr: any;
        orderAmountInr: number;
    } | {
        eligible: boolean;
        remainingInr: number;
        totalSpentInr: any;
        orderAmountInr: number;
        reason?: undefined;
    }>;
    reviewKyc(docId: string, dto: ReviewKycDto, reviewerId: string): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.KycStatus;
        docType: string;
        filePath: string;
    }>;
    getMyKycDocuments(userId: string): Promise<{
        overallStatus: string;
        documents: ({
            ocrData: {
                id: string;
                createdAt: Date;
                extractedData: import("@prisma/client/runtime/library").JsonValue;
                nameMatched: boolean;
                expiryValid: boolean;
                ocrConfidence: number;
                documentId: string;
            } | null;
            reviews: {
                id: string;
                createdAt: Date;
                notes: string | null;
                decision: import(".prisma/client").$Enums.KycStatus;
                documentId: string;
                reviewerId: string;
            }[];
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.KycStatus;
            docType: string;
            filePath: string;
        })[];
    }>;
    uploadKycDocument(userId: string, docType: string, filePath: string, ocr?: any, knownDocNumber?: string, knownDob?: string, knownName?: string, knownExpiryDate?: string): Promise<{
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
    }>;
    deleteKycDocument(userId: string, docId: string): Promise<{
        success: boolean;
    }>;
    submitKyc(userId: string): Promise<{
        success: boolean;
        submittedCount: number;
    }>;
}
