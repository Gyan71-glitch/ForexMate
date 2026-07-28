export interface OcrResult {
    confidence: number;
    extractedText: Record<string, any>;
    nameMatch: boolean;
    isExpired: boolean;
    isValidDocType: boolean;
}
export declare class OcrAdapter {
    private readonly logger;
    extractDocumentData(filePath: string, customerName: string, requestedType?: string, knownDocNumber?: string): Promise<OcrResult>;
    private detectDocumentType;
    private parseDocumentNumber;
    private parseDateOfBirth;
    private parseExpiryDate;
    private checkNameMatch;
    private buildResult;
    private getFallbackMockResult;
}
