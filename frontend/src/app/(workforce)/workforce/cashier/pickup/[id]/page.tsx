"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWorkforceAuth } from '@/context/WorkforceAuthContext';
import { workforceFetch, workforceJson } from '@/lib/workforceApi';
import { MobileHeader, LoadingScreen, DenominationList } from '@/components/workforce/MobileUI';

type Step = 'DETAILS' | 'OTP_SEND' | 'OTP_VERIFY' | 'DENOMINATIONS' | 'DONE';

export default function PickupOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { employee } = useWorkforceAuth();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('DETAILS');
  const [recipient, setRecipient] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    workforceFetch(`/orders/${id}`)
      .then(workforceJson)
      .then((data) => {
        setOrder(data);
        // Pre-fill recipient with customer's mobile or email
        const mobile = data.profile?.user?.mobile;
        const email = data.profile?.user?.email;
        setRecipient(mobile || email || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen message="Loading order..." />;
  if (!order) return <div style={{ padding: 24, color: '#ef4444' }}>Order not found.</div>;

  const isCompleted = ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status);
  const customerName = order.profile?.user?.fullName || 'Customer';
  const currency = order.items?.[0]?.currency;
  const amount = order.items?.[0]?.amount;

  const handleSendOtp = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await workforceFetch(`/orders/${id}/send-otp`, {
        method: 'POST',
        body: JSON.stringify({ recipient }),
      });
      const data = await workforceJson(res);
      setOtpSent(true);
      if (data.devCode) setDevCode(data.devCode);
      setStep('OTP_VERIFY');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await workforceFetch(`/orders/${id}/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ recipient, code: otpCode }),
      });
      await workforceJson(res);
      setVerified(true);
      setStep('DENOMINATIONS');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompletePickup = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await workforceFetch(`/orders/${id}/complete-pickup`, { method: 'POST', body: '{}' });
      await workforceJson(res);
      setStep('DONE');
    } catch (err: any) {
      setError(err.message || 'Failed to complete pickup.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: 32, background: '#f8fafc', minHeight: '100dvh' }}>
      <MobileHeader title="Pickup Order" subtitle={order.orderNumber} onBack={() => router.back()} />

      {/* Status Banner */}
      {step === 'DONE' || isCompleted ? (
        <div style={{ background: '#dcfce7', padding: '20px', textAlign: 'center', borderBottom: '1px solid #bbf7d0' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>✅</p>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#166534', margin: '0 0 4px' }}>Pickup Completed!</p>
          <p style={{ fontSize: 12, color: '#166534', margin: 0, opacity: 0.8 }}>Order #{order.orderNumber} has been successfully handed over</p>
        </div>
      ) : (
        <ProgressSteps current={step} />
      )}

      <div style={{ padding: '16px' }}>
        {/* Customer Info */}
        <SectionCard title="Customer Details">
          <InfoRow label="Name" value={customerName} />
          <InfoRow label="Phone" value={order.profile?.user?.mobile || 'N/A'} />
          <InfoRow label="Email" value={order.profile?.user?.email || 'N/A'} />
          <InfoRow label="Order" value={order.orderNumber} />
          <InfoRow label="Method" value={order.deliveryMethod?.replace(/_/g, ' ')} />
        </SectionCard>

        {/* Currency Info */}
        <SectionCard title="Currency Details">
          <InfoRow label="Currency" value={currency ? `${currency.name} (${currency.code})` : 'N/A'} />
          <InfoRow label="Amount" value={amount ? `${currency?.code} ${parseFloat(amount).toLocaleString('en-IN')}` : 'N/A'} />
          <InfoRow label="INR Total" value={`₹${parseFloat(order.totalAmountInr || '0').toLocaleString('en-IN')}`} />
        </SectionCard>

        {/* Error */}
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, color: '#991b1b', fontWeight: 500 }}>⚠️ {error}</div>}

        {/* Step: DETAILS → OTP Send */}
        {step === 'DETAILS' && !isCompleted && (
          <ActionPanel>
            <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px', fontWeight: 500, lineHeight: 1.5 }}>
              Before handing over the currency, you must verify the customer's identity via OTP.
            </p>
            <label style={labelStyle}>Send OTP to Customer</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Phone or Email"
              style={inputStyle}
            />
            <PrimaryButton onClick={handleSendOtp} loading={actionLoading} label="Send OTP to Customer" />
          </ActionPanel>
        )}

        {/* Step: OTP VERIFY */}
        {step === 'OTP_VERIFY' && (
          <ActionPanel>
            <div style={{ background: '#eff6ff', borderRadius: 12, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#1e40af', fontWeight: 500 }}>
              📱 OTP sent to <strong>{recipient}</strong>. Ask the customer to share the code.
            </div>
            {devCode && (
              <div style={{ background: '#fef3c7', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#92400e', fontWeight: 600 }}>
                🛠 Dev OTP: <strong>{devCode}</strong>
              </div>
            )}
            <label style={labelStyle}>Enter OTP from Customer</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit OTP"
              maxLength={6}
              style={{ ...inputStyle, fontSize: 22, letterSpacing: '0.3em', textAlign: 'center', fontWeight: 800 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('DETAILS')} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>← Resend OTP</button>
              <PrimaryButton onClick={handleVerifyOtp} loading={actionLoading} label="Verify OTP" flex />
            </div>
          </ActionPanel>
        )}

        {/* Step: DENOMINATIONS → Complete */}
        {step === 'DENOMINATIONS' && (
          <>
            <SectionCard title="✅ OTP Verified — Currency Denominations">
              <DenominationList allocation={order.cashAllocation} />
            </SectionCard>
            <ActionPanel>
              <div style={{ background: '#dcfce7', borderRadius: 12, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#166534', fontWeight: 600 }}>
                ✅ Customer identity verified. Count and hand over all denominations above.
              </div>
              <PrimaryButton onClick={handleCompletePickup} loading={actionLoading} label="✓ Complete Handover" color="#065f46" />
            </ActionPanel>
          </>
        )}

        {/* Completed */}
        {(step === 'DONE' || isCompleted) && !['DETAILS', 'OTP_SEND', 'OTP_VERIFY', 'DENOMINATIONS'].includes(step) && (
          <ActionPanel>
            <button onClick={() => router.push('/workforce/cashier/pickup')} style={{ width: '100%', padding: '15px', background: '#f3f4f6', borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>← Back to Pickups</button>
          </ActionPanel>
        )}

        {step === 'DONE' && (
          <ActionPanel>
            <button onClick={() => router.push('/workforce/cashier/pickup')} style={{ width: '100%', padding: '15px', background: '#f3f4f6', borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>← Back to Pickups</button>
          </ActionPanel>
        )}
      </div>
    </div>
  );
}

// ─── Reusable sub-components ─────────────────────────────────
function ProgressSteps({ current }: { current: Step }) {
  const steps: Step[] = ['DETAILS', 'OTP_VERIFY', 'DENOMINATIONS'];
  const labels = ['Customer Info', 'Verify OTP', 'Hand Over'];
  const idx = steps.indexOf(current);
  return (
    <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', padding: '14px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, background: i <= idx ? '#4338CA' : '#f3f4f6', color: i <= idx ? 'white' : '#9ca3af', border: `2px solid ${i <= idx ? '#4338CA' : '#e5e7eb'}` }}>
                {i < idx ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: i <= idx ? '#4338CA' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{labels[i]}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < idx ? '#4338CA' : '#e5e7eb', margin: '0 4px', marginBottom: 18 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 12, border: '1px solid #f1f5f9' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, minWidth: 80 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#111827', fontWeight: 700, textAlign: 'right', flex: 1 }}>{value}</span>
    </div>
  );
}

function ActionPanel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 16, marginBottom: 12, border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {children}
    </div>
  );
}

function PrimaryButton({ onClick, loading, label, color = '#4338CA', flex = false }: { onClick: () => void; loading: boolean; label: string; color?: string; flex?: boolean }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ flex: flex ? 1 : undefined, width: flex ? undefined : '100%', padding: '15px', background: `linear-gradient(135deg, ${color}, ${color}dd)`, color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s' }}>
      {loading ? '⏳ Processing...' : label}
    </button>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 };
const inputStyle: React.CSSProperties = { border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '13px 14px', fontSize: 15, color: '#111827', fontFamily: 'inherit', fontWeight: 600, background: '#f9fafb', width: '100%', boxSizing: 'border-box' };
