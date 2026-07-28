"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function ExploreProducts() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="w-full max-w-6xl mx-auto mb-20 font-sans">
      
      {/* Travel Destinations Banner Background */}
      <div 
        className="w-full rounded-3xl p-8 md:p-12 mb-16 text-white bg-cover bg-center relative overflow-hidden shadow-2xl border border-white/20 group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(249,115,22,0.18)]"
        style={{ backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.90), rgba(15, 23, 42, 0.65)), url('/destinations_bg.png')` }}
      >
        <div className="max-w-2xl relative z-10">
          <span className="bg-orange-500/90 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-block shadow-md animate-pulse">
            ✈️ Global Destination Coverage
          </span>
          <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight tracking-tight">
            Exchange Forex for <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">65+ Countries</span> Worldwide
          </h2>
          <p className="text-slate-200 text-sm font-medium leading-relaxed mb-6">
            Get instant multi-currency cards & cash delivered same-day before your international flight. Zero markup, 100% genuine notes guaranteed.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/buy-forex" 
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg shadow-orange-500/25 transition-transform group-hover:scale-105"
            >
              Order Forex Now →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Offers Filter Header */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center space-x-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Offers</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg text-sm font-bold border transition-colors ${filter === 'all' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('card')}
              className={`px-6 py-2 rounded-lg text-sm font-bold border transition-colors ${filter === 'card' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}
            >
              Forex Card
            </button>
            <button 
              onClick={() => setFilter('notes')}
              className={`px-6 py-2 rounded-lg text-sm font-bold border transition-colors ${filter === 'notes' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}
            >
              Foreign Currency Notes
            </button>
          </div>
        </div>
        <Link href="/forex-cards" className="text-blue-600 font-bold text-sm hover:underline">View All</Link>
      </div>

      <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Explore Forex Card & Currency Notes</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Card 1: Notes */}
        <div className="border border-slate-200/90 rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div className="h-52 w-full bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 relative overflow-hidden flex justify-center items-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
              <div className="bg-emerald-500/30 backdrop-blur-md w-44 h-24 rounded-2xl border border-emerald-400/30 transform -rotate-12 absolute flex justify-center items-center text-white font-bold opacity-60">5000</div>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 w-48 h-24 rounded-2xl shadow-2xl transform rotate-6 z-10 flex justify-center items-center text-white font-extrabold text-lg border border-emerald-300/40 group-hover:scale-105 transition-transform">
                💵 Currency Notes
              </div>
            </div>
            <div className="p-7">
              <h3 className="text-xl font-extrabold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">Foreign Currency Notes</h3>
              <ul className="space-y-3 text-xs font-semibold text-slate-600 mb-6">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>40+ currencies available in stock</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>RBI approved genuine notes</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Doorstep delivery & pay on delivery</li>
              </ul>
            </div>
          </div>
          <div className="px-7 pb-7">
            <Link href="/buy-forex" className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-extrabold text-xs py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2">
              <span>Order Currency Notes</span> &rarr;
            </Link>
          </div>
        </div>

        {/* Card 2: Multi Currency Card */}
        <div className="border border-slate-200/90 rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div className="h-52 w-full bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 relative overflow-hidden flex justify-center items-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
              <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 w-52 h-30 rounded-2xl shadow-2xl transform rotate-6 z-10 p-4 flex flex-col justify-between border border-blue-400/40 group-hover:scale-105 transition-transform">
                <div className="w-9 h-7 bg-amber-400 rounded-lg shadow-inner"></div>
                <div className="flex justify-between items-end">
                  <span className="text-white text-[10px] font-black tracking-wider">MULTI CURRENCY</span>
                  <span className="text-white text-xl">💳</span>
                </div>
              </div>
            </div>
            <div className="p-7">
              <h3 className="text-xl font-extrabold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">Multi-Currency Forex Card</h3>
              <ul className="space-y-3 text-xs font-semibold text-slate-600 mb-6">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Zero forex markup & zero hidden fee</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Zero reload / unload charges</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>5% cheaper than debit / credit cards</li>
              </ul>
            </div>
          </div>
          <div className="px-7 pb-7">
            <Link href="/forex-cards" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-extrabold text-xs py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2">
              <span>Get Forex Card</span> &rarr;
            </Link>
          </div>
        </div>

        {/* Card 3: USD Card */}
        <div className="border border-slate-200/90 rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div className="h-52 w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden flex justify-center items-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
              <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 w-52 h-30 rounded-2xl shadow-2xl transform -rotate-6 z-10 p-4 flex flex-col justify-between border border-slate-700/80 group-hover:scale-105 transition-transform">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">USD Forex Card</span>
                  <span className="text-amber-400 text-sm font-black italic">InstaPass</span>
                </div>
                <div className="w-9 h-7 bg-amber-500 rounded-lg shadow-inner"></div>
              </div>
            </div>
            <div className="p-7">
              <h3 className="text-xl font-extrabold text-slate-900 mb-4 group-hover:text-amber-600 transition-colors">Global USD Forex Card</h3>
              <ul className="space-y-3 text-xs font-semibold text-slate-600 mb-6">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Zero forex markup worldwide</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>No cross-currency conversion fee</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Instant app unlock & locking</li>
              </ul>
            </div>
          </div>
          <div className="px-7 pb-7">
            <Link href="/forex-cards" className="w-full bg-slate-900 hover:bg-amber-600 text-white font-extrabold text-xs py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2">
              <span>View USD Card</span> &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
