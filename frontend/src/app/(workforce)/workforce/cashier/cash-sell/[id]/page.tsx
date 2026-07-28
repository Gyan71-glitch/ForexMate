"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { workforceFetch, workforceJson } from '@/lib/workforceApi';
import { MobileHeader, LoadingScreen, DenominationList } from '@/components/workforce/MobileUI';

type Step = 'DETAILS' | 'OTP_VERIFY' | 'DONE';

export default function CashSellDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('DETAILS');
  const [recipient, setRecipient] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    workforceFetch(`/orders/${id}`)
      .then(workforceJson)
      .then((data) => {
        setOrder(data);
        setRecipient(data.profile?.user?.mobile || data.profile?.user?.email || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!order) return <div style={{ padding: 24, color: '#ef4444' }}>Order not found.</div>;

  const isCompleted = order.status === 'COMPLETED';
  const customerName = order.profile?.user?.fullName || 'Customer';
  const currency = order.items?.[0]?.currency;
  const amount = order.items?.[0]?.amount;

  const handleSendOtp = async () => {
    setActionLoading(true); setError('');
    try {
      const res = await workforceFetch(`/orders/${id}/send-otp`, { method: 'POST', body: JSON.stringify({ recipient }) });
      const data = await workforceJson(res);
      if (data.devCode) setDevCode(data.devCode);
      setStep('OTP_VERIFY');
    } catch (err: any) { setError(err.message); } finally { setActionLoading(false); }
  };

  const handleVerifyAndComplete = async () => {
    setActionLoading(true); setError('');
    try {
      // Verify OTP first
      const verifyRes = await workforceFetch(`/orders/${id}/verify-otp`, { method: 'POST', body: JSON.stringify({ recipient, code: otpCode }) });
      await workforceJson(verifyRes);
      // Then complete cash sell
      const completeRes = await workforceFetch(`/orders/${id}/complete-cash-sell`, { method: 'POST', body: '{}' });
      await workforceJson(completeRes);
      setStep('DONE');
    } catch (err: any) { setError(err.message); } finally { setActionLoading(false); }
  };

  return (
    <div style={{ paddingBottom: 32, background: '#f8fafc', minHeight: '100dvh' }}>
      <MobileHeader title="Cash Sell" subtitle={order.orderNumber} onBack={() => router.back()} />

      {step === 'DONE' || isCompleted ? (
        <div style={{ background: '#dcfce7', padding: '20px', textAlign: 'center', borderBottom: '1px solid #bbf7d0' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>✅</p>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#166534', margin: '0 0 4px' }}>Cash Sell Completed!</p>
          <p style={{ fontSize: 12, color: '#166534', margin: 0, opacity: 0.8 }}>INR received from customer successfully.</p>
        </div>
      ) : null}

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Customer & Order Details */}
        <div style={cardStyle}>
          <p style={sectionTitle}>Customer Details</p>
          <InfoRow label="Name" value={customerName} />
          <InfoRow label="Phone" value={order.profile?.user?.mobile || 'N/A'} />
          <InfoRow label="Order #" value={order.orderNumber} />
        </div>

        <div style={cardStyle}>
          <p style={sectionTitle}>Transaction Details</p>
          <InfoRow label="Currency" value={currency ? `${currency.code}` : 'N/A'} />
          <InfoRow label="Amount" value={amount ? `${currency?.code} ${parseFloat(amount).toLocaleString('en-IN')}` : 'N/A'} />
          <InfoRow label="INR Payable" value={`₹${parseFloat(order.totalAmountInr || '0').toLocaleString('en-IN')}`} />
          <div style={{ marginTop: 12, padding: '10px 12px', background: '#fef9c3', borderRadius: 10, fontSize: 12, color: '#854d0e', fontWeight: 600 }}>
            💰 Customer is handing over <strong>{currency?.code} {parseFloat(amount || '0').toLocaleString('en-IN')}</strong>. Collect the INR equivalent.
          </div>
        </div>

        {order.cashAllocation && (
          <div style={cardStyle}>
            <p style={sectionTitle}>Denominations to Collect</p>
            <DenominationList allocation={order.cashAllocation} />
          </div>
        )}

        {error && <div style={errorStyle}>⚠️ {error}</div>}

        {/* Step Actions */}
        {!isCompleted && step !== 'DONE' && (
          <div style={cardStyle}>
            {step === 'DETAILS' && (
              <>
                <p style={{ fontSize: 13, color: '#374151', margin: '0 0 14px', fontWeight: 500, lineHeight: 1.5 }}>
                  Verify customer identity before accepting their currency.
                </p>
                <label style={labelStyle}>Send OTP to Customer</label>
                <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Phone or Email" style={inputStyle} />
                <button onClick={handleSendOtp} disabled={actionLoading} style={primaryBtnStyle}>
                  {actionLoading ? '⏳ Sending...' : 'Send Verification OTP'}
                </button>
              </>
            )}

            {step === 'OTP_VERIFY' && (
              <>
                <div style={{ background: '#eff6ff', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#1e40af', fontWeight: 500 }}>
                  📱 OTP sent to <strong>{recipient}</strong>
                </div>
                {devCode && <div style={{ background: '#fef3c7', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#92400e', fontWeight: 600 }}>🛠 Dev OTP: {devCode}</div>}
                <label style={labelStyle}>Enter OTP from Customer</label>
                <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} placeholder="6-digit code" maxLength={6} style={{ ...inputStyle, fontSize: 22, letterSpacing: '0.3em', textAlign: 'center', fontWeight: 800 }} />
                <button onClick={handleVerifyAndComplete} disabled={actionLoading} style={{ ...primaryBtnStyle, background: 'linear-gradient(135deg, #065f46, #059669)' }}>
                  {actionLoading ? '⏳ Processing...' : '✓ Verify & Complete Cash Sell'}
                </button>
              </>
            )}
          </div>
        )}

        {(step === 'DONE' || isCompleted) && (
          <button onClick={() => router.push('/workforce/cashier/cash-sell')} style={{ width: '100%', padding: '15px', background: '#f3f4f6', borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>
            ← Back to Cash Sell Orders
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, minWidth: 80 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#111827', fontWeight: 700, textAlign: 'right', flex: 1 }}>{value}</span>
    </div>
  );
}

const cardStyle: React.CSSProperties = { background: 'white', borderRadius: 16, padding: 16, border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' };
const sectionTitle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' };
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 };
const inputStyle: React.CSSProperties = { border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '13px 14px', fontSize: 15, color: '#111827', fontFamily: 'inherit', fontWeight: 600, background: '#f9fafb', width: '100%', boxSizing: 'border-box', marginBottom: 12 };
const primaryBtnStyle: React.CSSProperties = { width: '100%', padding: '15px', background: 'linear-gradient(135deg, #4338CA, #6366f1)', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' };
const errorStyle: React.CSSProperties = { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 14, fontSize: 13, color: '#991b1b', fontWeight: 500 };
