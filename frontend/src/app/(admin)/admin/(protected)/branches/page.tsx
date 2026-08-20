"use client";
import React, { useState, useEffect } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { Building2, Plus, UserCheck, Phone, Mail, Clock, MapPin, Search, ShieldCheck, CheckCircle } from 'lucide-react';

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignManagerModalBranch, setAssignManagerModalBranch] = useState<any>(null);
  const [selectedManagerId, setSelectedManagerId] = useState('');

  // New Branch Form
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [branchType, setBranchType] = useState('MAIN_BRANCH');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [workingHours, setWorkingHours] = useState('09:00 AM - 06:00 PM');
  const [vaultCapacity, setVaultCapacity] = useState('10000000');

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, eRes, cRes] = await Promise.all([
        authFetch(`${API_URL}/admin/branches`).then(apiJson),
        authFetch(`${API_URL}/admin/employees?limit=100`).then(apiJson).catch(() => authFetch(`${API_URL}/admin/staff`).then(apiJson)),
        authFetch(`${API_URL}/admin/cities`).then(apiJson),
      ]);
      setBranches(bRes || []);
      const empList = Array.isArray(eRes) ? eRes : (eRes?.data || []);
      setEmployees(empList);
      setCities(cRes || []);
    } catch (err: any) {
      console.error('Failed to load branch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    if (!branchCode.trim() || !branchName.trim() || !branchCity.trim()) return;
    setActionLoading(true);
    setErrorMsg('');
    try {
      await authFetch(`${API_URL}/admin/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchCode: branchCode.trim(),
          branchName: branchName.trim(),
          branchAddress: branchAddress.trim(),
          branchCity: branchCity.trim(),
          cityId: selectedCityId || undefined,
          branchType,
          phone,
          email,
          workingHours,
          vaultCapacity: parseFloat(vaultCapacity) || 10000000,
        }),
      }).then(apiJson);

      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create branch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignManager = async () => {
    if (!assignManagerModalBranch || !selectedManagerId) return;
    setActionLoading(true);
    setErrorMsg('');
    try {
      await authFetch(`${API_URL}/admin/branches/${assignManagerModalBranch.id}/assign-manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: selectedManagerId }),
      }).then(apiJson);

      setAssignManagerModalBranch(null);
      setSelectedManagerId('');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assign manager');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setBranchCode('');
    setBranchName('');
    setBranchAddress('');
    setBranchCity('');
    setSelectedCityId('');
    setBranchType('MAIN_BRANCH');
    setPhone('');
    setEmail('');
    setWorkingHours('09:00 AM - 06:00 PM');
    setVaultCapacity('10000000');
    setErrorMsg('');
  };

  const managerCandidates = employees.filter(
    (e) => e.role === 'BRANCH_MANAGER' || e.roleRef?.name === 'BRANCH_MANAGER'
  );

  const filteredBranches = branches.filter(
    (b) =>
      b.branchName.toLowerCase().includes(search.toLowerCase()) ||
      b.branchCode.toLowerCase().includes(search.toLowerCase()) ||
      b.branchCity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
              Enterprise Network
            </span>
            <span className="text-slate-400 text-xs font-semibold">🏛️ Branch Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Branch Network & Vault Management</h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure branches, assign qualified Branch Managers, monitor vault stock, and control branch status.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} /> Create Branch
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by branch name, code, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-indigo-500"
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <span>Total Branches: <strong className="text-slate-900 font-black">{branches.length}</strong></span>
          <span>Main Vaults: <strong className="text-indigo-600 font-black">{branches.filter((b) => b.branchType === 'MAIN_BRANCH').length}</strong></span>
        </div>
      </div>

      {/* Branch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs font-bold">
            Loading branch network...
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs font-bold bg-white rounded-2xl border border-dashed border-slate-300">
            No branches found matching your search.
          </div>
        ) : (
          filteredBranches.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-indigo-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                      {b.branchType || 'MAIN_BRANCH'}
                    </span>
                    <h3 className="font-black text-slate-900 text-base mt-1 flex items-center gap-1.5">
                      <Building2 size={16} className="text-indigo-600" /> {b.branchName}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">Code: {b.branchCode}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      b.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {b.status || 'ACTIVE'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 font-semibold">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <span>{b.branchAddress || 'Address not recorded'}, {b.branchCity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400 shrink-0" />
                    <span>{b.workingHours || '09:00 AM - 06:00 PM'}</span>
                  </div>
                </div>

                {/* Manager Card */}
                <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] font-black uppercase text-indigo-400 block">Assigned Manager</span>
                    <span className="font-extrabold text-indigo-950">
                      {b.manager?.name || 'No Manager Assigned'}
                    </span>
                    {b.manager && (
                      <p className="text-[10px] text-indigo-700 font-mono">{b.manager.phone || b.manager.email}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setAssignManagerModalBranch(b);
                      setSelectedManagerId(b.managerId || '');
                      setErrorMsg('');
                    }}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer"
                  >
                    {b.manager ? 'Transfer' : 'Assign'} Manager
                  </button>
                </div>

                {/* Vault Capacity & Stock */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs font-semibold">
                  <div className="flex justify-between text-slate-500">
                    <span>Vault Capacity:</span>
                    <span className="font-mono text-slate-900 font-bold">₹{Number(b.vaultCapacity || 10000000).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Total Orders:</span>
                    <span className="font-bold text-slate-900">{b._count?.orders || 0} Orders</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Created {new Date(b.createdAt).toLocaleDateString()}</span>
                <span>City: {b.city?.name || b.branchCity}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Branch */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>🏛️</span> Create New Branch
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

            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">Branch Code</label>
                <input
                  type="text"
                  placeholder="e.g. DEL-CP-01"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs uppercase outline-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi Connaught Place"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">City Name</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi"
                  value={branchCity}
                  onChange={(e) => setBranchCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">Branch Type</label>
                <select
                  value={branchType}
                  onChange={(e) => setBranchType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                >
                  <option value="MAIN_BRANCH">Main Branch</option>
                  <option value="HUB">Regional Hub</option>
                  <option value="SATELLITE">Satellite Counter</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[11px] text-slate-600 uppercase block mb-1">Full Branch Address</label>
                <input
                  type="text"
                  placeholder="e.g. Inner Circle, Block A, CP, New Delhi 110001"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="cp@forexmate.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreateBranch}
                disabled={actionLoading || !branchCode.trim() || !branchName.trim() || !branchCity.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-10 rounded-xl shadow-md cursor-pointer"
              >
                {actionLoading ? 'Creating...' : 'Create Branch'}
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

      {/* Modal: 2-Step Manager Assignment */}
      {assignManagerModalBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>👤</span> Assign Branch Manager
              </h3>
              <button onClick={() => setAssignManagerModalBranch(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="bg-indigo-50 p-3 rounded-xl text-xs text-indigo-900 font-medium border border-indigo-100">
              Assigning a manager to <strong>{assignManagerModalBranch.branchName} ({assignManagerModalBranch.branchCode})</strong>.
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-[11px] text-slate-600 uppercase block mb-1">
                  Select Employee (Role: BRANCH_MANAGER)
                </label>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs outline-indigo-500"
                >
                  <option value="">-- Choose Branch Manager Employee --</option>
                  {managerCandidates.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.fullName} ({m.employeeCode || m.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAssignManager}
                disabled={actionLoading || !selectedManagerId}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-10 rounded-xl shadow-md cursor-pointer"
              >
                {actionLoading ? 'Assigning...' : 'Confirm Manager Assignment'}
              </button>
              <button
                onClick={() => setAssignManagerModalBranch(null)}
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
