import { PrismaService } from '../../prisma/prisma.service';
import { KycStatus } from '@prisma/client';
export interface MockDocumentOptions {
    docType: string;
    filePath?: string;
    status?: KycStatus;
    documentNumber?: string;
    fullName?: string;
    dob?: string;
    confidence?: number;
    nameMatched?: boolean;
    expiryValid?: boolean;
}
export declare class DevKycService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    applyKycPreset(userId: string, preset: string): Promise<{
        success: boolean;
        preset: "REJECTED" | "APPROVED" | "PENDING_REVIEW" | "EXPIRED_PASSPORT" | "PASSPORT_EXPIRING_SOON" | "PAN_MISMATCH" | "OCR_LOW_CONFIDENCE" | "AML_REVIEW" | "LRS_EXCEEDED" | "MANUAL_VERIFICATION";
        userId: string;
    }>;
    seedMockDocument(userId: string, options: MockDocumentOptions): Promise<{
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
    private createMockDoc;
}
