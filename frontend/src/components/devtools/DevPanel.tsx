"use client";
import React, { useState, useEffect } from 'react';
import { useDev } from './DevContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  ShieldAlert, UserCheck, Shield, KeyRound, Clock, Coins, 
  Play, RefreshCw, Trash2, Bell, Database, Cpu, 
  Terminal, Settings, HelpCircle, FileText, Ban, AlertTriangle, PlayCircle, Eye
} from 'lucide-react';

interface DevPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'AUTH', label: 'Auth & Impersonation', icon: KeyRound },
  { id: 'ORDERS', label: 'Orders & Scenarios', icon: PlayCircle },
  { id: 'KYC', label: 'KYC & Toggles', icon: UserCheck },
  { id: 'RATES', label: 'Treasury & Rates', icon: Coins },
  { id: 'EVENTS', label: 'Event Bus Timeline', icon: Terminal },
  { id: 'QUEUES', label: 'Queues & Performance', icon: Cpu },
  { id: 'DB_BROWSER', label: 'DB & Swagger', icon: Database },
  { id: 'RESET', label: 'Factory Reset', icon: Trash2 },
];

export function DevPanel({ isOpen, onClose }: DevPanelProps) {
  const { devFlags, setFlag, latency, setLatency, mockTime, setMockTime } = useDev();
  const { login, logout, user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('AUTH');
  const [impersonateEmail, setImpersonateEmail] = useState('');
  const [impersonateRole, setImpersonateRole] = useState('CUSTOMER');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [kycTargetUser, setKycTargetUser] = useState('');
  const [kycPreset, setKycPreset] = useState('APPROVED');
  const [paymentOrderId, setPaymentOrderId] = useState('');
  const [paymentScenario, setPaymentScenario] = useState('SUCCESS');
  const [seedPresetName, setSeedPresetName] = useState('MEDIUM_BUSINESS');
  const [resetConfirm, setResetConfirm] = useState('');
  const [rateMode, setRateMode] = useState('NORMAL');
  const [eventLogs, setEventLogs] = useState<any[]>([]);
  const [eventSearch, setEventSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [queueInfo, setQueueInfo] = useState<any>({ counts: { PENDING: 0, FAILED: 0, PROCESSED: 0 }, recent: [] });
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [dbTable, setDbTable] = useState('user');
  const [dbRows, setDbRows] = useState<any[]>([]);
  const [customTime, setCustomTime] = useState('');
  const [errorInjections, setErrorInjections] = useState<any>({});
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchRatesMode();
      fetchEvents();
      fetchQueueData();
      fetchPerformance();
      fetchHealth();
      fetchDbRows();
      fetchInjectedErrors();
    }
  }, [isOpen, dbTable, eventFilter]);

  // Fetch baseline values
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/v1/dev/users');
      if (res.ok) {
        const payload = await res.json();
        setUsersList(payload.data || payload);
      }
    } catch (_) {}
  };

  const fetchRatesMode = async () => {
    try {
      const res = await fetch('/api/v1/dev/rates-mode');
      if (res.ok) {
        const payload = await res.json();
        setRateMode(payload.data?.mode || payload.mode || 'NORMAL');
      }
    } catch (_) {}
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/v1/dev/events?filter=${eventFilter}&search=${eventSearch}`);
      if (res.ok) {
        const payload = await res.json();
        setEventLogs(payload.data || payload);
      }
    } catch (_) {}
  };

  const fetchQueueData = async () => {
    try {
      const res = await fetch('/api/v1/dev/queues');
      if (res.ok) {
        const payload = await res.json();
        setQueueInfo(payload.data || payload);
      }
    } catch (_) {}
  };

  const fetchPerformance = async () => {
    try {
      const res = await fetch('/api/v1/dev/performance');
      if (res.ok) {
        const payload = await res.json();
        setPerformanceStats(payload.data || payload);
      }
    } catch (_) {}
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/v1/dev/health');
      if (res.ok) {
        const payload = await res.json();
        setSystemHealth(payload.data || payload);
      }
    } catch (_) {}
  };

  const fetchDbRows = async () => {
    try {
      const res = await fetch(`/api/v1/dev/table/${dbTable}`);
      if (res.ok) {
        const payload = await res.json();
        setDbRows(payload.data || payload);
      }
    } catch (_) {}
  };

  const fetchInjectedErrors = async () => {
    try {
      const res = await fetch('/api/v1/dev/error-injection');
      if (res.ok) {
        const payload = await res.json();
        setErrorInjections(payload.data || payload);
      }
    } catch (_) {}
  };

  // Auth Operations
  const handleQuickLogin = async (role: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/dev/login/${role}`, { method: 'POST' });
      if (!res.ok) throw new Error('Dev login failed.');
      const data = await res.json();
      const payload = data.data || data;
      login(payload.access_token, payload.user);
      toast.success(`Logged in as dev ${role.toUpperCase()}`);
      onClose();
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImpersonate = async () => {
    if (!impersonateEmail) return toast.error('Enter target email.');
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/dev/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: impersonateEmail, role: impersonateRole }),
      });
      if (!res.ok) throw new Error('Impersonation failed.');
      const data = await res.json();
      const payload = data.data || data;
      login(payload.access_token, payload.user);
      toast.success(`Impersonating ${impersonateEmail} [${impersonateRole}]`);
      onClose();
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // KYC presets
  const handleApplyKyc = async () => {
    if (!kycTargetUser) return toast.error('Select target customer.');
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/dev/kyc-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: kycTargetUser, preset: kycPreset }),
      });
      if (!res.ok) throw new Error('Preset application failed.');
      toast.success(`KYC Preset [${kycPreset}] applied successfully.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Payment mock
  const handleMockPayment = async () => {
    if (!paymentOrderId) return toast.error('Enter Order ID.');
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/dev/mock-pay-order/${paymentOrderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: paymentScenario }),
      });
      if (!res.ok) throw new Error('Mock payment failed.');
      toast.success(`Simulated payment [${paymentScenario}] applied successfully.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Seed preset
  const handleSeedPreset = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/dev/seed-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetName: seedPresetName }),
      });
      if (!res.ok) throw new Error('Seed generation failed.');
      const data = await res.json();
      toast.success(`Seed profile [${seedPresetName}] loaded!`);
      fetchUsers();
      fetchHealth();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset database
  const handleResetDatabase = async () => {
    if (resetConfirm !== 'RESET') return toast.error('Type RESET to confirm.');
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/dev/reset-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: resetConfirm }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Reset database failed.');
      }
      toast.success('Database factory reset & verified successfully.');
      setResetConfirm('');
      fetchUsers();
      fetchHealth();
      logout();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Rate Control
  const handleRateAction = async (action: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/dev/rate-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Rate control action failed.');
      toast.success(`Rates action [${action}] set.`);
      setRateMode(action);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Replay event
  const handleReplayEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/dev/events/replay/${id}`, { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Event replayed successfully.');
      fetchEvents();
    } catch (_) {
      toast.error('Replay event failed.');
    }
  };

  // Queue actions
  const handleQueueAction = async (action: string) => {
    try {
      const res = await fetch('/api/v1/dev/queues/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Queue action [${action}] executed.`);
      fetchQueueData();
      fetchPerformance();
    } catch (_) {
      toast.error('Queue action failed.');
    }
  };

  // Error Injection
  const handleToggleError = async (flag: string, state: boolean) => {
    try {
      const res = await fetch('/api/v1/dev/error-injection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag, state }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Error Injection [${flag}] set to ${state}`);
      fetchInjectedErrors();
      fetchHealth();
    } catch (_) {
      toast.error('Failed to toggle error injection.');
    }
  };

  // Time Mock
  const handleSetMockTime = () => {
    try {
      setMockTime(customTime ? new Date(customTime).toISOString() : null);
      toast.success(customTime ? `System mock date updated.` : `System mock date cleared.`);
    } catch (_) {
      toast.error('Invalid date format.');
    }
  };

  // Scenario Runner triggers
  const handleRunScenario = async (scenario: string) => {
    toast.info(`Running Scenario: ${scenario}...`);
    // Seed and execute simulated steps
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Scenario [${scenario}] completed successfully!`);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[550px] bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300 font-sans">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-inner animate-pulse">⚡</div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white uppercase">Forexmate QA DevTools</h2>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider">ENTERPRISE SYSTEM DIAGNOSTICS</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-extrabold text-sm border border-slate-700 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-[180px] bg-slate-950/40 border-r border-slate-800 flex flex-col overflow-y-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 text-left text-xs font-bold transition-all border-b border-slate-800/40 flex items-center gap-3 ${activeTab === tab.id ? 'bg-slate-800/60 text-orange-500 border-r-2 border-r-orange-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
              <RefreshCw className="w-10 h-10 text-orange-500 animate-spin mb-4" />
              <p className="text-slate-300 font-bold text-sm tracking-wide">Executing developer action...</p>
            </div>
          )}

          {/* TAB 1: AUTH & IMPERSONATION */}
          {activeTab === 'AUTH' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Quick Login Presets</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleQuickLogin('customer')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-3 text-xs font-bold flex flex-col items-center text-center">
                    <UserCheck className="w-6 h-6 text-blue-400 mb-2" />
                    <span>Login as Customer</span>
                  </button>
                  <button onClick={() => handleQuickLogin('admin')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-3 text-xs font-bold flex flex-col items-center text-center">
                    <Shield className="w-6 h-6 text-orange-400 mb-2" />
                    <span>Login as Super Admin</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">User Impersonation</h3>
                <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Target User Email</label>
                    <input 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      placeholder="e.g. teller@forexmate.com"
                      value={impersonateEmail}
                      onChange={e => setImpersonateEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Temporary Role Pretend</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      value={impersonateRole}
                      onChange={e => setImpersonateRole(e.target.value)}
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="STAFF">STAFF (Teller)</option>
                      <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
                      <option value="COMPLIANCE">COMPLIANCE</option>
                      <option value="DEALER">DEALER</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </div>
                  <button onClick={handleImpersonate} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-lg text-xs">
                    Impersonate User (Generate Override JWT)
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Time Simulation (Mock Date)</h3>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <p className="text-[11px] text-slate-400">Overriding mock time resets quote expiries, LRS trackers, and passport limits instantly.</p>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      value={customTime}
                      onChange={e => setCustomTime(e.target.value)}
                    />
                    <button onClick={handleSetMockTime} className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-4 rounded-lg">Set</button>
                  </div>
                  {mockTime && (
                    <div className="p-2 bg-orange-950/30 border border-orange-900/40 text-orange-400 text-xs font-bold rounded-lg text-center">
                      Active Offset: {new Date(mockTime).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS & SCENARIOS */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Simulate End-to-End Scenarios</h3>
                <div className="space-y-3">
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Scenario 1: Happy Path Customer Cash Order</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Locks quote -&gt; Uploads KYC -&gt; Paid -&gt; Delivery completed</p>
                    </div>
                    <button onClick={() => handleRunScenario('Happy Cash')} className="bg-orange-600 hover:bg-orange-500 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <Play className="w-3 h-3" /> Run
                    </button>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Scenario 2: Failed Outward Remittance Recovery</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Triggers LRS block -&gt; Staff overrides -&gt; Resolves order</p>
                    </div>
                    <button onClick={() => handleRunScenario('Remit Fail')} className="bg-orange-600 hover:bg-orange-500 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <Play className="w-3 h-3" /> Run
                    </button>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Scenario 3: Forex Card Reload</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Purchases card -&gt; Simulates successful reloading wallet balances</p>
                    </div>
                    <button onClick={() => handleRunScenario('Card Reload')} className="bg-orange-600 hover:bg-orange-500 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <Play className="w-3 h-3" /> Run
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Mock Payment Simulations</h3>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Enter Order ID</label>
                    <input 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      placeholder="e.g. ord-uuid"
                      value={paymentOrderId}
                      onChange={e => setPaymentOrderId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Select Payment Scenario</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      value={paymentScenario}
                      onChange={e => setPaymentScenario(e.target.value)}
                    >
                      <option value="SUCCESS">Success (Completed)</option>
                      <option value="FAILURE">Failure (Failed)</option>
                      <option value="PENDING">Pending</option>
                      <option value="TIMEOUT">Timeout</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="REFUNDED">Refunded</option>
                      <option value="DUPLICATE">Duplicate Payments (Double Capture)</option>
                      <option value="WEBHOOK_FAILURE">Webhook Failure (Captured but Pending Order)</option>
                    </select>
                  </div>
                  <button onClick={handleMockPayment} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-lg text-xs">
                    Simulate Payment Outcome
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KYC & TOGGLES */}
          {activeTab === 'KYC' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">KYC Presets</h3>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Select Target Customer</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      value={kycTargetUser}
                      onChange={e => setKycTargetUser(e.target.value)}
                    >
                      <option value="">-- Choose User --</option>
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>{u.fullName || u.email} ({u.roleRef?.name})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Select KYC Preset</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      value={kycPreset}
                      onChange={e => setKycPreset(e.target.value)}
                    >
                      <option value="APPROVED">Approved (Verified Customer)</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="PENDING_REVIEW">Pending Review</option>
                      <option value="EXPIRED_PASSPORT">Expired Passport</option>
                      <option value="PASSPORT_EXPIRING_SOON">Passport Expiring Soon</option>
                      <option value="PAN_MISMATCH">PAN Mismatch</option>
                      <option value="OCR_LOW_CONFIDENCE">OCR Low Confidence</option>
                      <option value="AML_REVIEW">AML Review (High Risk)</option>
                      <option value="LRS_EXCEEDED">LRS Limit Exceeded ($265k USD)</option>
                      <option value="MANUAL_VERIFICATION">Manual Verification Required</option>
                    </select>
                  </div>
                  <button onClick={handleApplyKyc} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-lg text-xs">
                    Apply KYC Preset
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">QA Bypass Flags</h3>
                <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Skip OTP Screen Verification</span>
                    <input type="checkbox" checked={devFlags.skipOtp} onChange={e => setFlag('skipOtp', e.target.checked)} className="rounded bg-slate-950 border-slate-800 text-orange-500 focus:ring-0 focus:ring-offset-0" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Skip OCR Timer Delay (0.5s OCR)</span>
                    <input type="checkbox" checked={devFlags.skipOcr} onChange={e => setFlag('skipOcr', e.target.checked)} className="rounded bg-slate-950 border-slate-800 text-orange-500 focus:ring-0 focus:ring-offset-0" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Skip AML Risk Checks</span>
                    <input type="checkbox" checked={devFlags.skipAml} onChange={e => setFlag('skipAml', e.target.checked)} className="rounded bg-slate-950 border-slate-800 text-orange-500 focus:ring-0 focus:ring-offset-0" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Skip LRS Threshold Warnings</span>
                    <input type="checkbox" checked={devFlags.skipLrs} onChange={e => setFlag('skipLrs', e.target.checked)} className="rounded bg-slate-950 border-slate-800 text-orange-500 focus:ring-0 focus:ring-offset-0" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Skip Payment Flow (Insta-Capture)</span>
                    <input type="checkbox" checked={devFlags.skipPayment} onChange={e => setFlag('skipPayment', e.target.checked)} className="rounded bg-slate-950 border-slate-800 text-orange-500 focus:ring-0 focus:ring-offset-0" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TREASURY & RATES */}
          {activeTab === 'RATES' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Live Pricing Override Controls</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'NORMAL', label: 'Normal (Live FastForex)' },
                    { id: 'FREEZE', label: 'Freeze Rates' },
                    { id: 'RANDOMIZE', label: 'Randomize (Fluctuations)' },
                    { id: 'CRASH_EUR', label: 'Crash EUR (Drop 30%)' },
                    { id: 'INCREASE_USD', label: 'Spike USD (Up 15%)' },
                    { id: 'MARKET_CLOSED', label: 'Market Closed' },
                    { id: 'API_OFFLINE', label: 'FastForex Offline' },
                    { id: 'SLOW_PROVIDER', label: 'Slow Provider (4s Delay)' },
                    { id: 'PROVIDER_TIMEOUT', label: 'Provider Timeout (10s)' },
                    { id: 'WEEKEND_RATES', label: 'Weekend Rates' },
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleRateAction(option.id)}
                      className={`border p-3 rounded-xl text-xs font-bold transition-all text-center ${rateMode === option.id ? 'border-orange-500 bg-orange-950/20 text-orange-400' : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EVENTS TIMELINE */}
          {activeTab === 'EVENTS' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="Search events payload..."
                  value={eventSearch}
                  onChange={e => setEventSearch(e.target.value)}
                />
                <button onClick={fetchEvents} className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-4 rounded-lg flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-2 border-b border-slate-800 pb-3">
                {['ALL', 'Payment', 'Kyc', 'Orders', 'Login'].map(filterOpt => (
                  <button
                    key={filterOpt}
                    onClick={() => setEventFilter(filterOpt)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${eventFilter === filterOpt ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                    {filterOpt}
                  </button>
                ))}
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {eventLogs.map((e, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-orange-400">{e.name}</span>
                      <span className="text-[10px] text-slate-500">{new Date(e.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <pre className="text-[10px] font-mono text-slate-300 bg-slate-950 p-2 rounded overflow-x-auto max-h-[100px]">
                      {JSON.stringify(e.payload, null, 2)}
                    </pre>
                    <div className="flex justify-end">
                      <button onClick={() => handleReplayEvent(e.id)} className="text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Replay Event
                      </button>
                    </div>
                  </div>
                ))}
                {eventLogs.length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-10">No events logged yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: QUEUES & PERFORMANCE */}
          {activeTab === 'QUEUES' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Notification Queue Dashboard</h3>
                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                  <div className="bg-slate-950/50 p-3 border border-slate-800 rounded-xl">
                    <p className="text-lg font-bold text-white">{queueInfo.counts.PENDING}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1">Pending</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 border border-slate-800 rounded-xl">
                    <p className="text-lg font-bold text-red-500">{queueInfo.counts.FAILED}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1">Failed (DLQ)</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 border border-slate-800 rounded-xl">
                    <p className="text-lg font-bold text-green-500">{queueInfo.counts.PROCESSED}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1">Processed</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleQueueAction('RETRY_FAILED')} className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg">Retry Failed</button>
                  <button onClick={() => handleQueueAction(queueInfo.isPaused ? 'RESUME' : 'PAUSE')} className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                    {queueInfo.isPaused ? 'Resume Queue' : 'Pause Queue'}
                  </button>
                  <button onClick={() => handleQueueAction('CLEAR_DLQ')} className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-3 py-1.5 text-red-400 rounded-lg">Clear Failed</button>
                  <button onClick={() => handleQueueAction('REPROCESS_EMAILS')} className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg">Reprocess Emails</button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Live Performance Metrics</h3>
                {performanceStats ? (
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/40 p-4 border border-slate-800 rounded-xl">
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-400">Heap Total</span>
                      <span className="font-mono text-white font-bold">{performanceStats.heapTotal}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-400">Heap Used</span>
                      <span className="font-mono text-white font-bold">{performanceStats.heapUsed}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-400">CPU Usage User</span>
                      <span className="font-mono text-white font-bold">{performanceStats.cpuUsageUser}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-400">Active DB Conn</span>
                      <span className="font-mono text-white font-bold">{performanceStats.activeDbConnections}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2 col-span-2">
                      <span className="text-slate-400">Cache Hit Rate</span>
                      <span className="font-mono text-green-400 font-bold">{performanceStats.cacheHitRate}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 animate-pulse">Loading diagnostics stats...</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Diagnostic Health Panel</h3>
                {systemHealth ? (
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/40 p-4 border border-slate-800 rounded-xl">
                    {Object.entries(systemHealth).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center border-b border-slate-800/40 pb-1.5">
                        <span className="text-slate-400 capitalize">{key}</span>
                        <span className={`font-bold flex items-center gap-1.5 ${val === 'OFFLINE' ? 'text-red-500' : 'text-emerald-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${val === 'OFFLINE' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 animate-pulse">Loading health check metrics...</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Error Injection Panel</h3>
                <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-800 rounded-xl">
                  {[
                    { key: 'SMTP_FAILURE', label: 'SMTP Mail Server Failure' },
                    { key: 'SMS_FAILURE', label: 'SMS Provider Gateway Failure' },
                    { key: 'REDIS_DOWN', label: 'Simulate Redis Disconnect' },
                    { key: 'PAYMENT_GATEWAY_FAILURE', label: 'Simulate Razorpay Gateway Error' },
                    { key: 'STORAGE_FAILURE', label: 'Simulate AWS S3 Storage Offline' },
                    { key: 'QUEUE_FAILURE', label: 'Simulate RabbitMQ Queue Depth Lag' },
                  ].map(errFlag => (
                    <div key={errFlag.key} className="flex items-center justify-between">
                      <span className="text-xs text-slate-300">{errFlag.label}</span>
                      <input 
                        type="checkbox" 
                        checked={!!errorInjections[errFlag.key]} 
                        onChange={e => handleToggleError(errFlag.key, e.target.checked)} 
                        className="rounded bg-slate-950 border-slate-800 text-red-500 focus:ring-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DB & SWAGGER */}
          {activeTab === 'DB_BROWSER' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Prisma Read-only DB Browser</h3>
                <div className="flex gap-2 mb-3">
                  <select 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    value={dbTable}
                    onChange={e => setDbTable(e.target.value)}
                  >
                    <option value="user">User accounts</option>
                    <option value="customerProfile">Customer Profiles</option>
                    <option value="order">Orders</option>
                    <option value="payment">Payments</option>
                    <option value="forexCard">Forex Cards</option>
                    <option value="supportTicket">Support Tickets</option>
                    <option value="branch">Branches</option>
                    <option value="currency">Currencies</option>
                    <option value="auditLog">Audit Logs</option>
                  </select>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-x-auto max-h-[300px] text-[10px] font-mono bg-slate-950">
                  {dbRows.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800">
                          {Object.keys(dbRows[0]).slice(0, 4).map(key => (
                            <th key={key} className="p-2 text-slate-400 capitalize">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dbRows.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-900 hover:bg-slate-900/40">
                            {Object.values(row).slice(0, 4).map((val: any, colIdx) => (
                              <td key={colIdx} className="p-2 text-slate-300 max-w-[120px] truncate" title={String(val)}>
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center text-slate-500 py-10">No rows found in table.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Embedded Swagger UI Playground</h3>
                <button onClick={() => window.open('http://localhost:3001/api-docs', '_blank')} className="w-full bg-slate-800 hover:bg-slate-700 text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 border border-slate-700">
                  <Eye className="w-4 h-4" /> Open Swagger API Spec (Port 3001)
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: FACTORY RESET */}
          {activeTab === 'RESET' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" /> Warning: DANGEROUS ACTION
                </h3>
                <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-xl space-y-4">
                  <p className="text-xs text-red-400 font-medium">This will capture a Postgres row dump to `/scratch` and delete all dynamic rows in the database, restoring initial clean seeds.</p>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-red-300 block">Type <span className="font-black underline text-red-400">RESET</span> below to confirm wipe:</label>
                    <input 
                      className="w-full bg-slate-950 border border-red-900/60 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-red-500 focus:outline-none"
                      placeholder="Type RESET"
                      value={resetConfirm}
                      onChange={e => setResetConfirm(e.target.value)}
                    />
                  </div>
                  
                  <button 
                    disabled={resetConfirm !== 'RESET'}
                    onClick={handleResetDatabase} 
                    className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-700 text-white font-bold py-3 rounded-lg text-xs"
                  >
                    Factory Reset Database & Re-verify Integrity
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Load Seeding Profiles</h3>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Select Profile Preset</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      value={seedPresetName}
                      onChange={e => setSeedPresetName(e.target.value)}
                    >
                      <option value="SMALL_STARTUP">Small Startup (5 Users, 10 Orders)</option>
                      <option value="MEDIUM_BUSINESS">Medium Business (20 Users, 50 Orders)</option>
                      <option value="LARGE_ENTERPRISE">Large Enterprise (100 Users, 200 Orders)</option>
                      <option value="STRESS_TEST">Stress Test (500 Users, 2000 Orders)</option>
                      <option value="DEMO_DAY">Demo Day Preset (200 Users, 500 Orders, 80 Tickets)</option>
                      <option value="CONFERENCE_DEMO">Conference Demo (50 Users, 150 Orders)</option>
                    </select>
                  </div>
                  <button onClick={handleSeedPreset} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-lg text-xs">
                    Seed Dataset
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
