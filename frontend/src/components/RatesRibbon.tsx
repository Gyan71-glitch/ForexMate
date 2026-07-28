"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRates } from '@/hooks/useRates';
const DEFAULT_RATES = [
  { currency: 'USD', name: 'US Dollar', rate: 94.95, flag: '🇺🇸' },
  { currency: 'EUR', name: 'Euro', rate: 107.76, flag: '🇪🇺' },
  { currency: 'AED', name: 'UAE Dirham', rate: 25.91, flag: '🇦🇪' },
  { currency: 'SGD', name: 'Singapore Dollar', rate: 73.24, flag: '🇸🇬' },
  { currency: 'THB', name: 'Thai Baht', rate: 2.88, flag: '🇹🇭' },
  { currency: 'CAD', name: 'Canadian Dollar', rate: 66.81, flag: '🇨🇦' },
];

const getFlagEmoji = (currencyCode: string | undefined) => {
  if (!currencyCode) return '🌍';
  if (currencyCode === 'EUR') return '🇪🇺';
  if (currencyCode === 'INR') return '🇮🇳';
  const countryCode = currencyCode.substring(0, 2);
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '🌍';
  }
};

const getCurrencyName = (currencyCode: string) => {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
    return displayNames.of(currencyCode) || currencyCode;
  } catch (e) {
    return currencyCode;
  }
};

export default function RatesRibbon() {
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data } = useRates();

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      // Map all API data into our required format
      const apiRates = data
        .filter((item: any) => item.currency.code !== 'INR') // Filter out base currency
        .map((item: any) => ({
          currency: item.currency.code,
          name: getCurrencyName(item.currency.code),
          rate: item.inrRate,
          flag: getFlagEmoji(item.currency.code),
        }))
        .sort((a, b) => (a.currency || '').localeCompare(b.currency || '')); // Sort alphabetically

      // We will use the API rates. If the API returns fewer than 5 items, fallback to default.
      if (apiRates.length > 5) {
        // Re-order to put popular currencies first
        const popularCodes = ['USD', 'EUR', 'GBP', 'AED', 'SGD', 'CAD', 'AUD'];
        const popular = popularCodes.map(code => apiRates.find(r => r.currency === code)).filter(Boolean) as any[];
        const others = apiRates.filter(r => !popularCodes.includes(r.currency));
        
        setRates([...popular, ...others]);
      }
    }
  }, [data]);

  // Show only top 8 in the scrolling ribbon so it doesn't get too overwhelmingly long on desktop
  const topRates = rates.slice(0, 8);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-16 pt-6 font-sans relative">
      <div className="flex items-center gap-2 shrink-0 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-black shadow-md border border-slate-800">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="uppercase tracking-wider">Live Rates</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative max-w-[85vw] md:max-w-[70vw] mask-gradient">
        <div className="animate-marquee flex gap-3 py-1">
          {/* Double the array for seamless infinite looping marquee scroll */}
          {[...topRates, ...topRates].map((item, index) => (
            <div 
              key={index} 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center border border-slate-200/90 rounded-2xl px-4 py-2 bg-white/90 backdrop-blur-md shadow-xs hover:shadow-lg hover:border-blue-400 hover:scale-105 transition-all cursor-pointer shrink-0 group"
            >
              <span className="mr-2 text-xl group-hover:scale-110 transition-transform">{item.flag}</span>
              <span className="font-extrabold text-slate-900 text-xs mr-2">{item.currency}</span>
              <span className="font-mono font-black text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                ₹{item.rate.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2 rounded-full text-xs shrink-0 transition-all shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
      >
        <span>⊞</span>
        <span>View All Rates</span>
      </button>

      {/* Rates Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-extrabold text-gray-900">Rates</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh] p-0 relative">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white shadow-sm z-10 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-900 uppercase tracking-widest bg-white">Currency</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-900 uppercase tracking-widest text-right bg-white">Card (₹)</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-900 uppercase tracking-widest text-right bg-white">Currency Notes (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rates.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 flex items-center">
                          <span className="mr-2 opacity-80">{item.flag}</span>
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 font-medium ml-7">{item.currency}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-800">
                        {item.rate.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-800">
                        {(item.rate * 1.009).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-blue-50 text-center border-t border-gray-100">
              <p className="text-xs text-blue-800 font-bold">
                Place forex order with required amount to know exact live rates of desired currencies.
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
