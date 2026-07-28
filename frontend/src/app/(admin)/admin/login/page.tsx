"use client";
import { useState } from 'react';
import API_URL, { apiJson } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function StaffLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/staff-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const payload = await apiJson<{ access_token: string; user: { id: string; email: string; fullName: string; role: string } }>(res);

      // Store via AuthContext
      login(payload.access_token, payload.user);

      // Redirect based on role
      if (payload.user.role === 'ADMIN' || payload.user.role === 'SUPER_ADMIN') {
        window.location.href = '/admin';
      } else if (['STAFF', 'BRANCH_OPERATIONS', 'COMPLIANCE', 'DEALER', 'ACCOUNTANT'].includes(payload.user.role)) {
        window.location.href = '/ops/tasks';
      } else {
        // Public roles (CUSTOMER, BRANCH_MANAGER) trying to login to internal portal
        sessionStorage.removeItem('forexmate_token');
        sessionStorage.removeItem('forexmate_user');
        throw new Error('Unauthorized role. Please use the public login portal.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* High-Tech Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[150px] pointer-events-none z-0" />
      
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.15)] border border-blue-900/30 overflow-hidden relative z-10">
        
        {/* Header */}
        <div className="border-b border-blue-900/30 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-blue-500 to-blue-900 opacity-50" />
          <div className="w-16 h-16 bg-blue-950 border border-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h2 className="text-2xl font-black tracking-widest uppercase text-white mb-1 drop-shadow-md">Internal Network</h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-blue-300/70 text-xs font-bold tracking-[0.2em] uppercase">Restricted Access</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-sm font-semibold text-center backdrop-blur-md">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-blue-400/80 mb-2 uppercase tracking-wider">Corporate ID (Email)</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#0a0f18]/80 border border-slate-700 rounded-xl pl-10 p-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none placeholder-slate-600 font-mono text-sm"
                  placeholder="sysadmin@forexmate.local"
                />
                <svg className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-blue-400/80 mb-2 uppercase tracking-wider">Security Key</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#0a0f18]/80 border border-slate-700 rounded-xl pl-10 p-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none placeholder-slate-600 font-mono text-sm tracking-widest"
                  placeholder="••••••••"
                />
                <svg className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-black text-sm tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? 'Authenticating...' : 'Authorize Access'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500 font-mono tracking-wider">
              IP: 192.168.1.100 • SECURE CONNECTION
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
