"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { workforceFetch, workforceJson } from '@/lib/workforceApi';
import { MobileHeader, LoadingScreen, DenominationList } from '@/components/workforce/MobileUI';

type Step = 'DETAILS' | 'IN_TRANSIT' | 'REACHED' | 'OTP_VERIFY' | 'PROOF' | 'DONE';

export default function DeliveryOrderDetailPage() {
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
  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [photoData, setPhotoData] = useState<string>('');
  const [signatureData, setSignatureData] = useState<string>('');

  useEffect(() => {
    workforceFetch(`/orders/${id}`)
      .then(workforceJson)
      .then((data) => {
        setOrder(data);
        setRecipient(data.profile?.user?.mobile || data.profile?.user?.email || '');
        // Restore step from order stage
        if (['DELIVERED', 'COMPLETED'].includes(data.status)) setStep('DONE');
        else if (data.currentStage === 'REACHED_CUSTOMER') setStep('OTP_VERIFY');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen message="Loading delivery..." />;
  if (!order) return <div style={{ padding: 24, color: '#ef4444' }}>Order not found.</div>;

  const isCompleted = ['DELIVERED', 'COMPLETED'].includes(order.status);
  const customerName = order.profile?.user?.fullName || 'Customer';
  const deliveryJob = order.deliveryJob;
  const address = deliveryJob?.deliveryAddress || order.deliveries?.[0]?.address?.streetLine || 'Address not available';
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`;

  // ─── Canvas Signature Handlers ────────────────────────────
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureSaved(false);
    setSignatureData('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current!;
    const data = canvas.toDataURL('image/png');
    setSignatureData(data);
    setSignatureSaved(true);
  };

  // ─── API Calls ─────────────────────────────────────────────
  const handleReachedCustomer = async () => {
    setActionLoading(true); setError('');
    try {
      const res = await workforceFetch(`/orders/${id}/reached-customer`, { method: 'POST', body: '{}' });
      await workforceJson(res);
      setStep('OTP_VERIFY');
    } catch (err: any) { setError(err.message); } finally { setActionLoading(false); }
  };

  const handleSendOtp = async () => {
    setActionLoading(true); setError('');
    try {
      const res = await workforceFetch(`/orders/${id}/send-otp`, { method: 'POST', body: JSON.stringify({ recipient }) });
      const data = await workforceJson(res);
      if (data.devCode) setDevCode(data.devCode);
    } catch (err: any) { setError(err.message); } finally { setActionLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) { setError('Enter the 6-digit OTP.'); return; }
    setActionLoading(true); setError('');
    try {
      const res = await workforceFetch(`/orders/${id}/verify-otp`, { method: 'POST', body: JSON.stringify({ recipient, code: otpCode }) });
      await workforceJson(res);
      setStep('PROOF');
    } catch (err: any) { setError(err.message); } finally { setActionLoading(false); }
  };

  const handleCompleteDelivery = async () => {
    if (!signatureData) { setError('Please capture customer signature first.'); return; }
    if (!photoData) { setError('Please capture a delivery photo.'); return; }
    setActionLoading(true); setError('');
    try {
      const res = await workforceFetch(`/orders/${id}/complete-delivery`, {
        method: 'POST',
        body: JSON.stringify({ signatureData, photoData }),
      });
      await workforceJson(res);
      setStep('DONE');
    } catch (err: any) { setError(err.message); } finally { setActionLoading(false); }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoData(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 32, background: '#f8fafc', minHeight: '100dvh' }}>
      <MobileHeader title="Delivery" subtitle={order.orderNumber} onBack={() => router.back()} />

      {/* Completed banner */}
      {step === 'DONE' && (
        <div style={{ background: '#dcfce7', padding: '20px', textAlign: 'center', borderBottom: '1px solid #bbf7d0' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>✅</p>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#166534', margin: '0 0 4px' }}>Delivery Completed!</p>
          <p style={{ fontSize: 12, color: '#166534', margin: 0, opacity: 0.8 }}>Proof captured & submitted successfully.</p>
        </div>
      )}

      {/* Delivery Progress */}
      {step !== 'DONE' && !isCompleted && <DeliveryProgress current={step} />}

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Customer Info */}
        <InfoCard title="Customer & Delivery">
          <InfoRow label="Name" value={customerName} />
          <InfoRow label="Phone" value={order.profile?.user?.mobile || 'N/A'} />
          <InfoRow label="Address" value={address} />
          <InfoRow label="Order" value={order.orderNumber} />
          {/* Maps deep link */}
          <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, background: '#dbeafe', borderRadius: 12, padding: '10px 14px', textDecoration: 'none', color: '#1e40af', fontSize: 13, fontWeight: 700 }}>
            📍 Open in Google Maps →
          </a>
        </InfoCard>

        {/* Currency */}
        {order.items?.[0] && (
          <InfoCard title="Currency Details">
            <InfoRow label="Currency" value={`${order.items[0].currency?.code} — ${order.items[0].currency?.name}`} />
            <InfoRow label="Amount" value={`${order.items[0].currency?.code} ${parseFloat(order.items[0].amount).toLocaleString('en-IN')}`} />
            <InfoRow label="INR Value" value={`₹${parseFloat(order.totalAmountInr).toLocaleString('en-IN')}`} />
          </InfoCard>
        )}

        {/* Denominations */}
        {order.cashAllocation && (
          <InfoCard title="Currency Denominations">
            <DenominationList allocation={order.cashAllocation} />
          </InfoCard>
        )}

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 14, fontSize: 13, color: '#991b1b', fontWeight: 500 }}>⚠️ {error}</div>}

        {/* STEP: DETAILS → Start */}
        {step === 'DETAILS' && !isCompleted && (
          <ActionBox>
            <p style={{ fontSize: 13, color: '#374151', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>Navigate to the customer's address. Tap when you've arrived.</p>
            <EmeraldBtn onClick={handleReachedCustomer} loading={actionLoading} label="📍 I've Reached the Customer" />
          </ActionBox>
        )}

        {/* STEP: OTP_VERIFY */}
        {step === 'OTP_VERIFY' && (
          <ActionBox>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>Verify Customer Identity</p>
            <label style={lbl}>Customer Phone / Email</label>
            <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} style={inp} />
            <button onClick={handleSendOtp} disabled={actionLoading} style={{ ...secondaryBtn, marginBottom: 12 }}>
              {actionLoading ? '⏳ Sending...' : '📤 Send OTP to Customer'}
            </button>
            {devCode && <div style={{ background: '#fef3c7', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 12 }}>🛠 Dev OTP: {devCode}</div>}
            <label style={lbl}>Enter OTP from Customer</label>
            <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g,''))} maxLength={6} placeholder="6-digit code" style={{ ...inp, fontSize: 22, letterSpacing: '0.3em', textAlign: 'center', fontWeight: 800 }} />
            <EmeraldBtn onClick={handleVerifyOtp} loading={actionLoading} label="✓ Verify OTP & Continue" />
          </ActionBox>
        )}

        {/* STEP: PROOF — Signature + Photo */}
        {step === 'PROOF' && (
          <ActionBox>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Capture Delivery Proof</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 16px', fontWeight: 500 }}>OTP verified ✅ — Now capture signature and photo.</p>

            {/* Signature Canvas */}
            <label style={lbl}>Customer Signature</label>
            <div style={{ border: '2px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: 'white', marginBottom: 8, position: 'relative' }}>
              <canvas
                ref={canvasRef}
                width={380}
                height={160}
                style={{ touchAction: 'none', display: 'block', width: '100%', cursor: 'crosshair' }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
              {!signatureSaved && (
                <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#d1d5db', fontSize: 13, fontWeight: 500, pointerEvents: 'none', textAlign: 'center', margin: 0 }}>✍️ Ask customer to sign here</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button onClick={clearSignature} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>🗑 Clear</button>
              <button onClick={saveSignature} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#d1fae5', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#065f46' }}>
                {signatureSaved ? '✅ Saved' : '💾 Save Signature'}
              </button>
            </div>

            {/* Photo Capture */}
            <label style={lbl}>Delivery Photo</label>
            <label style={{ display: 'block', background: photoData ? '#d1fae5' : '#f9fafb', border: `2px dashed ${photoData ? '#059669' : '#d1d5db'}`, borderRadius: 12, padding: '16px', textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}>
              {photoData ? (
                <div>
                  <img src={photoData} alt="Delivery proof" style={{ width: '100%', borderRadius: 8, marginBottom: 8, maxHeight: 120, objectFit: 'cover' }} />
                  <p style={{ fontSize: 12, color: '#065f46', fontWeight: 700, margin: 0 }}>✅ Photo captured — tap to retake</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 24, margin: '0 0 8px' }}>📸</p>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0, fontWeight: 500 }}>Tap to capture delivery photo</p>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} style={{ display: 'none' }} />
            </label>

            <EmeraldBtn
              onClick={handleCompleteDelivery}
              loading={actionLoading}
              label="✓ Complete Delivery"
              disabled={!signatureSaved || !photoData}
            />
          </ActionBox>
        )}

        {/* DONE */}
        {step === 'DONE' && (
          <button onClick={() => router.push('/workforce/delivery/orders')} style={{ width: '100%', padding: '15px', background: '#f3f4f6', borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>
            ← Back to Deliveries
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────
function DeliveryProgress({ current }: { current: Step }) {
  const steps: Step[] = ['DETAILS', 'REACHED', 'OTP_VERIFY', 'PROOF'];
  const labels = ['Navigate', 'Reached', 'Verify', 'Proof'];
  const idx = current === 'REACHED' ? 1 : current === 'OTP_VERIFY' ? 2 : current === 'PROOF' ? 3 : 0;

  return (
    <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', padding: '14px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, background: i <= idx ? '#065f46' : '#f3f4f6', color: i <= idx ? 'white' : '#9ca3af', border: `2px solid ${i <= idx ? '#065f46' : '#e5e7eb'}` }}>
                {i < idx ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: i <= idx ? '#065f46' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{labels[i]}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < idx ? '#065f46' : '#e5e7eb', margin: '0 4px', marginBottom: 18 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '1px solid #f1f5f9' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>{title}</p>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, minWidth: 70 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#111827', fontWeight: 700, textAlign: 'right', flex: 1 }}>{value}</span>
    </div>
  );
}

function ActionBox({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'white', borderRadius: 20, padding: 16, border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>;
}

function EmeraldBtn({ onClick, loading, label, disabled }: { onClick: () => void; loading: boolean; label: string; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={loading || disabled} style={{ width: '100%', padding: '15px', background: `linear-gradient(135deg, #065f46, #059669)`, color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: (loading || disabled) ? 0.6 : 1 }}>
      {loading ? '⏳ Processing...' : label}
    </button>
  );
}

const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 };
const inp: React.CSSProperties = { border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '13px 14px', fontSize: 15, color: '#111827', fontFamily: 'inherit', fontWeight: 600, background: '#f9fafb', width: '100%', boxSizing: 'border-box' as const, marginBottom: 12 };
const secondaryBtn: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid #d1fae5', background: '#ecfdf5', color: '#065f46', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };
