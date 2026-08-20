import React, { useState } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useQuoteStore } from '@/stores/quoteStore';
import { useRates } from '@/hooks/useRates';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { AddressSelector } from '../AddressSelector';
import { Check, Lock, Building2, Truck, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

export function DeliveryComplianceStep() {
  const { sessionId, draftState, updateDraft, allowedActions } = useTransactionStore();
  const { activeQuote } = useQuoteStore();
  const { data: ratesData } = useRates();
  const queryClient = useQueryClient();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  const currency = draftState.currency || 'EUR';
  const isSell = draftState.product === 'CASH_SELL';
  const isCard = draftState.product === 'CARD';

  // Robust Rate & Total Calculations (Guaranteed fallback so Rupee values never show dots)
  const rateObj = ratesData?.find((r: any) => r.currency?.code === currency);
  const fallbackBaseRate = rateObj?.inrRate || (currency === 'EUR' ? 91.44 : currency === 'USD' ? 83.50 : 75.00);
  const rateMargin = isSell ? -0.63 : (isCard ? 0 : 0.63);
  const fallbackRate = fallbackBaseRate + rateMargin;

  const displayRate = (activeQuote as any)?.lockedInrRate
    ? Number((activeQuote as any).lockedInrRate)
    : (activeQuote as any)?.rate
    ? Number((activeQuote as any).rate)
    : fallbackRate;

  const displayAmount = (activeQuote as any)?.amountForeign
    ? Number((activeQuote as any).amountForeign)
    : Number(draftState.amount) || 22;

  const displayTotalPayable = Math.round(displayRate * displayAmount);

  const displayExpiresAt = activeQuote?.expiresAt 
    ? new Date(activeQuote.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '10 mins';

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
    window.scrollTo({ top: 0, behavior: 'instant' });
    
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
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
      
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 text-center shadow-md relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <Lock className="w-5 h-5 text-emerald-200" />
          <h2 className="text-2xl font-black tracking-tight">Rate Locked Successfully!</h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-emerald-100 text-xs md:text-sm font-medium">
          <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs font-bold border border-white/20 text-white">
            1 {currency} = ₹{displayRate.toFixed(2)}
          </span>
          <span>• Locked until {displayExpiresAt}</span>
        </div>
      </div>
      
      <CardContent className="p-6 md:p-8">
        
        {/* Quote Summary Box */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50/40 to-indigo-50/40 p-6 rounded-2xl border border-blue-100 mb-8 shadow-xs">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                {draftState.product === 'CASH_SELL' ? 'You are selling' : draftState.product === 'REMITTANCE' ? 'You are sending' : 'You are buying'}
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-3xl font-black text-gray-900">{displayAmount} {currency}</span>
                <span className="text-xs font-extrabold bg-blue-100 text-blue-800 px-3 py-1 rounded-full uppercase border border-blue-200">
                  {draftState.product === 'CARD' ? 'Forex Card' : draftState.product === 'CASH_SELL' ? 'Cash Sell' : draftState.product === 'REMITTANCE' ? 'Remittance' : 'Currency Notes'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                {draftState.product === 'CASH_SELL' ? 'Total to receive (INR)' : draftState.product === 'REMITTANCE' ? 'Total to send (INR)' : 'Total Payable (INR)'}
              </span>
              <p className="text-3xl font-black text-blue-600">
                ₹{displayTotalPayable.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Fulfillment Options */}
        {showDelivery && draftState.product !== 'REMITTANCE' && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {draftState.product === 'CASH_SELL' ? 'How would you like to hand it over?' : 'How would you like to receive it?'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => updateDraft({ deliveryMethod: 'PICKUP' })}
                className={`p-5 rounded-2xl cursor-pointer transition-all border-2 flex items-start gap-4 ${
                  deliveryMethod === 'PICKUP' 
                    ? 'border-blue-600 bg-blue-50/90 ring-2 ring-blue-500/20 shadow-md transform scale-[1.01]' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold ${deliveryMethod === 'PICKUP' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'}`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-base text-gray-900 mb-0.5">
                    {draftState.product === 'CASH_SELL' ? 'Branch Visit' : 'Branch Pickup'}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    {draftState.product === 'CASH_SELL' ? 'Visit our nearest authorized branch office to complete exchange.' : 'Collect your currency notes or card from our nearest authorized branch.'}
                  </p>
                  {deliveryMethod === 'PICKUP' && (
                    <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full mt-2.5">
                      ✓ Selected Option
                    </span>
                  )}
                </div>
              </div>
              
              <div 
                onClick={() => updateDraft({ deliveryMethod: 'HOME_DELIVERY' })}
                className={`p-5 rounded-2xl cursor-pointer transition-all border-2 flex items-start gap-4 ${
                  deliveryMethod === 'HOME_DELIVERY' 
                    ? 'border-blue-600 bg-blue-50/90 ring-2 ring-blue-500/20 shadow-md transform scale-[1.01]' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold ${deliveryMethod === 'HOME_DELIVERY' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'}`}>
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-base text-gray-900 mb-0.5">
                    {draftState.product === 'CASH_SELL' ? 'Home Collection' : 'Home Delivery'}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    {draftState.product === 'CASH_SELL' ? 'Doorstep collection by our verified agent at your home or office.' : 'Guaranteed doorstep delivery by our verified agent to your door.'}
                  </p>
                  {deliveryMethod === 'HOME_DELIVERY' && (
                    <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full mt-2.5">
                      ✓ Selected Option
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {deliveryMethod === 'HOME_DELIVERY' && (
              <div className="mt-5 p-5 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🏠</span> Delivery Address Details
                </h4>
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
            <h3 className="text-lg font-bold text-gray-900 mb-3">Processing Branch</h3>
            <div className="border-2 border-indigo-100 bg-indigo-50/50 p-5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="font-extrabold text-indigo-900 mb-1 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Delhi CP Main Vault Branch
                </div>
                <div className="text-xs text-indigo-700/80 font-medium">
                  (Responsible for KYC & Remittance Compliance)
                </div>
              </div>
              <div className="text-xs font-extrabold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-200">
                Online Processing
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-3 px-1">
              No physical pickup or delivery is required. This branch will securely process your KYC documents and initiate the transfer.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
          <Button 
            onClick={handleCheckout} 
            disabled={isCheckingOut}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-10 py-6 rounded-xl text-base w-full md:w-auto shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>{isCheckingOut ? 'Processing...' : draftState.product === 'CASH_SELL' || draftState.product === 'REMITTANCE' ? 'Confirm & Create Order' : 'Confirm & Proceed to Payment'}</span>
            {!isCheckingOut && <ArrowRight className="w-5 h-5" />}
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

            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  setCreatedOrder(null);
                  await useTransactionStore.getState().fetchWorkflow();
                }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Payment ({createdOrder.totalAmountInr ? `₹${Math.round(Number(createdOrder.totalAmountInr)).toLocaleString('en-IN')}` : `₹${displayTotalPayable.toLocaleString('en-IN')}`})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    useTransactionStore.getState().clearSession();
                    window.location.href = `/kyc?orderId=${createdOrder.id}`;
                  }}
                  className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-sm transition-colors border border-indigo-200 cursor-pointer"
                >
                  Complete KYC
                </button>
                <button
                  onClick={() => {
                    useTransactionStore.getState().clearSession();
                    window.location.href = '/dashboard';
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold rounded-xl text-sm transition-colors border border-slate-200 cursor-pointer"
                >
                  Track Later
                </button>
              </div>
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
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={async () => {
                    setCreatedOrder(null);
                    await useTransactionStore.getState().fetchWorkflow();
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Payment ({createdOrder.totalAmountInr ? `₹${Math.round(Number(createdOrder.totalAmountInr)).toLocaleString('en-IN')}` : `₹${displayTotalPayable.toLocaleString('en-IN')}`})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      useTransactionStore.getState().clearSession();
                      window.location.href = `/kyc?orderId=${createdOrder.id}`;
                    }}
                    className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-sm transition-colors border border-indigo-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Complete KYC
                  </button>
                  <button
                    onClick={() => {
                      useTransactionStore.getState().clearSession();
                      window.location.href = '/dashboard/remittances';
                    }}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold rounded-xl text-sm transition-colors border border-slate-200 cursor-pointer"
                  >
                    Track Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
