"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import API_URL, { apiJson } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      // apiJson unwraps the { success, data, meta } envelope automatically
      const payload = await apiJson<{ access_token: string; user: { id: string; email: string; fullName: string; role: string } }>(res);

      // Context-level login
      login(payload.access_token, payload.user);

      const role = payload.user.role;
      if (['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'COMPLIANCE_ADMIN', 'STAFF', 'COMPLIANCE', 'DEALER', 'ACCOUNTANT', 'BRANCH_OPERATIONS'].includes(role)) {
        // Force internal users to use the internal portal
        sessionStorage.removeItem('forexmate_token');
        sessionStorage.removeItem('forexmate_user');
        window.location.href = '/admin/login?error=internal_only';
      } else if (role === 'BRANCH_MANAGER') {
        window.location.href = '/manager/dashboard';
      } else {
        window.location.href = '/';
      }
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
        const role = payload.user.role;
        if (['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'COMPLIANCE_ADMIN', 'STAFF', 'COMPLIANCE', 'DEALER', 'ACCOUNTANT', 'BRANCH_OPERATIONS'].includes(role)) {
          // Force internal users to use the internal portal
          sessionStorage.removeItem('forexmate_token');
          sessionStorage.removeItem('forexmate_user');
          window.location.href = '/admin/login?error=internal_only';
        } else if (role === 'BRANCH_MANAGER') {
          window.location.href = '/manager/dashboard';
        } else {
          window.location.href = '/';
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Login Failed');
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md backdrop-blur-md bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-1">Access your enterprise Forex account</p>
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
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 text-red-400 text-sm rounded-xl text-center backdrop-blur-sm animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/50 transition-all text-sm"
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="current-password" className="block text-xs font-bold text-slate-400 tracking-wider uppercase">
                  Password <span className="text-orange-500">*</span>
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-blue-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="current-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  enterKeyHint="done"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-4 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/50 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-wider"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm tracking-wider rounded-xl shadow-lg shadow-orange-950/30 transition-all uppercase mt-6 ${
                loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
              }`}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-1 border-slate-800" />
            <span className="px-4 text-xs font-bold text-slate-500">OR</span>
            <hr className="flex-1 border-slate-800" />
          </div>

          {/* Google Sign In */}
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
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-sm text-slate-400 mt-8">
            New to Forexmate?{' '}
            <Link href="/register" className="text-blue-400 font-bold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
