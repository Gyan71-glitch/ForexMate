"use client";
import Link from 'next/link';
import { useState } from 'react';
import API_URL from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`${API_URL}/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md backdrop-blur-md bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Reset Password</h2>
            <p className="text-slate-400 text-sm mt-1">Receive a secure reset link</p>
          </div>
          <Link
            href="/login"
            className="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full flex items-center justify-center text-lg font-bold transition-all border border-slate-700/50"
          >
            ✕
          </Link>
        </div>

        <div className="mt-6">
          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 text-red-400 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-blue-950/60 text-blue-400 border border-blue-800/50 rounded-full flex items-center justify-center mx-auto text-3xl">
                ✉
              </div>
              <p className="text-slate-300 text-sm">
                If an account exists for <strong className="text-white">{email}</strong>, a recovery link has been queued to your email address.
              </p>
              <Link
                href="/login"
                className="block w-full py-3 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-center transition-all uppercase tracking-wider text-xs border border-slate-700"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
                  Email Address <span className="text-orange-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/50 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm tracking-wider rounded-xl shadow-lg shadow-orange-950/30 transition-all uppercase ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
                }`}
              >
                {loading ? 'Sending link...' : 'Request Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
