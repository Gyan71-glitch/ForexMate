"use client";
import React, { useState, useEffect } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { MapPin, Plus, Edit2, Trash2, CheckCircle, AlertCircle, Building2, Search } from 'lucide-react';

export default function CityManagementPage() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCity, setEditCity] = useState<any>(null);
  const [cityName, setCityName] = useState('');
  const [cityState, setCityState] = useState('');
  const [cityCountry, setCityCountry] = useState('India');
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    setLoading(true);
    try {
      const data = await authFetch(`${API_URL}/admin/cities`).then(apiJson);
      setCities(data || []);
    } catch (err: any) {
      console.error('Failed to load cities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCity = async () => {
    if (!cityName.trim() || !cityState.trim()) return;
    setActionLoading(true);
    setErrorMsg('');
    try {
      await authFetch(`${API_URL}/admin/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cityName.trim(), state: cityState.trim(), country: cityCountry }),
      }).then(apiJson);
      setShowCreateModal(false);
      setCityName('');
      setCityState('');
      loadCities();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create city');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await authFetch(`${API_URL}/admin/cities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).then(apiJson);
      loadCities();
    } catch (err: any) {
      alert(err.message || 'Failed to update city status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCity = async (city: any) => {
    if (city.branches && city.branches.length > 0) {
      alert(`Cannot delete '${city.name}' because it has ${city.branches.length} active branches.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete city '${city.name}'?`)) return;

    setActionLoading(true);
    try {
      await authFetch(`${API_URL}/admin/cities/${city.id}`, { method: 'DELETE' }).then(apiJson);
      loadCities();
    } catch (err: any) {
      alert(err.message || 'Failed to delete city');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCities = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
              Enterprise Master
            </span>
            <span className="text-slate-400 text-xs font-semibold">📍 Operational Regions</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">City Management</h1>
          <p className="text-xs text-slate-500 font-medium">
            Define organizational fulfillment cities for branch mapping, inventory balancing, and reassignment rules.
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setCityName('');
            setCityState('');
            setErrorMsg('');
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} /> Add New City
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by city name or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-indigo-500"
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <span>Total Cities: <strong className="text-slate-900 font-black">{cities.length}</strong></span>
          <span>Active Branches Mapped: <strong className="text-indigo-600 font-black">{cities.reduce((acc, c) => acc + (c.branches?.length || 0), 0)}</strong></span>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs font-bold">
            Loading cities data...
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs font-bold bg-white rounded-2xl border border-dashed border-slate-300">
            No fulfillment cities found. Click "Add New City" to create one.
          </div>
        ) : (
          filteredCities.map((city) => (
            <div
              key={city.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-indigo-300 transition-colors"
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <MapPin size={18} className="text-indigo-600" /> {city.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">{city.state}, {city.country}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    city.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {city.status}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <Building2 size={15} className="text-indigo-600" /> Mapped Branches
                </span>
                <span className="font-black text-slate-900 text-sm">
                  {city.branches?.length || 0} Branches
                </span>
              </div>

              {city.branches && city.branches.length > 0 && (
                <div className="space-y-1 text-xs">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Branches List</p>
                  <div className="flex flex-wrap gap-1.5">
                    {city.branches.map((b: any) => (
                      <span key={b.id} className="bg-slate-100 border text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-lg">
                        {b.branchName} ({b.branchCode})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400 font-mono">
                  Created {new Date(city.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(city.id, city.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE')}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                    title={city.status === 'ACTIVE' ? 'Disable City' : 'Activate City'}
                  >
                    {city.status === 'ACTIVE' ? '🚫 Disable' : '✅ Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteCity(city)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold cursor-pointer"
                    title="Delete City"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create City */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>📍</span> Create New City
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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
                <label className="text-[11px] text-slate-600 uppercase block mb-1">City Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">State</label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">Country</label>
                <input
                  type="text"
                  value={cityCountry}
                  onChange={(e) => setCityCountry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreateCity}
                disabled={actionLoading || !cityName.trim() || !cityState.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-10 rounded-xl shadow-md cursor-pointer"
              >
                {actionLoading ? 'Creating...' : 'Create City'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
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
