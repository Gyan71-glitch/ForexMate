import API_URL, { authFetch, apiJson } from '@/lib/api';
import { KycSummaryResponse, KycDocument, UploadKycRequest } from '../types';

export const kycApi = {
  getRules: async (product?: string, purpose?: string): Promise<any[]> => {
    const params = new URLSearchParams();
    if (product) params.append('product', product);
    if (purpose) params.append('purpose', purpose);
    return authFetch(`${API_URL}/compliance/rules?${params.toString()}`).then(apiJson);
  },

  getDocuments: async (): Promise<KycSummaryResponse> => {
    return authFetch(`${API_URL}/compliance/kyc/documents`).then(apiJson);
  },

  uploadDocument: async (file: File, docType: string, knownDocNumber?: string, knownDob?: string, knownName?: string, knownExpiryDate?: string): Promise<KycDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    if (knownDocNumber) formData.append('knownDocNumber', knownDocNumber);
    if (knownDob) formData.append('knownDob', knownDob);
    if (knownName) formData.append('knownName', knownName);
    if (knownExpiryDate) formData.append('knownExpiryDate', knownExpiryDate);
    return authFetch(`${API_URL}/compliance/kyc/documents`, {
      method: 'POST',
      body: formData,
    }).then(apiJson);
  },

  deleteDocument: async (docId: string): Promise<{ success: boolean }> => {
    return authFetch(`${API_URL}/compliance/kyc/documents/${docId}`, {
      method: 'DELETE',
    }).then(apiJson);
  },

  submitKyc: async (): Promise<{ success: boolean; submittedCount: number }> => {
    return authFetch(`${API_URL}/compliance/kyc/submit`, {
      method: 'POST',
    }).then(apiJson);
  },

  sendOtp: async (recipient: string, purpose: string): Promise<{ success: boolean }> => {
    return authFetch(`${API_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, purpose }),
    }).then(apiJson);
  },

  verifyOtp: async (recipient: string, purpose: string, code: string): Promise<{ verified: boolean }> => {
    return authFetch(`${API_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, purpose, code }),
    }).then(apiJson);
  },
};
