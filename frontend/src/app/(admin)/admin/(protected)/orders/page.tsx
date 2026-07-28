"use client";
import React, { useState, useEffect } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { FileSpreadsheet, Search, Eye, Filter, ShieldCheck, MapPin, Building2, Clock, CheckCircle } from 'lucide-react';

export default function OrderMonitorPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/orders`).then(apiJson);
      setOrders(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.profile?.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      o.branch?.branchName?.toLowerCase().includes(search.toLowerCase()) ||
      o.branch?.branchCity?.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'PENDING_COMPLIANCE') return matchesSearch && o.complianceStatus === 'PENDING';
    if (statusFilter === 'BRANCH_EXECUTION') return matchesSearch && o.currentStage === 'FULFILLMENT_STAGE';
    if (statusFilter === 'COMPLETED') return matchesSearch && o.status === 'COMPLETED';
    if (statusFilter === 'CANCELLED') return matchesSearch && (o.status === 'CANCELLED' || o.status === 'REJECTED');
    return matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
              Headquarters ERP
            </span>
            <span className="text-slate-400 text-xs font-semibold">📊 Order Governance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Enterprise Order Monitor</h1>
          <p className="text-xs text-slate-500 font-medium">
            Read-only organizational oversight across all city branches, stages, compliance checks, and delivery dispatch.
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span>🔄</span> Refresh Orders
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, order #, branch, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'PENDING_COMPLIANCE', label: 'Compliance Pending' },
            { id: 'BRANCH_EXECUTION', label: 'Branch Execution' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-indigo-600" /> Live Order Monitor ({filteredOrders.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="p-3">Order Ref</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Product / Currency</th>
                <th className="p-3">Branch & City</th>
                <th className="p-3">Current Stage</th>
                <th className="p-3">Compliance</th>
                <th className="p-3">INR Total</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">Loading order monitor data...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400 italic">No orders found matching search criteria.</td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-700">#{o.orderNumber}</td>
                    <td className="p-3 font-bold text-slate-900">
                      {o.profile?.user?.fullName || 'Valued Customer'}
                      <span className="text-[10px] text-slate-400 block font-normal">{o.profile?.user?.mobile || o.profile?.user?.email}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] px-2 py-0.5 rounded border border-indigo-100">
                        {o.productType}
                      </span>
                      <span className="text-slate-700 font-mono font-bold text-xs block mt-0.5">
                        {o.items?.[0]?.amount} {o.items?.[0]?.currency?.code}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      {o.branch?.branchName || 'Branch'}
                      <span className="text-[10px] text-slate-400 font-normal block">{o.branch?.branchCity}</span>
                    </td>
                    <td className="p-3 font-bold">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px]">
                        {o.currentStage}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        o.complianceStatus === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : o.complianceStatus === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {o.complianceStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-black text-emerald-600 text-sm">
                      ₹{Number(o.totalAmountInr).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Modal (Read-Only) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg p-6 space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Order Audit Details</h3>
                <p className="text-xs text-slate-400 font-mono">#{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2 font-semibold">
              <div className="flex justify-between text-slate-600">
                <span>Customer:</span>
                <strong className="text-slate-900">{selectedOrder.profile?.user?.fullName}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fulfillment Branch:</span>
                <strong className="text-indigo-600">{selectedOrder.branch?.branchName} ({selectedOrder.branch?.branchCity})</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fulfillment Type:</span>
                <strong className="text-slate-900">{selectedOrder.deliveryMethod}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Compliance Lock Status:</span>
                <strong className={selectedOrder.complianceLocked ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                  {selectedOrder.complianceLocked ? "🔒 Locked (Transferred to Branch)" : "⏳ In Progress"}
                </strong>
              </div>
            </div>

            {selectedOrder.cashAllocation?.items && (
              <div className="bg-slate-900 text-white p-3 rounded-xl space-y-1 text-xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Branch Manager Allocated Bills</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedOrder.cashAllocation.items.map((it: any, idx: number) => (
                    <span key={idx} className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono text-[11px]">
                      {it.denomination} x {it.quantity} ({it.currencyCode || 'FX'})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl cursor-pointer"
            >
              Close Inspection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
