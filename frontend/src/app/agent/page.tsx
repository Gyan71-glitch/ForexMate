"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import API_URL, { authFetch } from '@/lib/api';

export default function AgentDashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${API_URL}/transactions`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('forexmate_token');
    sessionStorage.removeItem('forexmate_user');
    window.location.href = '/login';
  };

  // KPIs
  const todayTransactions = transactions.length;
  const totalInr = transactions.reduce((sum, txn) => sum + Number(txn.totalInr || 0), 0);
  const pendingTransactions = transactions.filter(t => t.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white min-h-screen shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-wider text-blue-400">Forexmate <span className="text-sm font-light text-gray-400 block">Agent Portal</span></h1>
        </div>
        <nav className="mt-6 space-y-1">
          <Link href="/agent" className="block px-6 py-3 bg-gray-800 border-l-4 border-blue-500 font-semibold">Dashboard</Link>
          <Link href="/agent/orders" className="block px-6 py-3 hover:bg-gray-800 transition-colors">Manage Orders</Link>
          <Link href="/agent/users" className="block px-6 py-3 hover:bg-gray-800 transition-colors">Users & KYC</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-800">Agent Overview</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 font-semibold">Branch: General Processing</span>
            <button onClick={handleLogout} className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 font-semibold text-sm">Logout</button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
            <h4 className="text-sm text-gray-500 font-bold mb-1">Total Transactions</h4>
            <p className="text-3xl font-extrabold text-gray-800">{loading ? '...' : todayTransactions}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
            <h4 className="text-sm text-gray-500 font-bold mb-1">Total INR Volume</h4>
            <p className="text-3xl font-extrabold text-gray-800">{loading ? '...' : `₹${(totalInr / 100000).toFixed(1)}M`}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-yellow-500">
            <h4 className="text-sm text-gray-500 font-bold mb-1">Pending Orders</h4>
            <p className="text-3xl font-extrabold text-gray-800">{loading ? '...' : pendingTransactions}</p>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Recent Customer Orders</h3>
            <button className="text-sm text-blue-600 font-semibold hover:underline">Refresh</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                <th className="px-6 py-3 font-semibold">Transaction ID</th>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Amount</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No transactions found.</td>
                </tr>
              ) : (
                transactions.map((txn: any) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{txn.transactionNo}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{txn.user?.fullName || `User ID: ${txn.userId}`}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${txn.saleBuy === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {txn.saleBuy} {txn.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{txn.currency === 'USD' ? '$' : txn.currency === 'EUR' ? '€' : '£'}{txn.forexAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${txn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4"><button className="text-blue-600 hover:underline font-semibold text-sm">Review</button></td>
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
