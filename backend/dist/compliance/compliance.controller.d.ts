import { ComplianceService } from './compliance.service';
import { ReviewKycDto } from './dto/compliance.dto';
export declare class ComplianceController {
    private readonly complianceService;
    constructor(complianceService: ComplianceService);
    getKycRules(req: any): Promise<any[]>;
    getMyKycDocuments(req: any): Promise<{
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
    getKycEligibility(req: any): Promise<{
        eligible: boolean;
        complianceStatus: string;
        docStates: Record<string, string>;
        requiredDocTypes: any[];
    }>;
    uploadKycDocument(req: any, docType: string, knownDocNumber: string, knownDob: string, knownName: string, knownExpiryDate: string, file: Express.Multer.File): Promise<{
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
    deleteKycDocument(id: string, req: any): Promise<{
        success: boolean;
    }>;
    submitKyc(req: any): Promise<{
        success: boolean;
        submittedCount: number;
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
    reviewKyc(docId: string, dto: ReviewKycDto, req: any): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.KycStatus;
        docType: string;
        filePath: string;
    }>;
}
