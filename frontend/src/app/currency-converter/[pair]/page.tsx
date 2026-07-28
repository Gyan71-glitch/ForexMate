"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API_URL from '@/lib/api';

export default function CurrencyPairPage({ params }: { params: Promise<{ pair: string }> }) {
  const resolvedParams = React.use(params);
  // e.g. usd-to-inr
  const [from, to] = resolvedParams.pair.toUpperCase().split('-TO-');
  
  const [amount, setAmount] = useState('1');
  const [converted, setConverted] = useState('');
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/rates`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          let inrValue = 1;
          if (from !== 'INR') {
            const fObj = data.find(r => r.currencyCode === from);
            if (fObj) inrValue = fObj.inrRate;
          }
          
          let finalRate = inrValue;
          if (to !== 'INR') {
            const tObj = data.find(r => r.currencyCode === to);
            if (tObj) finalRate = inrValue / tObj.inrRate;
          }
          
          setRate(finalRate);
          setConverted((1 * finalRate).toFixed(4));
        }
      });
  }, [from, to]);

  useEffect(() => {
    if (rate !== null && amount) {
      setConverted((parseFloat(amount) * rate).toFixed(4));
    } else {
      setConverted('');
    }
  }, [amount, rate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Convert {from} to {to}</h1>
            <p className="text-xl text-gray-600">Live exchange rate calculator for {from} to {to}</p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 text-center">
            <div className="flex items-center justify-center space-x-6 mb-8">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-32 border-b-4 border-blue-600 text-center text-4xl font-black focus:outline-none text-gray-900"
              />
              <span className="text-4xl font-black text-gray-900">{from}</span>
              <span className="text-4xl text-gray-400">=</span>
            </div>
            
            <div className="bg-blue-50 py-8 rounded-2xl">
              <div className="text-6xl font-black text-blue-700 mb-2">{converted}</div>
              <div className="text-xl font-bold text-blue-900">{to}</div>
            </div>
            
            {rate && (
              <p className="mt-6 text-gray-500 font-medium">
                1 {from} = {rate.toFixed(4)} {to}
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
