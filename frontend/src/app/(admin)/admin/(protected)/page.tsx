"use client";
import React, { useEffect, useState } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import {
  TrendingUp,
  Package,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default function AdminExecutiveDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/executive-metrics`).then(apiJson);
      setData(res);
    } catch (err) {
      console.error('Failed to load executive metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const overview = data?.overview || {};
  const branchHealth = data?.branchHealth || [];
  const recentLogs = data?.recentLogs || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
              Super Admin ERP
            </span>
            <span className="text-slate-400 text-xs font-semibold">📍 Headquarters Control Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Executive Control Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time organizational performance, city health, and branch vault metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadMetrics}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2"
          >
            <span>🔄</span> Refresh Data
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Today's Orders</span>
            <Clock size={16} className="text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{loading ? '...' : overview.ordersToday || 0}</p>
          <p className="text-[11px] text-slate-400 font-semibold">{overview.ordersMonth || 0} orders this month</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Compliance</span>
            <ShieldCheck size={16} className="text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600">{loading ? '...' : overview.pendingCompliance || 0}</p>
          <p className="text-[11px] text-slate-400 font-semibold">Central Ops queue</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Branch Execution</span>
            <Building2 size={16} className="text-cyan-600" />
          </div>
          <p className="text-3xl font-black text-cyan-700">{loading ? '...' : overview.pendingBranchExecution || 0}</p>
          <p className="text-[11px] text-slate-400 font-semibold">Vault allocation & handover</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Today's Revenue</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono">
            {loading ? '...' : `₹${Number(overview.revenueToday || 0).toLocaleString('en-IN')}`}
          </p>
          <p className="text-[11px] text-slate-400 font-semibold">Month: ₹{Number(overview.revenueMonth || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Network Scale Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-extrabold uppercase">Cities Active</span>
            <MapPin size={16} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-black">{loading ? '...' : overview.citiesCount || 0}</p>
          <p className="text-[11px] text-slate-400">Supported fulfillment regions</p>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-extrabold uppercase">Branches Active</span>
            <Building2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black">{loading ? '...' : overview.branchesCount || 0}</p>
          <p className="text-[11px] text-slate-400">Main, Hub & Satellite vaults</p>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-extrabold uppercase">Employees</span>
            <Users size={16} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-black">{loading ? '...' : overview.employeesCount || 0}</p>
          <p className="text-[11px] text-slate-400">Ops, Managers & Delivery Partners</p>
        </div>
      </div>

      {/* Branch Vault Health Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Package size={18} className="text-indigo-600" /> Branch Vault Stock & Health Matrix
            </h3>
            <p className="text-xs text-slate-500">Live vault stock overview across all branches</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="p-3">Branch Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">City</th>
                <th className="p-3">Assigned Manager</th>
                <th className="p-3">Total Vault Stock</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {branchHealth.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400 italic">No branch health data available.</td>
                </tr>
              ) : (
                branchHealth.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      {b.name} <span className="text-[10px] text-slate-400 font-mono font-normal">({b.code})</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700">
                        {b.branchType}
                      </span>
                    </td>
                    <td className="p-3">{b.city}</td>
                    <td className="p-3 font-bold text-indigo-600">{b.manager}</td>
                    <td className="p-3 font-mono font-bold">₹{Number(b.totalStock).toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        b.health === 'LOW_STOCK'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {b.health === 'LOW_STOCK' ? '⚠️ LOW STOCK' : '✅ OPTIMAL'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Activity & Audit Trail Alerts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <FileSpreadsheet size={18} className="text-indigo-600" /> Recent Headquarters Audit Logs
        </h3>
        <div className="space-y-2">
          {recentLogs.map((log: any) => (
            <div key={log.id} className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
              <div>
                <span className="font-black text-indigo-700 uppercase tracking-wider text-[10px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 mr-2">
                  {log.action}
                </span>
                <span className="text-slate-800">{log.entityName} #{log.entityId}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
