"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import API_URL, { authFetch } from '@/lib/api';

export default function AgentOrders() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    authFetch(`${API_URL}/transactions`)
      .then(res => res.json())
      .then(data => { setTransactions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('forexmate_token');
    sessionStorage.removeItem('forexmate_user');
    window.location.href = '/login';
  };

  const filtered = filter === 'ALL' ? transactions : transactions.filter(t => t.status === filter);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex">
      <aside className="w-64 bg-gray-900 text-white min-h-screen shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-wider text-blue-400">Forexmate <span className="text-sm font-light text-gray-400 block">Agent Portal</span></h1>
        </div>
        <nav className="mt-6 space-y-1">
          <Link href="/agent" className="block px-6 py-3 hover:bg-gray-800 transition-colors">Dashboard</Link>
          <Link href="/agent/orders" className="block px-6 py-3 bg-gray-800 border-l-4 border-blue-500 font-semibold">Manage Orders</Link>
          <Link href="/agent/users" className="block px-6 py-3 hover:bg-gray-800 transition-colors">Users & KYC</Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">Manage Orders</h2>
          <button onClick={handleLogout} className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 font-semibold text-sm">Logout</button>
        </header>

        {/* Filters */}
        <div className="flex space-x-3 mb-6">
          {['ALL', 'PENDING', 'COMPLETED'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${filter === f ? 'bg-blue-900 text-white shadow' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                <th className="px-6 py-3 font-semibold">Transaction ID</th>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Forex Amount</th>
                <th className="px-6 py-3 font-semibold">INR Total</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                filtered.map((txn: any) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{txn.transactionNo}</td>
                    <td className="px-6 py-4 font-semibold">{txn.user?.fullName || `User #${txn.userId}`}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${txn.saleBuy === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{txn.saleBuy} {txn.currency}</span></td>
                    <td className="px-6 py-4 font-semibold">{txn.forexAmount}</td>
                    <td className="px-6 py-4 font-semibold">₹{Number(txn.totalInr).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${txn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{txn.status}</span></td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:underline font-semibold text-sm">Review</button>
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
