"use client";
import React, { useState, useEffect } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { ArrowLeftRight, Plus, CheckCircle, Clock, Building2, Search, AlertCircle } from 'lucide-react';

export default function VaultTransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Form State
  const [sourceBranchId, setSourceBranchId] = useState('');
  const [destBranchId, setDestBranchId] = useState('');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, bRes] = await Promise.all([
        authFetch(`${API_URL}/admin/vault-transfers`).then(apiJson),
        authFetch(`${API_URL}/admin/branches`).then(apiJson),
      ]);
      setTransfers(tRes || []);
      setBranches(bRes || []);
    } catch (err: any) {
      console.error('Failed to load vault transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = async () => {
    if (!sourceBranchId || !destBranchId || !quantity || !reason.trim()) return;
    if (sourceBranchId === destBranchId) {
      setErrorMsg('Source and Destination branches cannot be the same.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    try {
      await authFetch(`${API_URL}/admin/vault-transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceBranchId,
          destBranchId,
          currencyCode,
          quantity: parseFloat(quantity),
          reason: reason.trim(),
        }),
      }).then(apiJson);

      setShowTransferModal(false);
      setSourceBranchId('');
      setDestBranchId('');
      setQuantity('');
      setReason('');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to execute vault transfer');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
              Treasury ERP
            </span>
            <span className="text-slate-400 text-xs font-semibold">🔄 Inter-Branch Vault Transfers</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Inter-Branch Vault Transfers</h1>
          <p className="text-xs text-slate-500 font-medium">
            Transfer physical currency inventory between branch vaults with automated audit logging and stock reconciliation.
          </p>
        </div>
        <button
          onClick={() => {
            setShowTransferModal(true);
            setErrorMsg('');
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} /> Initiate Vault Transfer
        </button>
      </div>

      {/* Transfers History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <ArrowLeftRight size={18} className="text-indigo-600" /> Vault Transfer Audit History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="p-3">Transfer Ref</th>
                <th className="p-3">Source Branch</th>
                <th className="p-3">Destination Branch</th>
                <th className="p-3">Currency</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">Loading transfer history...</td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400 italic">No vault transfers recorded yet.</td>
                </tr>
              ) : (
                transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-700">{t.transferNumber}</td>
                    <td className="p-3 font-bold text-slate-900">
                      {t.sourceBranch?.branchName || 'Source'} ({t.sourceBranch?.branchCity})
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {t.destBranch?.branchName || 'Destination'} ({t.destBranch?.branchCity})
                    </td>
                    <td className="p-3 font-bold text-slate-800">{t.currencyCode}</td>
                    <td className="p-3 font-mono font-black text-emerald-600 text-sm">
                      {Number(t.quantity).toLocaleString()} {t.currencyCode}
                    </td>
                    <td className="p-3 text-slate-600">{t.reason}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Initiate Vault Transfer */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>🔄</span> Inter-Branch Vault Transfer
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">Source Branch (Debited)</label>
                <select
                  value={sourceBranchId}
                  onChange={(e) => setSourceBranchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                >
                  <option value="">-- Select Source Branch --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branchName} ({b.branchCode}) - {b.branchCity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">Destination Branch (Credited)</label>
                <select
                  value={destBranchId}
                  onChange={(e) => setDestBranchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                >
                  <option value="">-- Select Destination Branch --</option>
                  {branches
                    .filter((b) => b.id !== sourceBranchId)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.branchName} ({b.branchCode}) - {b.branchCity}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 uppercase block mb-1">Currency</label>
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (AED)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="SGD">SGD ($)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 uppercase block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 5000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">Mandatory Transfer Reason</label>
                <textarea
                  placeholder="e.g. Rebalancing liquidity for high demand in CP branch."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-xs outline-indigo-500 h-20"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreateTransfer}
                disabled={actionLoading || !sourceBranchId || !destBranchId || !quantity || !reason.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-10 rounded-xl shadow-md cursor-pointer"
              >
                {actionLoading ? 'Transferring...' : '🔒 Approve & Transfer Stock'}
              </button>
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
