"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function TravelInsurancePage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white pt-20 pb-32 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
            <div className="flex-1 pr-10">
              <span className="bg-blue-800 text-blue-100 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6 inline-block">Secure Your Journey</span>
              <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Comprehensive Travel <span className="text-orange-400">Insurance</span> for Global Explorers
              </h1>
              <p className="text-lg text-blue-100 mb-8 max-w-xl">
                Travel with peace of mind. Get instant coverage for medical emergencies, trip cancellations, lost baggage, and more across 200+ countries.
              </p>
              <div className="flex space-x-4">
                <Link href="#get-quote" className="bg-orange-500 hover:bg-orange-400 text-white font-extrabold px-8 py-3 rounded-full transition-transform hover:scale-105">
                  Get a Free Quote
                </Link>
                <Link href="#plans" className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-full transition-colors backdrop-blur-sm">
                  View Plans
                </Link>
              </div>
            </div>
            
            <div className="flex-1 mt-12 md:mt-0">
              <div className="bg-white p-8 rounded-3xl shadow-2xl relative">
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-lg transform rotate-12">
                  5 Min
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Quick Quote</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Destination</label>
                    <select className="w-full border border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                      <option>Select Destination Region</option>
                      <option>USA / Canada</option>
                      <option>Schengen (Europe)</option>
                      <option>Asia / Middle East</option>
                      <option>Worldwide (Excl. USA/Canada)</option>
                    </select>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Start Date</label>
                      <input 
                        type="date" 
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onClick={(e) => { try { (e.target as any).showPicker(); } catch (_) {} }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStartDate(val);
                          if (endDate && val && endDate < val) setEndDate(val);
                        }}
                        className="w-full border border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">End Date</label>
                      <input 
                        type="date" 
                        value={endDate}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        onClick={(e) => { try { (e.target as any).showPicker(); } catch (_) {} }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (startDate && val && val < startDate) {
                            setEndDate(startDate);
                          } else {
                            setEndDate(val);
                          }
                        }}
                        className="w-full border border-gray-300 rounded-xl p-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Travelers</label>
                    <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                      <select className="flex-1 bg-transparent border-none text-gray-900 font-medium focus:ring-0">
                        <option>1 Adult</option>
                        <option>2 Adults</option>
                        <option>Family (2A + 2C)</option>
                      </select>
                      <span className="text-gray-400">|</span>
                      <input type="number" placeholder="Age" className="w-20 bg-transparent border-none text-gray-900 font-medium text-center focus:ring-0" />
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-xl mt-4 transition-colors">
                    Calculate Premium &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-6xl mx-auto py-20 px-6 -mt-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6">🏥</div>
              <h4 className="text-xl font-extrabold text-gray-900 mb-3">Medical Cover</h4>
              <p className="text-gray-600">Up to $500,000 in emergency medical evacuation and hospitalization expenses covered instantly.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center text-center transform md:-translate-y-8">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-3xl mb-6">✈️</div>
              <h4 className="text-xl font-extrabold text-gray-900 mb-3">Trip Cancellation</h4>
              <p className="text-gray-600">100% reimbursement for non-refundable expenses if your trip is cancelled due to unavoidable circumstances.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-6">🧳</div>
              <h4 className="text-xl font-extrabold text-gray-900 mb-3">Loss of Baggage</h4>
              <p className="text-gray-600">Instant compensation for lost or delayed checked-in baggage, or loss of passport and essential documents.</p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
