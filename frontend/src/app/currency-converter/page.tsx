"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API_URL from '@/lib/api';

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState('100');
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('INR');
  const [converted, setConverted] = useState('');
  const [rates, setRates] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/rates`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRates(data);
          calculate(amount, 'USD', 'INR', data);
        }
      });
  }, []);

  const calculate = (amt: string, from: string, to: string, rateData: any[]) => {
    if (!amt || rateData.length === 0) return;
    
    // Everything is stored as rateToInr (e.g. USD inrRate = 83.5)
    let inrValue = parseFloat(amt);
    
    if (from !== 'INR') {
      const fromRateObj = rateData.find(r => r.currencyCode === from);
      if (fromRateObj) {
        inrValue = parseFloat(amt) * fromRateObj.inrRate;
      }
    }
    
    let finalValue = inrValue;
    
    if (to !== 'INR') {
      const toRateObj = rateData.find(r => r.currencyCode === to);
      if (toRateObj) {
        finalValue = inrValue / toRateObj.inrRate;
      }
    }
    
    setConverted(finalValue.toFixed(4));
  };

  const handleSwap = () => {
    const temp = fromCurr;
    setFromCurr(toCurr);
    setToCurr(temp);
    calculate(amount, toCurr, temp, rates);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Currency Converter</h1>
            <p className="text-xl text-gray-600">Check live foreign exchange rates with our free calculator.</p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              
              <div className="flex-1 w-full">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block">Amount</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    calculate(e.target.value, fromCurr, toCurr, rates);
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl p-4 text-xl font-bold focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                />
              </div>

              <div className="flex-1 w-full">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block">From</label>
                <select 
                  value={fromCurr}
                  onChange={(e) => {
                    setFromCurr(e.target.value);
                    calculate(amount, e.target.value, toCurr, rates);
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl p-4 text-xl font-bold focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  {rates.filter(r => r.currencyCode !== 'INR').map(r => (
                    <option key={r.currencyCode} value={r.currencyCode}>{r.currencyCode}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center pb-2">
                <button 
                  onClick={handleSwap}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors text-blue-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </button>
              </div>

              <div className="flex-1 w-full">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block">To</label>
                <select 
                  value={toCurr}
                  onChange={(e) => {
                    setToCurr(e.target.value);
                    calculate(amount, fromCurr, e.target.value, rates);
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl p-4 text-xl font-bold focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  {rates.filter(r => r.currencyCode !== 'INR').map(r => (
                    <option key={r.currencyCode} value={r.currencyCode}>{r.currencyCode}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="mt-12 text-center p-8 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="text-gray-500 font-bold mb-2">{amount} {fromCurr} =</div>
              <div className="text-5xl font-black text-blue-700">{converted} {toCurr}</div>
              <div className="text-sm text-gray-400 mt-4">Rates are indicative and subject to market fluctuations.</div>
            </div>
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
