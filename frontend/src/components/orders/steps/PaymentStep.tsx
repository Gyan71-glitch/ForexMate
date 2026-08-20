import React, { useState, useEffect } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertOctagon, HelpCircle, CreditCard, ShieldCheck } from 'lucide-react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function PaymentStep() {
  const { sessionId, clearSession } = useTransactionStore();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'WEBHOOK_FAILED'>('IDLE');
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  // Load Razorpay Script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch Order Details
  useEffect(() => {
    if (sessionId) {
      authFetch(`${API_URL}/transaction-engine/session/${sessionId}/order`)
        .then(res => apiJson(res))
        .then(data => setOrder(data))
        .catch(err => console.error('Failed to load transaction session order:', err));
    }
  }, [sessionId]);

  // Fetch Available Payment Providers
  useEffect(() => {
    authFetch(`${API_URL}/payments/providers`)
      .then(res => apiJson(res))
      .then(data => {
        setProviders(data);
        if (data.length > 0) {
          const rzp = data.find((p: any) => p.name === 'RAZORPAY');
          setSelectedProvider(rzp || data[0]);
        }
      })
      .catch(err => console.error('Failed to load payment providers:', err));
  }, []);

  const handlePayNow = async () => {
    if (!order?.id || !selectedProvider?.id) {
      toast.error('Missing order or selected payment provider.');
      return;
    }

    setPaymentStatus('PROCESSING');

    // Scenario A: Real Razorpay Sandbox Overlay
    if (selectedProvider.name === 'RAZORPAY') {
      try {
        const initRes = await authFetch(`${API_URL}/payments/initialize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            providerId: selectedProvider.id
          })
        });

        if (!initRes.ok) {
          throw new Error('Failed to initialize payment with backend');
        }

        const initData = await apiJson(initRes);
        const { key, gatewayOrderId } = initData.gatewayOptions;
        const paymentId = initData.paymentId;

        const options = {
          key: key,
          amount: Math.round(Number(order.totalAmountInr) * 100), // paise
          currency: 'INR',
          name: 'Forexmate-v2',
          description: `Payment for Order ${order.orderNumber}`,
          order_id: gatewayOrderId,
          prefill: {
            name: order.profile?.user?.fullName || '',
            email: order.profile?.user?.email || ''
          },
          handler: async function (response: any) {
            setPaymentStatus('PROCESSING');
            try {
              const confirmRes = await authFetch(`${API_URL}/payments/${paymentId}/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  gatewayTxnId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature
                })
              });

              if (!confirmRes.ok) {
                throw new Error('Payment signature verification failed.');
              }

              setPaymentStatus('SUCCESS');
              toast.success('Payment verified and completed successfully!');
            } catch (err: any) {
              toast.error(err.message || 'Payment confirmation failed.');
              setPaymentStatus('IDLE');
            }
          },
          modal: {
            ondismiss: function () {
              setPaymentStatus('IDLE');
              toast.info('Payment checkout window dismissed.');
            }
          },
          theme: {
            color: '#2563eb'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err: any) {
        toast.error(err.message || 'Failed to initialize Razorpay checkout');
        setPaymentStatus('IDLE');
      }
      return;
    }

    // Scenario B: Fallback Mock Payment Simulation
    try {
      const res = await authFetch(`${API_URL}/dev/mock-pay-order/${order.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'SUCCESS' }),
      });

      if (!res.ok) throw new Error('Mock payment failed.');
      setPaymentStatus('SUCCESS');
      toast.success('Simulated payment success successfully captured!');
    } catch (err: any) {
      toast.error(err.message || 'Mock payment failed.');
      setPaymentStatus('IDLE');
    }
  };

  const handlePayScenario = async (scenario: string) => {
    if (!order?.id) {
      toast.error('No checked-out order found for this session.');
      return;
    }
    
    setPaymentStatus('PROCESSING');
    
    try {
      const res = await authFetch(`${API_URL}/dev/mock-pay-order/${order.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });

      if (!res.ok) throw new Error('Failed to update mock payment.');
      
      if (scenario === 'SUCCESS') {
        setPaymentStatus('SUCCESS');
        toast.success('Payment captured and order status updated to paid!');
      } else if (scenario === 'WEBHOOK_FAILURE') {
        setPaymentStatus('WEBHOOK_FAILED');
        toast.warning('Simulated Webhook Failure: Payment captured on gateway, but order remains PAYMENT_PENDING.');
      } else {
        setPaymentStatus('FAILED');
        toast.error(`Simulated gateway response: ${scenario}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment simulation failed.');
      setPaymentStatus('IDLE');
    }
  };

  if (order?.productType === 'CASH_SELL') {
    return (
      <CardContent className="pt-16 pb-16 flex flex-col items-center text-center animate-in fade-in duration-300">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Your Cash Sell order #{order.orderNumber} has been submitted. Our compliance team is reviewing your KYC documents.
        </p>
        <Button 
          onClick={() => {
            clearSession();
            window.scrollTo({ top: 0, behavior: 'instant' });
            router.push('/dashboard');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl text-base shadow-md"
        >
          Go to Dashboard
        </Button>
      </CardContent>
    );
  }

  if (paymentStatus === 'SUCCESS') {
    const isKycVerified = order?.complianceStatus === 'VERIFIED';

    return (
      <CardContent className="pt-12 pb-14 flex flex-col items-center text-center animate-in fade-in duration-300 max-w-xl mx-auto">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5 animate-in zoom-in ring-8 ring-emerald-50">
          <CheckCircle size={44} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider mb-3">
          ✓ Payment Confirmed {order?.totalAmountInr ? `• ₹${Math.round(Number(order.totalAmountInr)).toLocaleString('en-IN')}` : ''}
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
          {isKycVerified ? 'Payment & Order Completed!' : 'Payment Successful — Action Required'}
        </h2>

        <p className="text-sm text-slate-600 font-medium mb-6 leading-relaxed">
          {isKycVerified
            ? `Your payment for Order #${order?.orderNumber || ''} has been received. Your order is now being processed for dispatch.`
            : `Your payment for Order #${order?.orderNumber || ''} has been received! As per RBI LRS compliance, please complete your KYC document verification to begin dispatch & fulfillment.`}
        </p>

        {!isKycVerified ? (
          <div className="w-full space-y-3 bg-indigo-50/60 p-6 rounded-2xl border border-indigo-100 mb-6 text-left">
            <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>RBI KYC Verification Required</span>
            </div>
            <p className="text-xs text-indigo-700 font-medium leading-relaxed">
              Upload your self-attested PAN Card & Passport copies to complete order compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => {
                  clearSession();
                  window.location.href = `/kyc?orderId=${order?.id || ''}`;
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Complete KYC Verification</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearSession();
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  router.push('/dashboard');
                }}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl text-sm border border-slate-200 cursor-pointer"
              >
                Complete Later
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => {
              clearSession();
              window.scrollTo({ top: 0, behavior: 'instant' });
              router.push('/dashboard');
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-10 py-3.5 rounded-xl text-sm shadow-md cursor-pointer"
          >
            Go to Dashboard
          </Button>
        )}
      </CardContent>
    );
  }

  if (paymentStatus === 'WEBHOOK_FAILED') {
    return (
      <CardContent className="pt-16 pb-16 flex flex-col items-center text-center animate-in fade-in duration-300">
        <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
          <AlertOctagon size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Webhook Processing Lag</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Your payment was captured by the gateway, but we are waiting for confirmation from our servers. 
          The order status is currently <span className="font-mono bg-gray-100 px-2 py-0.5 rounded font-bold text-amber-700">PAYMENT_PENDING</span>.
        </p>
        <Button 
          onClick={() => {
            clearSession();
            window.scrollTo({ top: 0, behavior: 'instant' });
            router.push('/dashboard');
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-xl text-base shadow-md"
        >
          Go to Dashboard
        </Button>
      </CardContent>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-2">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Complete Payment</h2>
        <p className="text-gray-500 font-medium">Review your order and securely finalize your payment.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl mx-auto">
        
        {/* Left Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-30"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-white/20 backdrop-blur-sm">
                  Order Summary
                </span>
                <span className="text-indigo-200 text-sm font-semibold">
                  #{order?.orderNumber || 'Pending'}
                </span>
              </div>
              
              <div className="space-y-1 mb-8">
                <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Total Amount</p>
                <p className="text-5xl font-black tracking-tighter">
                  ₹{order ? Number(order.totalAmountInr).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : '...'}
                </p>
              </div>

              {order?.items && order.items.length > 0 && (
                <div className="space-y-4 border-t border-white/10 pt-6">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold border border-white/10">
                          {item.currency?.symbol || item.currency?.code?.charAt(0) || '$'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{Number(item.amount).toLocaleString('en-US')} {item.currency?.code}</p>
                          <p className="text-xs text-indigo-200 font-medium">@ ₹{Number(item.rate).toFixed(2)}</p>
                        </div>
                      </div>
                      <p className="font-bold">₹{Number(item.inrSubtotal).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start shadow-sm">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">Secure & Encrypted</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Your payment is processed using bank-grade 256-bit SSL encryption. We never store your card or UPI details on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Options */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white border border-gray-200 shadow-xl shadow-gray-200/40 rounded-3xl p-8 flex-1 flex flex-col relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gray-50 rounded-full border border-gray-100"></div>

            <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wider relative z-10">
              Select Payment Method
            </h3>
            
            <div className="space-y-4 mb-8 relative z-10">
              {providers.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProvider(p)}
                  className={`relative overflow-hidden flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform ${
                    selectedProvider?.id === p.id 
                      ? 'border-blue-600 bg-blue-50/30 scale-[1.01] shadow-md shadow-blue-900/5' 
                      : 'border-gray-100 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                  }`}
                >
                  {selectedProvider?.id === p.id && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 rounded-l-xl"></div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      selectedProvider?.id === p.id ? 'bg-blue-600 text-white shadow-inner' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <CreditCard size={24} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-base font-black transition-colors ${
                        selectedProvider?.id === p.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {p.name === 'RAZORPAY' ? 'Razorpay Gateway (Sandbox)' : 'Mock Simulator Gateway'}
                      </p>
                      <p className="text-sm font-medium text-gray-500 mt-0.5">
                        {p.name === 'RAZORPAY' ? 'Cards, UPI, NetBanking securely processed via Razorpay.' : 'Quick instant success for developer testing.'}
                      </p>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedProvider?.id === p.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`}>
                      {selectedProvider?.id === p.id && <CheckCircle size={14} className="text-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-4 relative z-10">
              <Button 
                onClick={handlePayNow} 
                disabled={paymentStatus === 'PROCESSING'}
                className={`w-full font-black py-7 rounded-2xl text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
                  selectedProvider?.name === 'RAZORPAY' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-600/30' 
                    : 'bg-gray-900 hover:bg-gray-800 text-white hover:shadow-gray-900/30'
                }`}
              >
                {paymentStatus === 'PROCESSING' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    {selectedProvider?.name === 'RAZORPAY' ? 'Pay Securely via Razorpay' : 'Pay Now (Mock SUCCESS)'}
                  </>
                )}
              </Button>
              
              {/* Quick Developer Simulation Tools */}
              {selectedProvider?.name === 'MOCK_GATEWAY' && (
                <div className="border-t border-dashed border-gray-200 pt-4 mt-2">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">Dev Scenarios</p>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Button 
                      onClick={() => handlePayScenario('FAILURE')} 
                      disabled={paymentStatus === 'PROCESSING'}
                      variant="outline"
                      className="text-red-600 hover:text-white border-red-200 hover:bg-red-500 py-5 text-sm font-bold rounded-xl transition-colors"
                    >
                      Simulate Fail
                    </Button>
                    <Button 
                      onClick={() => handlePayScenario('WEBHOOK_FAILURE')} 
                      disabled={paymentStatus === 'PROCESSING'}
                      variant="outline"
                      className="text-amber-600 hover:text-white border-amber-200 hover:bg-amber-500 py-5 text-sm font-bold rounded-xl transition-colors"
                    >
                      Simulate Delay
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-2">
                <Button 
                  variant="ghost" 
                  onClick={async () => {
                    if (order?.id) {
                      const reason = window.prompt('Please provide a reason for cancelling this order:');
                      if (!reason || !reason.trim()) {
                        toast.info('Cancellation aborted.');
                        return;
                      }
                      try {
                        await authFetch(`${API_URL}/orders/${order.id}/request-cancel`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ reason })
                        });
                        toast.info('Cancellation request sent to manager.');
                      } catch (err) {
                        console.error('Failed to request cancellation:', err);
                      }
                    }
                    clearSession();
                    router.push('/');
                  }}
                  className="text-gray-400 hover:text-gray-700 transition-colors text-sm font-bold h-auto py-2"
                >
                  Cancel & Start New Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
