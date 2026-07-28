'use client';

import React, { createContext, useContext } from 'react';
import { useTransactionSession, WorkflowState } from '../hooks/useTransactionSession';

interface TransactionEngineContextType {
  sessionId: string | null;
  draftState: any;
  workflow: WorkflowState | null;
  isLoading: boolean;
  updateDraft: (updates: any) => Promise<void>;
  generateQuote: (currency: string, product: string, amount: number, branchId: string) => Promise<any>;
  checkout: (idempotencyKey: string) => Promise<any>;
}

const TransactionEngineContext = createContext<TransactionEngineContextType | undefined>(undefined);

export function TransactionEngineProvider({ children }: { children: React.ReactNode }) {
  const session = useTransactionSession();

  return (
    <TransactionEngineContext.Provider value={session}>
      {children}
    </TransactionEngineContext.Provider>
  );
}

export function useTransactionEngine() {
  const context = useContext(TransactionEngineContext);
  if (context === undefined) {
    throw new Error('useTransactionEngine must be used within a TransactionEngineProvider');
  }
  return context;
}
