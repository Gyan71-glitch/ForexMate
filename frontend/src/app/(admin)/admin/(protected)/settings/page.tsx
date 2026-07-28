"use client";
import React, { useState, useEffect } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { Settings, Shield, Clock, Lock, Save, CheckCircle } from 'lucide-react';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<{ [key: string]: string }>({
    WORKING_HOURS: '09:00 AM - 06:00 PM',
    OTP_EXPIRY_MINUTES: '10',
    BRANCH_REASSIGNMENT_ENABLED: 'true',
    MAX_AML_SCORE: '80',
    MAX_LRS_USD: '250000',
    DELIVERY_RADIUS_KM: '25',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const list = await authFetch(`${API_URL}/admin/settings`).then(apiJson);
      if (Array.isArray(list) && list.length > 0) {
        const map: { [key: string]: string } = {};
        list.forEach((item: any) => {
          map[item.key] = item.value;
        });
        setSettings((prev) => ({ ...prev, ...map }));
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (key: string, value: string, category: string = 'GENERAL') => {
    setSaving(true);
    setMsg('');
    try {
      await authFetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, category }),
      }).then(apiJson);
      setMsg(`Setting '${key}' saved successfully!`);
    } catch (err: any) {
      setMsg(err.message || 'Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
              Headquarters Control
            </span>
            <span className="text-slate-400 text-xs font-semibold">⚙️ System Configuration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">System Configuration & Security RBAC</h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure global operational parameters, compliance limits, OTP expiries, and Role-Based Access Control matrix.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle size={16} /> {msg}
        </div>
      )}

      {/* System Configurations Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <Settings size={18} className="text-indigo-600" /> Operational Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] text-slate-600 uppercase block">Working Hours</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.WORKING_HOURS}
                onChange={(e) => setSettings({ ...settings, WORKING_HOURS: e.target.value })}
                className="flex-1 bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
              />
              <button
                onClick={() => handleSaveSetting('WORKING_HOURS', settings.WORKING_HOURS, 'GENERAL')}
                className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Save size={14} /> Save
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] text-slate-600 uppercase block">OTP Expiry (Minutes)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={settings.OTP_EXPIRY_MINUTES}
                onChange={(e) => setSettings({ ...settings, OTP_EXPIRY_MINUTES: e.target.value })}
                className="flex-1 bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
              />
              <button
                onClick={() => handleSaveSetting('OTP_EXPIRY_MINUTES', settings.OTP_EXPIRY_MINUTES, 'SECURITY')}
                className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Save size={14} /> Save
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] text-slate-600 uppercase block">Maximum LRS Threshold (USD)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={settings.MAX_LRS_USD}
                onChange={(e) => setSettings({ ...settings, MAX_LRS_USD: e.target.value })}
                className="flex-1 bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
              />
              <button
                onClick={() => handleSaveSetting('MAX_LRS_USD', settings.MAX_LRS_USD, 'COMPLIANCE')}
                className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Save size={14} /> Save
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] text-slate-600 uppercase block">Same-City Reassignment Toggle</label>
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-300">
              <span className="text-slate-800">Enable Branch Reassignment</span>
              <button
                onClick={() => {
                  const newVal = settings.BRANCH_REASSIGNMENT_ENABLED === 'true' ? 'false' : 'true';
                  setSettings({ ...settings, BRANCH_REASSIGNMENT_ENABLED: newVal });
                  handleSaveSetting('BRANCH_REASSIGNMENT_ENABLED', newVal, 'WORKFLOW');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase cursor-pointer ${
                  settings.BRANCH_REASSIGNMENT_ENABLED === 'true'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {settings.BRANCH_REASSIGNMENT_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security RBAC Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield size={18} className="text-indigo-600" /> Role-Based Access Control (RBAC) Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="p-3">Role</th>
                <th className="p-3">KYC/AML Verification</th>
                <th className="p-3">Branch Selection</th>
                <th className="p-3">Vault Allocation</th>
                <th className="p-3">Delivery Dispatch</th>
                <th className="p-3">ERP Configuration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="p-3 font-extrabold text-indigo-700">Super Admin</td>
                <td className="p-3 text-slate-400">Read-Only</td>
                <td className="p-3 text-slate-400">Read-Only</td>
                <td className="p-3 text-slate-400">Read-Only</td>
                <td className="p-3 text-slate-400">Read-Only</td>
                <td className="p-3 font-bold text-emerald-600">Full Control ✅</td>
              </tr>
              <tr>
                <td className="p-3 font-extrabold text-slate-900">Central Operations Staff</td>
                <td className="p-3 font-bold text-emerald-600">Full Control ✅</td>
                <td className="p-3 font-bold text-emerald-600">Full Control ✅</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
              </tr>
              <tr>
                <td className="p-3 font-extrabold text-slate-900">Branch Manager</td>
                <td className="p-3 text-slate-400">Read-Only (Locked)</td>
                <td className="p-3 text-slate-400">Read-Only</td>
                <td className="p-3 font-bold text-emerald-600">Full Control ✅</td>
                <td className="p-3 font-bold text-emerald-600">Full Control ✅</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
              </tr>
              <tr>
                <td className="p-3 font-extrabold text-slate-900">Delivery Partner</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
                <td className="p-3 font-bold text-emerald-600">Execute Delivery ✅</td>
                <td className="p-3 text-rose-500 font-bold">Forbidden ❌</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
