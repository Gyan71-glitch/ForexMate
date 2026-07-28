import { useState, useEffect } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';

export interface WorkflowState {
  currentState: string;
  allowedActions: string[];
  progress: number;
}

export function useTransactionSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [draftState, setDraftState] = useState<any>({});
  const [workflow, setWorkflow] = useState<WorkflowState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize session on mount if none exists
  useEffect(() => {
    const initSession = async () => {
      const existingSessionId = localStorage.getItem('transactionSessionId');
      if (existingSessionId) {
        setSessionId(existingSessionId);
        await fetchWorkflow(existingSessionId);
      } else {
        setIsLoading(true);
        try {
          const res = await authFetch(`${API_URL}/transaction-engine/session`, {
            method: 'POST',
            body: JSON.stringify({}),
          });
          const data = await apiJson(res);
          const newSessionId = data.id;
          setSessionId(newSessionId);
          localStorage.setItem('transactionSessionId', newSessionId);
          await fetchWorkflow(newSessionId);
        } catch (error) {
          console.error('Failed to initialize session', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initSession();
  }, []);

  const fetchWorkflow = async (sid: string) => {
    try {
      const res = await authFetch(`${API_URL}/transaction-engine/session/${sid}/workflow`);
      const data = await apiJson(res);
      setWorkflow(data);
    } catch (error) {
      console.error('Failed to fetch workflow', error);
    }
  };

  const updateDraft = async (updates: any) => {
    if (!sessionId) return;
    const newState = { ...draftState, ...updates };
    setDraftState(newState);
    
    try {
      await authFetch(`${API_URL}/transaction-engine/session/${sessionId}/draft`, {
        method: 'PUT',
        body: JSON.stringify(newState),
      });
      await fetchWorkflow(sessionId); // Refresh workflow after draft update
    } catch (error) {
      console.error('Failed to sync draft state', error);
    }
  };

  const generateQuote = async (currency: string, product: string, amount: number, branchId: string) => {
    if (!sessionId) return;
    try {
      const res = await authFetch(`${API_URL}/transaction-engine/session/${sessionId}/quote`, {
        method: 'POST',
        body: JSON.stringify({ currency, product, amount, branchId }),
      });
      const data = await apiJson(res);
      await fetchWorkflow(sessionId);
      return data;
    } catch (error) {
      console.error('Failed to generate quote', error);
      throw error;
    }
  };

  const checkout = async (idempotencyKey: string) => {
    if (!sessionId) return;
    try {
      const res = await authFetch(`${API_URL}/transaction-engine/session/${sessionId}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ idempotencyKey }),
      });
      const data = await apiJson(res);
      return data;
    } catch (error) {
      console.error('Checkout failed', error);
      throw error;
    }
  };

  return {
    sessionId,
    draftState,
    workflow,
    isLoading,
    updateDraft,
    generateQuote,
    checkout,
  };
}
