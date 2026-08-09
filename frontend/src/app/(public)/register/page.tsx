"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import API_URL, { apiJson } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2 || fullName.trim().length > 50) {
      setError("Full name must be between 2 and 50 characters long.");
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      setError("Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).");
      return;
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, mobile, email, password }),
      });

      await apiJson(res);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: tokenResponse.access_token }),
        });

        const payload = await apiJson<{ access_token: string; user: { id: string; email: string; fullName: string; role: string } }>(res);

        login(payload.access_token, payload.user);
        window.location.href = '/';
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Login Failed');
    }
  });

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="w-full max-w-md backdrop-blur-md bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl p-10 text-center relative z-10">
          <div className="w-16 h-16 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            ✓
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Account Created!</h2>
          <p className="text-slate-400 mt-2 mb-8 text-sm">Your Forex account is ready. Please log in to complete verification.</p>
          <Link
            href="/login"
            className="block w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-center transition-all uppercase tracking-wider text-sm shadow-lg shadow-orange-950/30"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md backdrop-blur-md bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Register</h2>
            <p className="text-slate-400 text-sm mt-1">Create your secure client profile</p>
          </div>
          <Link
            href="/"
            className="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full flex items-center justify-center text-lg font-bold transition-all border border-slate-700/50"
          >
            ✕
          </Link>
        </div>

        <div className="mt-6">
          {error && (
            <div className="mb-5 p-4 bg-red-950/40 border border-red-800/60 text-red-400 text-sm rounded-xl text-center backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
                Full Name <span className="text-orange-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                enterKeyHint="next"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/50 transition-all text-sm"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="tel" className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
                Mobile Number <span className="text-orange-500">*</span>
              </label>
              <div className="flex items-center bg-slate-950/50 border border-slate-800 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-900/50 transition-all overflow-hidden">
                <span className="bg-slate-900 px-4 py-3 text-slate-400 font-semibold border-r border-slate-800 text-sm">+91</span>
                <input
                  id="tel"
                  name="tel"
                  type="tel"
                  required
                  autoComplete="tel-national"
                  enterKeyHint="next"
                  inputMode="numeric"
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9999999999"
                  maxLength={10}
                  className="flex-1 bg-transparent px-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
                Email Address <span className="text-orange-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                enterKeyHint="next"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/50 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="new-password" className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
                Create Password <span className="text-orange-500">*</span>
              </label>
              <input
                id="new-password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                enterKeyHint="next"
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/50 transition-all text-sm"
              />
            </div>

            {/* Repeat Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
                Repeat Password <span className="text-orange-500">*</span>
              </label>
              <input
                id="confirm-password"
                name="password-confirm"
                type="password"
                required
                autoComplete="new-password"
                enterKeyHint="done"
                value={repeatPassword}
                onChange={e => setRepeatPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/50 transition-all text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm tracking-wider rounded-xl shadow-lg shadow-orange-950/30 transition-all uppercase mt-6 ${
                loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
              }`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5">
            <hr className="flex-1 border-slate-800" />
            <span className="px-4 text-xs font-bold text-slate-500">OR</span>
            <hr className="flex-1 border-slate-800" />
          </div>

          {/* Google Sign Up */}
          <button
            onClick={() => handleGoogleLogin()}
            type="button"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3 bg-slate-950/50 border border-slate-800 rounded-xl hover:bg-slate-900 text-slate-300 transition-all text-sm font-semibold hover:border-slate-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign Up with Google</span>
          </button>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
