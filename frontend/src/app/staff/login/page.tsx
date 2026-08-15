"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import API_URL, { apiJson } from '@/lib/api';
import { setWorkforceToken } from '@/lib/workforceApi';
import { useWorkforceAuth, WORKFORCE_API_URL } from '@/context/WorkforceAuthContext';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, UserCheck, KeyRound, Building2, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function DedicatedStaffLoginPage() {
  const router = useRouter();
  const { login: workforceLogin } = useWorkforceAuth();
  const { login: adminAuthLogin } = useAuth();

  const [activeTab, setActiveTab] = useState<'EMPLOYEE_ID' | 'CORPORATE_EMAIL'>('EMPLOYEE_ID');
  
  // Form State
  const [employeeCode, setEmployeeCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Employee ID Login (Workforce API)
  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${WORKFORCE_API_URL}/workforce/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeCode: employeeCode.trim().toUpperCase(), password }),
      });
      const json = await res.json();
      const data = json.data ?? json;

      if (!res.ok) throw new Error(data.message || 'Invalid Employee Credentials');

      const { access_token, employee } = data;
      setWorkforceToken(access_token);
      workforceLogin(access_token, employee);

      // Synchronize token and user into main AuthContext stores
      const authUser = {
        id: employee.id,
        email: employee.email || `${employee.employeeCode.toLowerCase()}@forexmate.local`,
        fullName: employee.name,
        role: employee.role,
      };
      localStorage.setItem('forexmate_token', access_token);
      sessionStorage.setItem('forexmate_token', access_token);
      sessionStorage.setItem('forexmate_user', JSON.stringify(authUser));
      adminAuthLogin(access_token, authUser);

      // Direct navigation to destination portal (no intermediate bounce loops)
      if (employee.mustChangePassword) {
        window.location.href = '/workforce/change-password';
      } else if (employee.role === 'BRANCH_MANAGER') {
        window.location.href = '/manager/dashboard';
      } else if (employee.role === 'BRANCH_CASHIER') {
        window.location.href = '/workforce/cashier';
      } else if (employee.role === 'DELIVERY_PARTNER') {
        window.location.href = '/workforce/delivery';
      } else {
        window.location.href = '/manager/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate employee. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Corporate Email Login (Internal Staff API)
  const handleCorporateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/staff-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        credentials: 'include',
      });

      const payload = await apiJson<{ access_token: string; workforce_token?: string; user: { id: string; email: string; fullName: string; role: string } }>(res);

      adminAuthLogin(payload.access_token, payload.user);
      localStorage.setItem('forexmate_token', payload.access_token);
      sessionStorage.setItem('forexmate_token', payload.access_token);
      sessionStorage.setItem('forexmate_user', JSON.stringify(payload.user));

      // If backend returned a workforce_token (for BRANCH_MANAGER), store it for the manager dashboard
      if (payload.workforce_token) {
        setWorkforceToken(payload.workforce_token);
        workforceLogin(payload.workforce_token, {
          id: payload.user.id,
          name: payload.user.fullName,
          role: payload.user.role,
          employeeCode: '',
        });
      }

      if (payload.user.role === 'ADMIN' || payload.user.role === 'SUPER_ADMIN') {
        window.location.href = '/admin';
      } else if (['STAFF', 'BRANCH_OPERATIONS', 'COMPLIANCE', 'DEALER', 'ACCOUNTANT'].includes(payload.user.role)) {
        window.location.href = '/ops/tasks';
      } else if (payload.user.role === 'BRANCH_MANAGER') {
        window.location.href = '/manager/dashboard';
      } else {
        sessionStorage.removeItem('forexmate_token');
        sessionStorage.removeItem('forexmate_user');
        throw new Error('Unauthorized account role for internal staff portal.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed for corporate account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 md:p-8 font-sans relative overflow-hidden text-slate-100">
      
      {/* Background Glow Overlay */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header Bar */}
      <header className="max-w-6xl mx-auto w-full flex justify-between items-center relative z-10 py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              ForexMate <span className="text-xs bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-md uppercase">Staff Portal</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Authorized Operational Workforce Only</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Internal Network Active
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto relative z-10 my-8">
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8">
          
          {/* Lock Icon & Title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/30">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Staff Authentication</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Sign in with your assigned employee credentials</p>
          </div>

          {/* Login Type Switcher Tabs */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1 mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('EMPLOYEE_ID'); setError(''); }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'EMPLOYEE_ID' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Employee ID</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('CORPORATE_EMAIL'); setError(''); }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'CORPORATE_EMAIL' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Corporate Email</span>
            </button>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form: Employee ID Mode */}
          {activeTab === 'EMPLOYEE_ID' ? (
            <form onSubmit={handleEmployeeLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Employee ID / Code *
                </label>
                <input
                  type="text"
                  required
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  placeholder="e.g. EMP-000001"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none uppercase font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">Provided by branch operations manager</p>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your workforce password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none pr-10 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Demo Fill Buttons */}
              <div className="pt-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">Quick Demo Fill:</span>
                  <button
                    type="button"
                    onClick={() => { setEmployeeCode('000004'); setPassword('MAGE@1234'); }}
                    className="text-[10px] font-bold bg-indigo-950/60 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 px-2.5 py-1 rounded-md transition-colors"
                  >
                    Manager (000004 / MAGE@1234)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmployeeCode('EMP-000001'); setPassword('Admin@123'); }}
                    className="text-[10px] font-bold bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 px-2.5 py-1 rounded-md transition-colors"
                  >
                    Manager (EMP-000001)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmployeeCode('EMP-000002'); setPassword('Cashier@123'); }}
                    className="text-[10px] font-bold bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 px-2.5 py-1 rounded-md transition-colors"
                  >
                    Cashier (EMP-000002)
                  </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            /* Form: Corporate Email Mode */
            <form onSubmit={handleCorporateLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sysadmin@forexmate.local"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Security Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none pr-10 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Demo Fill Buttons */}
              <div className="pt-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">Quick Demo Fill:</span>
                <button
                  type="button"
                  onClick={() => { setEmail('sysadmin@forexmate.local'); setPassword('Admin@123'); }}
                  className="text-[10px] font-bold bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 px-2.5 py-1 rounded-md transition-colors"
                >
                  System Admin (sysadmin@forexmate.local)
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Authorize Corporate Access'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-6xl mx-auto w-full text-center relative z-10 py-2">
        <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secured 256-bit Encrypted Connection • ForexMate Operations Network</span>
        </p>
      </footer>
    </div>
  );
}
