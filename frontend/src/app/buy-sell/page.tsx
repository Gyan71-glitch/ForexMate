"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import API_URL, { authFetch } from '@/lib/api';

export default function BuySell() {
  const [action, setAction] = useState('Buy Currency');
  const [city, setCity] = useState('Delhi');
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Mock exchange rates
  const rates: Record<string, number> = {
    'USD': 83.12,
    'EUR': 90.45,
    'GBP': 105.30,
  };

  const rate = rates[currency] || 83.12;
  const total = (Number(amount) || 0) * rate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    // Get user from localStorage
    const userStr = sessionStorage.getItem('forexmate_user');
    if (!userStr) {
      setError('You must be logged in to place an order.');
      setTimeout(() => window.location.href = '/login', 2000);
      return;
    }

    const user = JSON.parse(userStr);
    
    setLoading(true);
    setError('');
    
    try {
      const res = await authFetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          city: city,
          currency: currency,
          saleBuy: action === 'Buy Currency' ? 'BUY' : 'SELL',
          forexProduct: 'CASH',
          inrAmount: total,
          forexRate: rate,
          forexAmount: Number(amount),
          totalInr: total,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to process transaction');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
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
            <Link href="/buy-sell" className="hover:text-blue-300 transition-colors font-semibold border-b-2 border-white pb-1">Buy & Sell</Link>
            <Link href="/cards" className="hover:text-blue-300 transition-colors">Forex Cards</Link>
            <Link href="/dashboard" className="hover:text-blue-300 transition-colors">My Profile</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-8 text-white text-center">
            <h2 className="text-3xl font-extrabold mb-2">Currency Exchange</h2>
            <p className="text-blue-200">Get the best rates instantly. Delivered to your door.</p>
          </div>

          <div className="p-8">
            {success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">✓</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h3>
                <p className="text-gray-600">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-center text-sm border border-red-200">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">I want to</label>
                    <select 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                    >
                      <option>Buy Currency</option>
                      <option>Sell Currency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <select 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option>Delhi</option>
                      <option>Mumbai</option>
                      <option>Bangalore</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 items-end">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                    <select 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 font-semibold text-gray-500">
                        {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                      </span>
                      <input 
                        type="number" 
                        placeholder="1000" 
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full border border-gray-300 p-3 pl-8 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-8 text-center shadow-inner">
                  <p className="text-sm text-gray-500 mb-2">Live Exchange Rate: <span className="font-bold text-gray-800">1 {currency} = {rate} INR</span></p>
                  <h3 className="text-3xl font-extrabold text-blue-900">Total: ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-4 mt-8 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold text-lg rounded-xl shadow-lg transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                >
                  {loading ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
