import API_URL, { authFetch, apiJson } from '@/lib/api';
import { Invoice, InvoiceReceipt } from '../types';

export const documentsApi = {
  getInvoices: async (): Promise<Invoice[]> => {
    return authFetch(`${API_URL}/documents/invoices`).then(apiJson);
  },
  
  getInvoiceById: async (id: string): Promise<Invoice> => {
    return authFetch(`${API_URL}/documents/invoices/${id}`).then(apiJson);
  },

  getReceipts: async (): Promise<InvoiceReceipt[]> => {
    return authFetch(`${API_URL}/documents/receipts`).then(apiJson);
  }
};
