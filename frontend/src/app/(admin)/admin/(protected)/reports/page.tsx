"use client";
import React, { useState, useEffect } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { BarChart3, Download, TrendingUp, Building2, MapPin, Users, FileSpreadsheet, ShieldCheck } from 'lucide-react';

export default function ReportingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/executive-metrics`).then(apiJson);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = (filename: string, rows: any[]) => {
    if (!rows || rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [keys.join(','), ...rows.map((r) => keys.map((k) => `"${r[k] ?? ''}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const branchHealth = data?.branchHealth || [];
  const overview = data?.overview || {};

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
              Headquarters Analytics
            </span>
            <span className="text-slate-400 text-xs font-semibold">📈 Executive Reporting</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Executive Reports & Data Export</h1>
          <p className="text-xs text-slate-500 font-medium">
            Generate and export branch performance, city growth, liquidity status, and operational SLA reports.
          </p>
        </div>
      </div>

      {/* Reports Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Branch Performance Report</h3>
          </div>
          <p className="text-xs text-slate-500">Includes stock level, order count, manager, and branch health status.</p>
          <button
            onClick={() => exportCSV('branch_performance_report', branchHealth)}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={14} /> Export Branch Report (CSV)
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Executive Financial Overview</h3>
          </div>
          <p className="text-xs text-slate-500">Includes today's revenue, month revenue, active cities, and branch count.</p>
          <button
            onClick={() => exportCSV('executive_financial_overview', [overview])}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={14} /> Export Revenue Summary (CSV)
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-cyan-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Audit Trail Log Export</h3>
          </div>
          <p className="text-xs text-slate-500">Exports all recent administrative, branch assignment, and inventory logs.</p>
          <button
            onClick={() => exportCSV('audit_trail_logs', data?.recentLogs || [])}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={14} /> Export Audit Trail (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}
