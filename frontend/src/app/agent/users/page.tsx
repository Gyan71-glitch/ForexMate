"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import API_URL, { authFetch } from '@/lib/api';

export default function AgentUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all users from the backend
    authFetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('forexmate_token');
    sessionStorage.removeItem('forexmate_user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex">
      <aside className="w-64 bg-gray-900 text-white min-h-screen shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-wider text-blue-400">Forexmate <span className="text-sm font-light text-gray-400 block">Agent Portal</span></h1>
        </div>
        <nav className="mt-6 space-y-1">
          <Link href="/agent" className="block px-6 py-3 hover:bg-gray-800 transition-colors">Dashboard</Link>
          <Link href="/agent/orders" className="block px-6 py-3 hover:bg-gray-800 transition-colors">Manage Orders</Link>
          <Link href="/agent/users" className="block px-6 py-3 bg-gray-800 border-l-4 border-blue-500 font-semibold">Users & KYC</Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">
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
                    <td className="px-6 py-4 font-mono text-sm text-gray-500">#{u.id}</td>
                    <td className="px-6 py-4 font-semibold">{u.fullName || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-gray-600">{u.mobile || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>{u.role || 'USER'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">Pending</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:underline font-semibold text-sm">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
