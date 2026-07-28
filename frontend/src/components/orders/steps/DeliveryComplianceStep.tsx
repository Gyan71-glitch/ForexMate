import React, { useState } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useQuoteStore } from '@/stores/quoteStore';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { AddressSelector } from '../AddressSelector';

import { Check } from 'lucide-react';

export function DeliveryComplianceStep() {
  const { sessionId, draftState, updateDraft, allowedActions } = useTransactionStore();
  const { activeQuote } = useQuoteStore();
  const queryClient = useQueryClient();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  const { data: requirementsData } = useQuery({
    queryKey: ['order-kyc-requirements', createdOrder?.id],
    queryFn: () => authFetch(`${API_URL}/kyc/requirements?orderId=${createdOrder.id}`).then(apiJson<{ requiredDocuments: string[] }>),
    enabled: !!createdOrder?.id,
  });

  const getDocName = (code: string) => {
    switch (code) {
      case 'PAN': return 'PAN Card (Self-Attested)';
      case 'PASSPORT': return 'Indian Passport Copy';
      case 'VISA': return 'Student / Tourist Visa / I-20 Form';
      case 'ADMISSION_INVOICE': return 'University Admission / Fee Invoice';
      case 'BANK_STATEMENT': return '6-Month Bank Account Statement';
      case 'FORM_A2': return 'Signed RBI Form A2 LRS Declaration';
      case 'TICKET': return 'Confirmed Flight Ticket';
      default: return code.replace(/_/g, ' ');
    }
  };

  const deliveryMethod = draftState.deliveryMethod || 'PICKUP';
  const showDelivery = allowedActions.includes('ENTER_DELIVERY_DETAILS');

  const handleCheckout = async () => {
    if (!sessionId) return;
    setIsCheckingOut(true);
    
    // Create an idempotency key to prevent double checkout
    const idempotencyKey = `checkout_${sessionId}`;
    
    try {
      const res = await authFetch(`${API_URL}/transaction-engine/session/${sessionId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idempotencyKey }),
      });
      
      const order = await apiJson<any>(res);
      // Invalidate dashboard and orders queries
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      if (order.productType === 'CASH_SELL' || order.productType === 'CASH' || order.productType === 'REMITTANCE') {
        setCreatedOrder(order);
      } else {
        // Checkout successful! Now fetch workflow to progress to WAITING_PAYMENT
        await useTransactionStore.getState().fetchWorkflow();
      }
    } catch (err) {
      console.error('Checkout failed', err);
      alert(err instanceof Error ? err.message : 'Failed to checkout.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <CardHeader className="text-center pb-2 bg-green-50 rounded-t-xl border-b border-green-100">
        <CardTitle className="text-2xl font-bold text-green-800">Rate Locked Successfully!</CardTitle>
        <CardDescription className="text-green-700">
          Your rate of ₹{activeQuote?.lockedInrRate || '...'} is locked until {activeQuote?.expiresAt ? new Date(activeQuote.expiresAt).toLocaleTimeString() : '...'}.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-8">
        
        {/* Quote Summary */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">{draftState.product === 'CASH_SELL' ? 'You are selling' : draftState.product === 'REMITTANCE' ? 'You are sending' : 'You are buying'}</p>
            <p className="text-2xl font-bold">{activeQuote?.amountForeign} {draftState.currency}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">{draftState.product === 'CASH_SELL' ? 'Total to receive' : draftState.product === 'REMITTANCE' ? 'Total to send (INR)' : 'Total to pay'}</p>
            <p className="text-2xl font-bold text-blue-600">
              ₹{activeQuote ? (activeQuote.amountForeign * activeQuote.lockedInrRate).toLocaleString('en-IN') : '...'}
            </p>
          </div>
        </div>

        {/* Delivery / Processing Options */}
        {showDelivery && draftState.product !== 'REMITTANCE' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">
              {draftState.product === 'CASH_SELL' ? 'How would you like to hand it over?' : 'How would you like to receive it?'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => updateDraft({ deliveryMethod: 'PICKUP' })}
                className={`border-2 p-4 rounded-xl cursor-pointer text-center ${deliveryMethod === 'PICKUP' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
              >
                <div className="font-bold mb-1">{draftState.product === 'CASH_SELL' ? 'Branch Visit' : 'Branch Pickup'}</div>
                <div className="text-sm text-gray-500">
                  {draftState.product === 'CASH_SELL' ? 'Visit nearest branch office' : 'Collect from nearest branch'}
                </div>
              </div>
              
              <div 
                onClick={() => updateDraft({ deliveryMethod: 'HOME_DELIVERY' })}
                className={`border-2 p-4 rounded-xl cursor-pointer text-center ${deliveryMethod === 'HOME_DELIVERY' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
              >
                <div className="font-bold mb-1">{draftState.product === 'CASH_SELL' ? 'Home Collection' : 'Home Delivery'}</div>
                <div className="text-sm text-gray-500">
                  {draftState.product === 'CASH_SELL' ? 'Doorstep collection by agent' : 'Same-day delivery to door'}
                </div>
              </div>
            </div>
            
            {deliveryMethod === 'HOME_DELIVERY' && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                <AddressSelector 
                  value={draftState.deliveryAddress || ''}
                  onChange={(compiled, addressId) => updateDraft({ deliveryAddress: compiled, addressId })}
                />
              </div>
            )}
          </div>
        )}

        {draftState.product === 'REMITTANCE' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Processing Branch</h3>
            <div className="border-2 border-indigo-100 bg-indigo-50/50 p-5 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Delhi CP Main Vault Branch
                </div>
                <div className="text-sm text-indigo-700/70 font-medium">
                  (Responsible for KYC & Compliance)
                </div>
              </div>
              <div className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Online Processing
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-3 px-1">
              No physical pickup or delivery is required. This branch will securely process your KYC documents and initiate the transfer.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
          <Button 
            onClick={handleCheckout} 
            disabled={isCheckingOut}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-xl text-lg w-full md:w-auto"
          >
            {isCheckingOut ? 'Processing...' : draftState.product === 'CASH_SELL' || draftState.product === 'REMITTANCE' ? 'Confirm & Create Order' : 'Confirm & Proceed to Payment'}
          </Button>
        </div>
      </CardContent>

      {createdOrder && createdOrder.productType !== 'REMITTANCE' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all p-6 text-center animate-in zoom-in-95 duration-200">
            
            {/* Emerald Check Icon */}
            <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-2">
              Your Order Has Been Created Successfully
            </h3>
            
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
              To continue processing your {createdOrder.productType === 'CASH_SELL' ? 'Cash Sell' : 'Buy Cash'} order, please complete your KYC verification.
            </p>

            {/* Checklist of required documents */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Required Documents</span>
              <div className="space-y-2">
                {requirementsData?.requiredDocuments ? (
                  requirementsData.requiredDocuments.map((docCode: string) => (
                    <div key={docCode} className="flex items-center text-sm font-semibold text-gray-700 gap-2">
                      <span className="text-emerald-500 font-bold">✓</span> {getDocName(docCode)}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400">Loading requirements...</div>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-400 font-medium mb-6">
              Your order cannot proceed until KYC verification is completed.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  useTransactionStore.getState().clearSession();
                  window.location.href = `/kyc?orderId=${createdOrder.id}`;
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
              >
                Complete KYC
              </button>
              <button
                onClick={() => {
                  useTransactionStore.getState().clearSession();
                  window.location.href = '/dashboard';
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold rounded-xl text-sm transition-colors border border-slate-200"
              >
                Later
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* ─── REMITTANCE ORDER CREATED MODAL ─── */}
      {createdOrder && createdOrder.productType === 'REMITTANCE' && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Header Banner */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mb-3 ring-4 ring-white/30">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-1">
                Remittance Request Created
              </h3>
              <p className="text-indigo-200 text-sm font-medium">
                Step 1 of 2 — KYC verification pending
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">

              {/* Order Number */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center">
                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Order ID</p>
                <p className="text-xl font-black text-indigo-800 font-mono tracking-wide">
                  {createdOrder.orderNumber}
                </p>
              </div>

              {/* What's next */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">What happens next</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                    <p className="text-sm font-medium text-gray-700">Upload your KYC documents (PAN, Passport + purpose-specific docs)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                    <p className="text-sm font-medium text-gray-400">Documents reviewed by compliance team (2–24 hours)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                    <p className="text-sm font-medium text-gray-400">Transfer initiated to your beneficiary</p>
                  </div>
                </div>
              </div>

              {/* Required Documents Preview */}
              {requirementsData?.requiredDocuments && requirementsData.requiredDocuments.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Documents you&apos;ll need to upload</span>
                  <div className="flex flex-wrap gap-2">
                    {requirementsData.requiredDocuments.map((docCode: string) => (
                      <span key={docCode} className="bg-white border border-indigo-200 text-indigo-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                        ✔ {getDocName(docCode)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    useTransactionStore.getState().clearSession();
                    window.location.href = `/kyc?orderId=${createdOrder.id}`;
                  }}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  Complete KYC
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    useTransactionStore.getState().clearSession();
                    window.location.href = '/dashboard/remittances';
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold rounded-xl text-sm transition-colors border border-slate-200"
                >
                  Track Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
