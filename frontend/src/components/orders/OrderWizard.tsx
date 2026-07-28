"use client";

import React, { useEffect } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useUiStore } from '@/stores/uiStore';
import { Card, CardContent } from '@/components/ui/card';

// We'll build these step components next
import { ProductCalculatorStep } from './steps/ProductCalculatorStep';
import { LoginPromptStep } from './steps/LoginPromptStep';
import { DeliveryComplianceStep } from './steps/DeliveryComplianceStep';
import { PaymentStep } from './steps/PaymentStep';

// Component Registry based on Transaction Engine Status
const StepRegistry: Record<string, React.FC> = {
  'CREATED': ProductCalculatorStep,
  'IN_PROGRESS': ProductCalculatorStep,
  'WAITING_LOGIN': LoginPromptStep,
  'QUOTE_LOCKED': DeliveryComplianceStep,
  'WAITING_PAYMENT': PaymentStep,
  'CONVERTED': PaymentStep,
};

export function OrderWizard() {
  const { sessionId, status, initSession, draftState, clearSession } = useTransactionStore();
  const { isGlobalLoading } = useUiStore();

  // Initialize session on mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  // Clean up completed/converted Cash Sell session automatically on mount or state change
  useEffect(() => {
    if (sessionId && (status === 'CONVERTED' || status === 'WAITING_PAYMENT') && draftState.product === 'CASH_SELL') {
      clearSession();
    }
  }, [sessionId, status, draftState.product, clearSession]);

  if (!sessionId) {
    return (
      <Card className="shadow-lg border-0 bg-white min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 font-medium animate-pulse">Initializing Order Engine...</p>
      </Card>
    );
  }

  // Find the appropriate component for the current state
  const ActiveStepComponent = StepRegistry[status];

  return (
    <div className="w-full relative">
      {/* UI Loading Overlay */}
      {isGlobalLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <Card className="shadow-lg border-0 bg-white min-h-[500px]">
        {ActiveStepComponent ? (
          <ActiveStepComponent />
        ) : (
          <CardContent className="pt-10 flex flex-col items-center">
            <h3 className="text-xl font-bold text-red-600 mb-2">Unknown State</h3>
            <p className="text-gray-500">The workflow engine returned an unhandled state: {status}</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
