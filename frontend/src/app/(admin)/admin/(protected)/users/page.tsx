"use client";
import React, { useEffect, useState } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { Users, Search, RefreshCw, ShieldCheck, Key, CheckCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const ROLES = [
    'CUSTOMER',
    'AGENT',
    'STAFF',
    'BRANCH_CASHIER',
    'DELIVERY_PARTNER',
    'BRANCH_MANAGER',
    'BRANCH_OPERATIONS',
    'COMPLIANCE_ADMIN',
    'OPERATIONS_ADMIN',
    'SUPER_ADMIN',
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await authFetch(`${API_URL}/users`).then(apiJson);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    setActionLoading(true);
    setMsg('');
    try {
      await authFetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      }).then(apiJson);
      fetchUsers();
      setSelectedUser(null);
      setMsg(`Role updated to ${role} successfully.`);
    } catch (err: any) {
      setMsg(err.message || 'Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile?.toLowerCase().includes(search.toLowerCase()) ||
      u.roleRef?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
              Headquarters Control
            </span>
            <span className="text-slate-400 text-xs font-semibold">👤 User & Access Governance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Platform Users & Role Master</h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage global platform accounts, customer profiles, staff assignments, and role permissions.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} /> Refresh Users
        </button>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle size={16} /> {msg}
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, mobile, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
          />
        </div>
        <span className="text-xs text-slate-500 font-bold">
          Showing <span className="text-slate-900 font-black">{filteredUsers.length}</span> registered accounts
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="p-4">User Details</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Current Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    Loading users list...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    No users matching search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">{u.fullName || u.profile?.fullName || '—'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-mono">{u.mobile || u.profile?.phoneNumber || '—'}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          u.roleRef?.name === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : u.roleRef?.name === 'BRANCH_MANAGER'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : u.roleRef?.name === 'CUSTOMER'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        <ShieldCheck size={12} />
                        {u.roleRef?.name || u.userType || 'CUSTOMER'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                      <span className="font-bold text-slate-800">{u.status || 'ACTIVE'}</span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold rounded-lg transition-all text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <Key size={13} />
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Assign Role Permission</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedUser.fullName || selectedUser.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Current Role: <span className="font-bold text-indigo-600">{selectedUser.roleRef?.name || 'CUSTOMER'}</span>
            </p>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {ROLES.map((r) => (
                <button
                  key={r}
                  disabled={actionLoading}
                  onClick={() => handleChangeRole(selectedUser.id, r)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedUser.roleRef?.name === r
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{r}</span>
                  {selectedUser.roleRef?.name === r && <CheckCircle size={14} />}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
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
