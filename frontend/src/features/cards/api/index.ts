import API_URL, { authFetch, apiJson } from '@/lib/api';
import { ForexCard, CardTransaction } from '../types';

export const cardsApi = {
  getMyCards: async (): Promise<ForexCard[]> => {
    return authFetch(`${API_URL}/forex-cards/mine`).then(apiJson);
  },

  getCardById: async (id: string): Promise<ForexCard> => {
    return authFetch(`${API_URL}/forex-cards/${id}`).then(apiJson);
  },

  getMyTransactions: async (): Promise<CardTransaction[]> => {
    return authFetch(`${API_URL}/forex-cards/mine/transactions`).then(apiJson);
  },

  freezeCard: async (id: string): Promise<ForexCard> => {
    return authFetch(`${API_URL}/forex-cards/${id}/freeze`, { method: 'PATCH' }).then(apiJson);
  },

  unfreezeCard: async (id: string): Promise<ForexCard> => {
    return authFetch(`${API_URL}/forex-cards/${id}/unfreeze`, { method: 'PATCH' }).then(apiJson);
  },

  reloadCard: async (id: string, currencyId: string, amount: number): Promise<any> => {
    return authFetch(`${API_URL}/forex-cards/${id}/reload`, {
      method: 'POST',
      body: JSON.stringify({ currencyId, amount }),
    }).then(apiJson);
  },
};
