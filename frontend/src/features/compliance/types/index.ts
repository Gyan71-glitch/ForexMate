export type KycDocumentStatus = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';

export interface KycReview {
  id: string;
  documentId: string;
  reviewerId: string;
  decision: KycDocumentStatus;
  notes: string | null;
  createdAt: string;
}

export interface DocumentOcrData {
  id: string;
  extractedData: any;
  nameMatched: boolean;
  expiryValid: boolean;
  ocrConfidence: number;
  createdAt: string;
}

export interface KycDocument {
  id: string;
  docType: string;
  filePath: string;
  status: KycDocumentStatus;
  createdAt: string;
  ocrData?: DocumentOcrData | null;
  reviews?: KycReview[];
}

export interface KycSummaryResponse {
  overallStatus: string;
  documents: KycDocument[];
}

export interface UploadKycRequest {
  docType: string;
  filePath: string;
  ocr?: any;
}
