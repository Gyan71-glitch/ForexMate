"use client";
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import API_URL from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token is missing. Please request a new reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/password-reset/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Reset failed. Your link may have expired.');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md backdrop-blur-md bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">New Password</h2>
          <p className="text-slate-400 text-sm mt-1">Update your secure access credentials</p>
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
            <p className="text-slate-300 text-sm">
              Your password has been successfully reset! You can now log in with your new credentials.
            </p>
            <Link
              href="/login"
              className="block w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-center transition-all uppercase tracking-wider text-sm shadow-lg shadow-orange-950/30"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
                New Password <span className="text-orange-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/50 transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
                Confirm Password <span className="text-orange-500">*</span>
              </label>
              <input
                id="confirm-password"
                name="password-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/50 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm tracking-wider rounded-xl shadow-lg shadow-orange-950/30 transition-all uppercase mt-6 ${
                loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
              }`}
            >
              {loading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Suspense fallback={
        <div className="text-white text-sm font-semibold backdrop-blur-md bg-slate-900/60 p-8 rounded-3xl border border-slate-800">
          Loading reset details...
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
