import API_URL, { authFetch, apiJson } from '@/lib/api';
import { RemittanceOrder, RemittancePartner } from '../types';

export const remittanceApi = {
  getMyRemittances: async (): Promise<RemittanceOrder[]> => {
    return authFetch(`${API_URL}/remittances`).then(apiJson);
  },

  getRemittanceById: async (id: string): Promise<RemittanceOrder> => {
    return authFetch(`${API_URL}/remittances/${id}`).then(apiJson);
  },

  getPartners: async (): Promise<RemittancePartner[]> => {
    return authFetch(`${API_URL}/remittances/partners`).then(apiJson);
  },
};
