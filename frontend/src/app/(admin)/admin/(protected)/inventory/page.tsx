"use client";
import React, { useState, useEffect } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { Package, Building2, MapPin, Search, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export default function EnterpriseInventoryPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'branch' | 'city'>('branch');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        authFetch(`${API_URL}/admin/branches`).then(apiJson),
        authFetch(`${API_URL}/admin/cities`).then(apiJson),
      ]);
      setBranches(bRes || []);
      setCities(cRes || []);
      if (bRes && bRes.length > 0) {
        setSelectedBranchId(bRes[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const branchInventory = selectedBranch?.branchInventory || [];

  // Consolidate City Inventory Stock
  const cityStockMap: { [city: string]: { [currency: string]: { available: number; reserved: number; total: number } } } = {};

  branches.forEach((b) => {
    const city = b.branchCity || b.city?.name || 'Unassigned';
    if (!cityStockMap[city]) {
      cityStockMap[city] = {};
    }

    (b.branchInventory || []).forEach((inv: any) => {
      const code = inv.currencyCode || 'USD';
      if (!cityStockMap[city][code]) {
        cityStockMap[city][code] = { available: 0, reserved: 0, total: 0 };
      }
      const avail = Number(inv.availableAmount || 0);
      const res = Number(inv.reservedAmount || 0);
      cityStockMap[city][code].available += avail;
      cityStockMap[city][code].reserved += res;
      cityStockMap[city][code].total += avail + res;
    });
  });

  const currencyFlags: any = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    AED: '🇦🇪',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
    SGD: '🇸🇬',
    JPY: '🇯🇵',
    CHF: '🇨🇭',
    THB: '🇹🇭',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
              Enterprise Treasury
            </span>
            <span className="text-slate-400 text-xs font-semibold">📦 Stock Controls</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Enterprise Inventory & City Stock</h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor real-time physical vault stock, reserved currency notes, and consolidated city-level liquidity.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} /> Refresh Stock
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('branch')}
          className={`px-4 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'branch'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 size={16} /> Branch Vault Stock
        </button>
        <button
          onClick={() => setActiveTab('city')}
          className={`px-4 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'city'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <MapPin size={16} /> City Inventory Dashboard
        </button>
      </div>

      {/* BRANCH VAULT TAB */}
      {activeTab === 'branch' && (
        <div className="space-y-6">
          {/* Branch Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-extrabold text-slate-700 uppercase">Select Branch Vault:</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500 text-slate-900"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchName} ({b.branchCode}) - {b.branchCity}
                  </option>
                ))}
              </select>
            </div>
            {selectedBranch && (
              <div className="text-xs font-semibold text-slate-600 flex items-center gap-4">
                <span>Manager: <strong className="text-indigo-600 font-bold">{selectedBranch.manager?.name || 'Unassigned'}</strong></span>
                <span>Type: <strong className="text-slate-900">{selectedBranch.branchType}</strong></span>
              </div>
            )}
          </div>

          {/* Branch Inventory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                Physical Vault Currency Stock — {selectedBranch?.branchName || 'Branch'}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="p-3">Currency</th>
                    <th className="p-3">Available Stock</th>
                    <th className="p-3">Reserved Stock</th>
                    <th className="p-3">Alert Threshold</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">Loading branch vault stock...</td>
                    </tr>
                  ) : branchInventory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 italic">No currency stock recorded in this branch vault.</td>
                    </tr>
                  ) : (
                    branchInventory.map((inv: any) => {
                      const avail = Number(inv.availableAmount || 0);
                      const reserved = Number(inv.reservedAmount || 0);
                      const alertLimit = 5000;
                      const status = avail < alertLimit ? (avail < alertLimit / 2 ? 'CRITICAL' : 'LOW') : 'OPTIMAL';
                      const code = inv.currencyCode || 'USD';

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-bold text-slate-900 text-sm">
                            <span className="mr-2 text-lg">{currencyFlags[code] || '🏳'}</span>
                            {code}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-600 text-sm">
                            {avail.toLocaleString()} {code}
                          </td>
                          <td className="p-3 font-mono font-semibold text-amber-600">
                            {reserved.toLocaleString()} {code}
                          </td>
                          <td className="p-3 text-slate-400 font-mono">{alertLimit.toLocaleString()} {code}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              status === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : status === 'LOW'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CITY INVENTORY TAB */}
      {activeTab === 'city' && (
        <div className="space-y-6">
          <div className="bg-indigo-950 text-white p-5 rounded-2xl space-y-1">
            <h2 className="text-base font-black text-indigo-200">
              City Currency Consolidation Dashboard
            </h2>
            <p className="text-xs text-slate-400">
              Consolidated liquidity overview across all branches per city. Central Operations uses this view to determine branch assignment and load balancing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(cityStockMap).length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs font-bold bg-white rounded-2xl border border-slate-200">
                No city inventory data recorded.
              </div>
            ) : (
              Object.entries(cityStockMap).map(([cityName, currencies]) => (
                <div key={cityName} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                      <MapPin size={18} className="text-indigo-600" /> {cityName} Region
                    </h3>
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-indigo-100">
                      City Stock
                    </span>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(currencies).map(([currCode, stock]) => (
                      <div key={currCode} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <span className="text-base">{currencyFlags[currCode] || '🏳'}</span>
                          <span>{currCode}</span>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Available</span>
                            <span className="font-mono font-bold text-emerald-600 text-sm">
                              {stock.available.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Reserved</span>
                            <span className="font-mono font-bold text-amber-600 text-xs">
                              {stock.reserved.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
