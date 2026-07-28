"use client";
import Link from 'next/link';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import API_URL from '@/lib/api';

function OtpVerificationForm() {
  const searchParams = useSearchParams();
  const recipient = searchParams.get('recipient') || '';
  const purpose = searchParams.get('purpose') || 'LOGIN';

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const val = element.value.replace(/\D/g, ''); // digit only
    if (!val) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Focus next box
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (!newOtp[index] && index > 0) {
        // Empty box, focus previous and erase
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (pasteData.length === 6) {
      const pasteOtp = pasteData.split('');
      setOtp(pasteOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');

    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, purpose, code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'OTP verification failed. Check the code.');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert('A new OTP has been queued.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-md backdrop-blur-md bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Security Check</h2>
          <p className="text-slate-400 text-sm mt-1">Verification OTP sent to {recipient}</p>
        </div>
      </div>

      <div className="mt-6">
        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 text-red-400 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <h3 className="text-2xl font-bold text-white">Verified!</h3>
            <p className="text-slate-300 text-sm">
              Your identity has been confirmed successfully.
            </p>
            <Link
              href="/login"
              className="block w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-center transition-all uppercase tracking-wider text-sm shadow-lg shadow-orange-950/30"
            >
              Proceed
            </Link>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            {/* 6 Digit Inputs */}
            <div className="flex justify-between space-x-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  required
                  value={digit}
                  onPaste={handlePaste}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onChange={(e) => handleChange(e.target, idx)}
                  className="w-12 h-14 bg-slate-950/50 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/50 text-white text-center font-extrabold text-xl rounded-xl focus:outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm tracking-wider rounded-xl shadow-lg shadow-orange-950/30 transition-all uppercase ${
                loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
              }`}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleResend}
                className="text-xs font-semibold text-blue-400 hover:underline hover:text-blue-300"
              >
                Didn't receive the OTP? Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function OtpVerification() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="text-white text-sm font-semibold backdrop-blur-md bg-slate-900/60 p-8 rounded-3xl border border-slate-800">
          Loading OTP form...
        </div>
      }>
        <OtpVerificationForm />
      </Suspense>
    </div>
  );
}
