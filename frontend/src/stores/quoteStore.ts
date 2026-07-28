import { create } from 'zustand';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { useTransactionStore } from './transactionStore';

export interface Quote {
  id: string;
  quoteNumber: string;
  lockedInrRate: number;
  amountForeign: number;
  expiresAt: string;
  status: string;
}

interface QuoteState {
  activeQuote: Quote | null;
  isLocking: boolean;
  lockError: string | null;

  lockQuote: (sessionId: string, data: { currency: string; product: string; amount: number; branchId: string }) => Promise<void>;
  clearQuote: () => void;
}

export const useQuoteStore = create<QuoteState>((set) => ({
  activeQuote: null,
  isLocking: false,
  lockError: null,

  lockQuote: async (sessionId, data) => {
    set({ isLocking: true, lockError: null });
    try {
      const res = await authFetch(`${API_URL}/transaction-engine/session/${sessionId}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const quote = await apiJson<Quote>(res);
      set({ activeQuote: quote, isLocking: false });
    } catch (err: any) {
      console.error('Failed to lock quote:', err);
      set({ lockError: err.message || 'Failed to lock quote', isLocking: false });
      if (err.message?.includes('already converted to an order')) {
        const txStore = useTransactionStore.getState();
        txStore.clearSession();
        txStore.initSession();
      }
    }
  },

  clearQuote: () => {
    set({ activeQuote: null, lockError: null });
  },
}));
