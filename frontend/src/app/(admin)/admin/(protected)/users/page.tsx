"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const ROLES = ['CUSTOMER', 'AGENT', 'STAFF', 'BRANCH_MANAGER', 'COMPLIANCE', 'DEALER', 'ACCOUNTANT', 'SUPER_ADMIN', 'BRANCH_OPERATIONS'];

  const fetchUsers = () => {
    authFetch(`${API_URL}/users`)
      .then(apiJson)
      .then((data: any) => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangeRole = (userId: string, role: string) => {
    authFetch(`${API_URL}/admin/users/${userId}/role`, {
      method: 'POST', // or PATCH
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    }).then(res => {
      if(res.ok) {
        fetchUsers();
        setSelectedUser(null);
      }
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('forexmate_token');
    sessionStorage.removeItem('forexmate_user');
    window.location.href = '/login';
  };

  return (
    <div className="p-10 text-gray-900 bg-gray-100 min-h-full">
      

      
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">Users & KYC</h2>
          <button onClick={handleLogout} className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 font-semibold text-sm">Logout</button>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500 font-semibold">All registered platform users and their KYC verification status.</p>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">Full Name</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Mobile</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">KYC Status</th>
                <th className="px-6 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm text-gray-500">#{u.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 font-semibold">{u.fullName || u.profile?.fullName || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-gray-600">{u.mobile || u.profile?.phoneNumber || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.roleRef?.name === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>{u.roleRef?.name || 'USER'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">Pending</span>
                    </td>
                    <td className="px-6 py-4 flex space-x-3">
                      <button className="text-blue-600 hover:underline font-semibold text-sm">View</button>
                      <button onClick={() => setSelectedUser(u)} className="text-purple-600 hover:underline font-semibold text-sm">Change Role</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Change User Role</h3>
              <p className="mb-4 text-sm text-gray-600">
                User: <span className="font-semibold">{selectedUser.fullName || selectedUser.email}</span><br/>
                Current Role: <span className="font-mono">{selectedUser.roleRef?.name || 'USER'}</span>
              </p>
              <div className="space-y-2">
                {ROLES.map(role => (
                  <button 
                    key={role}
                    onClick={() => handleChangeRole(selectedUser.id, role)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded border border-gray-100 font-semibold"
                  >
                    Assign {role}
                  </button>
                ))}
              </div>
              <button onClick={() => setSelectedUser(null)} className="mt-4 w-full px-4 py-3 bg-gray-900 text-white hover:bg-gray-800 rounded font-bold shadow">Cancel</button>
            </div>
          </div>
        )}
      
    </div>
  );
}
