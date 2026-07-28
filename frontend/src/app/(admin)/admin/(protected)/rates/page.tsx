"use client";

import { useEffect, useState } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Edit2, RefreshCw, X, Check, DollarSign, Settings2, Power } from 'lucide-react';
import { toast } from 'sonner';

const getFlag = (code: string) => {
  const flags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    AED: '🇦🇪',
    AUD: '🇦🇺',
    SGD: '🇸🇬',
    JPY: '🇯🇵',
    CHF: '🇨🇭',
    INR: '🇮🇳'
  };
  return flags[code] || '🏳️';
};

const getCurrencyName = (code: string) => {
  const names: Record<string, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    AED: 'UAE Dirham',
    AUD: 'Australian Dollar',
    SGD: 'Singapore Dollar',
    JPY: 'Japanese Yen',
    CHF: 'Swiss Franc',
    INR: 'Indian Rupee'
  };
  return names[code] || code;
};

export default function AdminRates() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Edit form states
  const [editingRate, setEditingRate] = useState<any | null>(null);
  const [inrRate, setInrRate] = useState<string>('');
  const [buyMargin, setBuyMargin] = useState<string>('');
  const [sellMargin, setSellMargin] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRates();
    fetchProducts();

    const handleSync = () => {
      console.log('[Sync Hook] Refreshing admin rates list due to sync event');
      fetchRates();
      fetchProducts();
    };

    window.addEventListener('forexmate-sync', handleSync);
    return () => {
      window.removeEventListener('forexmate-sync', handleSync);
    };
  }, []);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const data = await authFetch(`${API_URL}/rates/products`).then(apiJson);
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const toggleProduct = async (id: string, currentStatus: boolean) => {
    try {
      const res = await authFetch(`${API_URL}/rates/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || 'Failed to update product status');
      } else {
        toast.success('Product status updated successfully.');
        fetchProducts();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update product status');
    }
  };

  const fetchRates = async () => {
    try {
      const data = await authFetch(`${API_URL}/rates`).then(apiJson);
      // Filter out base currency (INR) from editable exchange rate list to prevent confusion
      const sorted = (data || []).sort((a: any, b: any) => {
        if (a.currency?.code === 'USD') return -1;
        if (b.currency?.code === 'USD') return 1;
        return a.currency?.code.localeCompare(b.currency?.code);
      });
      setRates(sorted);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch live exchange rates');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (rate: any) => {
    setEditingRate(rate);
    setInrRate(rate.inrRate.toString());
    setBuyMargin((rate.marginBuyPct * 100).toString());
    setSellMargin((rate.marginSellPct * 100).toString());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    setSaving(true);
    try {
      const res = await authFetch(`${API_URL}/rates/${editingRate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inrRate: parseFloat(inrRate),
          marginBuyPct: parseFloat(buyMargin) / 100,
          marginSellPct: parseFloat(sellMargin) / 100,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || 'Failed to save rate updates');
      } else {
        setEditingRate(null);
        fetchRates();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save rate updates');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('forexmate_token');
    localStorage.removeItem('forexmate_user');
    window.location.href = '/login';
  };

  return (
    <div className="p-10 w-full min-h-full space-y-8 bg-slate-50/50">
      <header className="flex justify-between items-center border-b border-gray-150 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-emerald-600" />
            Live Currency Pricing Engine
          </h2>
          <p className="text-sm text-gray-500 mt-1">Configure dynamic transaction exchange rates, manage buy/sell retail margins, and update database live quotes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRates}
            disabled={loading}
            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all shadow-sm border border-indigo-100 flex items-center justify-center"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-750 font-bold rounded-xl text-sm transition-all shadow-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-800 max-w-lg mx-auto">
          <div>
            <h4 className="font-bold text-sm">Failed to Load Exchange Rates</h4>
            <p className="text-xs text-red-650 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wider">Dynamic Exchange Rates Grid</h3>
          <Badge className="px-3 py-1 font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
            {rates.length} Currencies
          </Badge>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-150">
              <th className="px-6 py-4">Currency</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Interbank Rate</th>
              <th className="px-6 py-4 text-emerald-700">Buy Margin</th>
              <th className="px-6 py-4 text-blue-700">Sell Margin</th>
              <th className="px-6 py-4 text-emerald-700">Customer Buy Rate (Bank Sell)</th>
              <th className="px-6 py-4 text-blue-700">Customer Sell Rate (Bank Buy)</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                  Fetching live rates from Pricing Engine...
                </td>
              </tr>
            ) : rates.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                  No active exchange rates loaded in the system database.
                </td>
              </tr>
            ) : (
              rates.map((rate: any) => {
                const buyRate = rate.inrRate * (1 - rate.marginBuyPct);
                const sellRate = rate.inrRate * (1 + rate.marginSellPct);
                const isBase = rate.currency?.code === 'INR';

                return (
                  <tr key={rate.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-black text-sm text-indigo-600">
                      {getFlag(rate.currency?.code)} {rate.currency?.code}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm font-semibold">
                      {getCurrencyName(rate.currency?.code)}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-sm text-gray-900">
                      ₹{Number(rate.inrRate).toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-emerald-700 font-mono font-bold text-sm">
                      {(rate.marginBuyPct * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-blue-700 font-mono font-bold text-sm">
                      {(rate.marginSellPct * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 font-mono font-black text-sm text-emerald-700">
                      ₹{buyRate.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 font-mono font-black text-sm text-blue-700">
                      ₹{sellRate.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isBase && (
                        <button
                          onClick={() => handleEditClick(rate)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-bold rounded-lg text-xs transition-all border border-indigo-100 inline-flex items-center gap-1"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Product Rules & Gating Control Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wider">Product Catalog & Rules Engine</h3>
          </div>
          <Badge className="px-3 py-1 font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
            {products.length} Products Configured
          </Badge>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productsLoading ? (
              <div className="col-span-2 text-center py-6 text-gray-500 font-semibold text-xs">
                Fetching Forex products catalog...
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-2 text-center py-6 text-gray-500 font-semibold text-xs">
                No products found.
              </div>
            ) : (
              products.map((prod) => {
                const isSell = prod.code === 'CASH_SELL';
                return (
                  <div 
                    key={prod.id} 
                    className={`border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-sm ${
                      prod.isActive 
                        ? (isSell ? 'border-emerald-250 bg-emerald-50/10' : 'border-blue-250 bg-blue-50/10') 
                        : 'border-slate-200 bg-slate-50/30 grayscale opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-extrabold text-gray-900 text-sm">{prod.name}</h4>
                        <Badge className={`font-black uppercase text-[9px] ${
                          prod.isActive 
                            ? (isSell ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-100 text-blue-800 border-blue-200') 
                            : 'bg-slate-150 text-slate-500'
                        }`}>
                          {prod.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400 font-bold font-mono">CODE: {prod.code}</div>
                      <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed">
                        {isSell 
                          ? 'Enables left-over foreign exchange encashment, KYC submission gating, home collection/branch visit fulfillment, and dealer assignments.' 
                          : 'Enables retail foreign exchange notes acquisition, multi-currency card purchase, home delivery/store pickup fulfillment, and cash reserves.'
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-2 border-t pt-3">
                      <button
                        onClick={() => toggleProduct(prod.id, prod.isActive)}
                        className={`w-full font-extrabold text-xs rounded-lg h-8 flex items-center justify-center gap-1.5 transition-colors ${
                          prod.isActive
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100'
                        }`}
                      >
                        <Power size={12} />
                        {prod.isActive ? 'Disable Product' : 'Enable Product'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Rates Glassmorphic Slideover/Modal Overlay */}
      {editingRate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
            <header className="px-6 py-5 border-b border-gray-150 flex justify-between items-center bg-slate-55/10">
              <div>
                <h4 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                  Update {editingRate.currency?.code} Exchange Quote
                </h4>
                <p className="text-xs text-gray-400 font-medium">Manually override margin configurations and quotes.</p>
              </div>
              <button
                onClick={() => setEditingRate(null)}
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interbank Rate (INR)</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={inrRate}
                  onChange={(e) => setInrRate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-1 focus:ring-indigo-500 text-gray-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider text-emerald-700">Buy Margin (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={buyMargin}
                    onChange={(e) => setBuyMargin(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-1 focus:ring-indigo-500 text-gray-900 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider text-blue-700">Sell Margin (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sellMargin}
                    onChange={(e) => setSellMargin(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-1 focus:ring-indigo-500 text-gray-900 font-bold"
                  />
                </div>
              </div>

              <footer className="pt-4 border-t border-gray-150 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRate(null)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-gray-650 font-bold rounded-xl text-sm transition-all border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-750 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5"
                >
                  {saving ? 'Saving...' : <><Check size={16} /> Save Changes</>}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
