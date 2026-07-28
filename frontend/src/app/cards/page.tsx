"use client";
import Link from 'next/link';
import { useState } from 'react';
import API_URL, { authFetch } from '@/lib/api';

export default function ForexCards() {
  const [currency, setCurrency] = useState('1'); // 1=USD, 2=EUR, 3=GBP
  const [balance, setBalance] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balance || balance < 100) {
      setError('Initial load must be at least 100.');
      return;
    }

    const userStr = sessionStorage.getItem('forexmate_user');
    if (!userStr) {
      setError('You must be logged in to apply for a card.');
      setTimeout(() => window.location.href = '/login', 2000);
      return;
    }

    const user = JSON.parse(userStr);
    
    setLoading(true);
    setError('');

    try {
      const res = await authFetch(`${API_URL}/forex-cards/apply/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currencyId: Number(currency),
          balance: Number(balance),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to apply for card.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navbar */}
      <nav className="bg-blue-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-wider">Forexmate</Link>
          <div className="space-x-6">
            <Link href="/buy-sell" className="hover:text-blue-300 transition-colors">Buy & Sell</Link>
            <Link href="/cards" className="hover:text-blue-300 transition-colors font-semibold border-b-2 border-white pb-1">Forex Cards</Link>
            <Link href="/dashboard" className="hover:text-blue-300 transition-colors">My Profile</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-8 text-white text-center">
            <h2 className="text-3xl font-extrabold mb-2">Apply for a Forex Card</h2>
            <p className="text-blue-200">Travel smart. Load multiple currencies on one card.</p>
          </div>

          <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
            
            {/* Card Graphic */}
            <div className="w-full md:w-1/2">
              <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-blue-500 opacity-20"></div>
                
                <h3 className="text-xl font-bold tracking-widest mb-6">FOREXMATE</h3>
                <div className="font-mono text-lg tracking-widest mb-4">**** **** **** 1234</div>
                <div className="flex justify-between items-center text-sm">
                  <span>YOUR NAME</span>
                  <span className="font-bold">MULTI-CURRENCY</span>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="w-full md:w-1/2">
              {success ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">✓</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Application Approved!</h3>
                  <p className="text-gray-600 text-sm mb-4">Your virtual card is ready and physical card will be shipped soon.</p>
                  <Link href="/dashboard" className="text-blue-600 font-bold hover:underline">View in Dashboard &rarr;</Link>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-center text-sm border border-red-200">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Currency</label>
                    <select 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="1">USD - US Dollar</option>
                      <option value="2">EUR - Euro</option>
                      <option value="3">GBP - British Pound</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Load Amount</label>
                    <input 
                      type="number" 
                      min="100"
                      value={balance}
                      onChange={(e) => setBalance(Number(e.target.value))}
                      placeholder="Min. 100" 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-4 bg-blue-900 hover:bg-blue-800 text-white font-bold text-lg rounded-xl shadow-md transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Processing...' : 'Apply & Load Card'}
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
