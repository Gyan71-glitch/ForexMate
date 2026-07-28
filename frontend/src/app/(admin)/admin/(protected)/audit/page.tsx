"use client";
import React, { useState, useEffect } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { ShieldAlert, Search, RefreshCw, Clock, User, Eye } from 'lucide-react';

export default function AuditCenterPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/audit-logs`).then(apiJson);
      setLogs(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.entityName?.toLowerCase().includes(search.toLowerCase()) ||
      l.entityId?.toLowerCase().includes(search.toLowerCase()) ||
      l.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
              Headquarters Security
            </span>
            <span className="text-slate-400 text-xs font-semibold">🛡️ System Audit Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Audit Center & Traceability Logs</h1>
          <p className="text-xs text-slate-500 font-medium">
            Immutable audit logging tracking user actions, branch reassignments, manager changes, vault transfers, and status updates.
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, entity, user, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-indigo-500"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Showing <strong className="text-slate-900 font-black">{filteredLogs.length}</strong> Audit Logs
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">User / Actor</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">Loading audit logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 italic">No matching audit logs found.</td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold">
                      <span className="bg-indigo-50 text-indigo-700 font-black text-[10px] px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-wider">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {l.entityName} <span className="text-slate-400 font-normal">#{l.entityId}</span>
                    </td>
                    <td className="p-3 font-bold text-slate-700">
                      {l.user?.fullName || 'System Admin'}
                      <span className="text-[10px] text-slate-400 font-normal block">{l.user?.email || 'HQ System'}</span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedLog(l)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} /> View Diff
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Diff Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg p-6 space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Audit Log Trace</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedLog.action}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Previous State (Old)</span>
                <pre className="mt-1 text-[11px] font-mono text-rose-700 whitespace-pre-wrap overflow-x-auto">
                  {selectedLog.oldData ? JSON.stringify(selectedLog.oldData, null, 2) : 'None / Empty'}
                </pre>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">New State (Applied)</span>
                <pre className="mt-1 text-[11px] font-mono text-emerald-700 whitespace-pre-wrap overflow-x-auto">
                  {selectedLog.newData ? JSON.stringify(selectedLog.newData, null, 2) : 'None / Empty'}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl cursor-pointer"
            >
              Close Log Inspection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
