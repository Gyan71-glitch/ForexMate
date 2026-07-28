"use client";
import { useEffect, useState } from 'react';
import { getActiveBranches } from '@/lib/api-public';

export default function TrustSection() {
  const [branchCount, setBranchCount] = useState(5000); // Default static placeholder

  useEffect(() => {
    getActiveBranches()
      .then(branches => {
        if (Array.isArray(branches) && branches.length > 0) {
          setBranchCount(branches.length);
        }
      })
      .catch(err => console.error("Failed to load branches count:", err));
  }, []);
  return (
    <div className="w-full max-w-6xl mx-auto mb-20 font-sans">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-10">Forexmate – Security, Transparency & Reliability</h2>

      {/* Top 3 Trust Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div>
          <div className="text-5xl mb-4">🛡️</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Secure & RBI-Compliant Platform</h3>
          <p className="text-sm text-gray-600 leading-relaxed">Fully regulated under FEMA. Bank-grade SSL encryption on all personal & KYC data</p>
        </div>
        <div>
          <div className="text-5xl mb-4">👛</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Money Always In Your Control</h3>
          <p className="text-sm text-gray-600 leading-relaxed">Real time transactions view, Full card management controls in Forexmate App</p>
        </div>
        <div>
          <div className="text-5xl mb-4">🎧</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Live Customer Support</h3>
          <p className="text-sm text-gray-600 leading-relaxed">7 days a week, assisted support to help complete bookings & resolve queries faster</p>
        </div>
      </div>

      {/* Big floating stats card with Global Network Background Texture */}
      <div 
        className="bg-slate-950 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between border border-white/10 shadow-2xl relative overflow-hidden text-white bg-cover bg-center group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)]"
        style={{ backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.78)), url('/trust_bg.png')` }}
      >
        
        {/* Background abstract ambient glows & animations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>

        <div className="md:w-1/2 relative z-10 pr-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-1.5 rounded-full text-xs font-extrabold mb-4 uppercase tracking-wider shadow-sm animate-pulse">
            <span>🛡️</span> RBI Regulated & Authorized
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight tracking-tight">
            India's Most Trusted <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Forex Platform</span>
          </h2>
          <p className="text-slate-300 text-sm font-medium leading-relaxed">
            Buy & sell forex online - order foreign currency notes, get forex cards, and send money abroad. Same-day doorstep delivery available in 65+ cities across India with 100% RBI compliance.
          </p>
        </div>

        <div className="md:w-1/2 relative z-10 flex flex-col items-end space-y-4 mt-10 md:mt-0 w-full">
          
          <div className="bg-white/10 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/15 shadow-lg flex items-center self-end transform hover:-translate-x-2 transition-transform">
            <span className="text-amber-400 text-2xl mr-3">🔄</span>
            <span className="text-lg font-black text-white">$1.7+ Billion <span className="text-xs font-semibold text-slate-300 ml-1">exchanged</span></span>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/15 shadow-lg flex items-center self-center transform hover:translate-x-2 transition-transform">
            <span className="text-emerald-400 text-2xl mr-3">👤</span>
            <span className="text-lg font-black text-white">6.5 Lakh+ <span className="text-xs font-semibold text-slate-300 ml-1">happy customers</span></span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/15 shadow-lg flex items-center self-start transform hover:-translate-x-2 transition-transform">
            <span className="text-indigo-400 text-2xl mr-3">🏦</span>
            <span className="text-lg font-black text-white">{branchCount}+ <span className="text-xs font-semibold text-slate-300 ml-1">Live Branches & Partners</span></span>
          </div>

        </div>

      </div>
    </div>
  );
}
