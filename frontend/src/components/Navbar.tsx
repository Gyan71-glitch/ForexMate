"use client";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Globe, Banknote, Send, CreditCard, Briefcase, ShieldCheck, Smartphone, Handshake, Building2, Flame } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-50 bg-slate-950/50 backdrop-blur-md border-b border-white/10 text-white font-sans">
      {/* Top Banner Contact Strip */}
      <div className="py-1 px-6 flex justify-between items-center text-[11px] border-b border-white/10 text-slate-300">
        <div className="flex space-x-6 items-center">
          <a href="tel:09212219191" className="flex items-center hover:text-white font-bold transition-colors">
            <span className="mr-1.5 text-orange-400">📞</span> +91 9212219191
          </a>
          <span className="text-slate-700">|</span>
          <span className="flex items-center text-[10px] text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
            RBI Authorized FFMC
          </span>
          <Link href="/contact" className="hover:text-white transition-colors">Care</Link>
        </div>
        <div className="flex space-x-4 items-center">
          {user ? (
            <>
              <span className="font-extrabold text-white">Hi, {user.fullName.split(' ')[0]}</span>
              <span className="opacity-30">|</span>
              <button onClick={() => logout()} className="hover:text-red-400 font-bold transition-colors">Logout</button>
              <span className="opacity-30">|</span>
              <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-0.5 rounded-full font-extrabold text-[11px] transition-colors shadow-xs">My Account</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-white font-bold transition-colors">Login</Link>
              <span className="opacity-30">|</span>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-0.5 rounded-full font-bold text-[11px] transition-colors shadow-xs">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* Main Navigation Megamenu */}
      <nav className="px-6 flex justify-between items-center h-16 text-white">
        
        {/* Logo */}
        <div className="flex items-center shrink-0 mr-8">
          <Link href="/" className="group flex items-center gap-1.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-md group-hover:scale-105 transition-transform border border-white/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="text-white font-black text-2xl tracking-tighter italic">Forex<span className="text-orange-400">mate</span></div>
          </Link>
        </div>
        
        {/* Nav Links */}
        <div className="hidden lg:flex items-center space-x-8 text-sm font-bold text-slate-200 h-full">
          
          {/* Services Megamenu */}
          <div className="relative group h-full flex items-center">
            <button className="flex items-center hover:text-white transition-colors py-4">
              Services <svg className="w-4 h-4 ml-1 opacity-60 transform group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="absolute top-[64px] -left-10 bg-white shadow-2xl rounded-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 w-[650px] p-6 grid grid-cols-2 gap-x-8 gap-y-6 before:content-[''] before:absolute before:-top-4 before:left-0 before:w-full before:h-4 text-gray-900">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-400 font-extrabold mb-4">Core Forex</h3>
                <ul className="space-y-3">
                  <li><Link href="/currency-exchange" className="flex items-center hover:text-blue-600 font-semibold"><Banknote className="w-5 h-5 mr-3 text-blue-600" /> Currency Exchange</Link></li>
                  <li><Link href="/transfer-money" className="flex items-center hover:text-blue-600 font-semibold"><Send className="w-5 h-5 mr-3 text-indigo-600" /> Send Money Abroad</Link></li>
                  <li><Link href="/forex-cards" className="flex items-center hover:text-blue-600 font-semibold"><CreditCard className="w-5 h-5 mr-3 text-purple-600" /> Prepaid Travel Forex Card</Link></li>
                  <li><Link href="/trade-remittance" className="flex items-center hover:text-blue-600 font-semibold"><Briefcase className="w-5 h-5 mr-3 text-amber-600" /> Trade Remittance</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-400 font-extrabold mb-4">Travel & Partners</h3>
                <ul className="space-y-3">
                  <li><Link href="/travel-insurance" className="flex items-center hover:text-blue-600 font-semibold"><ShieldCheck className="w-5 h-5 mr-3 text-sky-600" /> Travel Insurance</Link></li>
                  <li><Link href="/international-sim" className="flex items-center hover:text-blue-600 font-semibold"><Smartphone className="w-5 h-5 mr-3 text-emerald-600" /> International Sim Card</Link></li>
                  <li><Link href="/faas-partners" className="flex items-center hover:text-blue-600 font-semibold"><Handshake className="w-5 h-5 mr-3 text-orange-600" /> Forex as a Service (FaaS)</Link></li>
                  <li><Link href="/corporate-solutions" className="flex items-center hover:text-blue-600 font-semibold"><Building2 className="w-5 h-5 mr-3 text-slate-600" /> Corporate Solutions</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Top Currencies Megamenu */}
          <div className="relative group h-full flex items-center">
            <button className="flex items-center hover:text-white transition-colors py-4">
              Top Currencies <svg className="w-4 h-4 ml-1 opacity-60 transform group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="absolute top-[64px] -left-32 bg-white shadow-2xl rounded-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 w-[550px] p-6 grid grid-cols-2 gap-x-8 gap-y-2 before:content-[''] before:absolute before:-top-4 before:left-0 before:w-full before:h-4 text-gray-900">
              <Link href="/currency/usd" className="flex items-center py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                <span className="text-xl mr-3">🇺🇸</span> <div><div className="font-bold">US Dollar</div><div className="text-[10px] text-gray-400 uppercase tracking-wider">USD Rate</div></div>
              </Link>
              <Link href="/currency/eur" className="flex items-center py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                <span className="text-xl mr-3">🇪🇺</span> <div><div className="font-bold">Euro</div><div className="text-[10px] text-gray-400 uppercase tracking-wider">EUR Rate</div></div>
              </Link>
              <Link href="/currency/gbp" className="flex items-center py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                <span className="text-xl mr-3">🇬🇧</span> <div><div className="font-bold">British Pound</div><div className="text-[10px] text-gray-400 uppercase tracking-wider">GBP Rate</div></div>
              </Link>
              <Link href="/currency/aud" className="flex items-center py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                <span className="text-xl mr-3">🇦🇺</span> <div><div className="font-bold">Australian Dollar</div><div className="text-[10px] text-gray-400 uppercase tracking-wider">AUD Rate</div></div>
              </Link>
              <Link href="/currency/cad" className="flex items-center py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                <span className="text-xl mr-3">🇨🇦</span> <div><div className="font-bold">Canadian Dollar</div><div className="text-[10px] text-gray-400 uppercase tracking-wider">CAD Rate</div></div>
              </Link>
              <Link href="/currency/sgd" className="flex items-center py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                <span className="text-xl mr-3">🇸🇬</span> <div><div className="font-bold">Singapore Dollar</div><div className="text-[10px] text-gray-400 uppercase tracking-wider">SGD Rate</div></div>
              </Link>
              <div className="col-span-2 pt-2 mt-2 border-t border-gray-100 text-center">
                <Link href="/rates" className="text-sm text-blue-600 font-bold hover:underline">View All Currencies &rarr;</Link>
              </div>
            </div>
          </div>

          {/* Currency Converter Megamenu */}
          <div className="relative group h-full flex items-center">
            <button className="flex items-center hover:text-white transition-colors py-4">
              Currency Converter <svg className="w-4 h-4 ml-1 opacity-60 transform group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="absolute top-[64px] -left-32 bg-white shadow-2xl rounded-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 w-[450px] p-6 grid grid-cols-2 gap-x-4 gap-y-2 before:content-[''] before:absolute before:-top-4 before:left-0 before:w-full before:h-4 text-gray-900">
              <Link href="/currency-converter/usd-to-inr" className="py-2 hover:text-blue-600 font-bold flex items-center"><span className="text-gray-400 mr-2 text-xs">USA</span> USD to INR</Link>
              <Link href="/currency-converter/eur-to-inr" className="py-2 hover:text-blue-600 font-bold flex items-center"><span className="text-gray-400 mr-2 text-xs">EUR</span> EUR to INR</Link>
              <Link href="/currency-converter/gbp-to-inr" className="py-2 hover:text-blue-600 font-bold flex items-center"><span className="text-gray-400 mr-2 text-xs">UK</span> GBP to INR</Link>
              <Link href="/currency-converter/aud-to-inr" className="py-2 hover:text-blue-600 font-bold flex items-center"><span className="text-gray-400 mr-2 text-xs">AUS</span> AUD to INR</Link>
              <Link href="/currency-converter/cad-to-inr" className="py-2 hover:text-blue-600 font-bold flex items-center"><span className="text-gray-400 mr-2 text-xs">CAN</span> CAD to INR</Link>
              <Link href="/currency-converter/sgd-to-inr" className="py-2 hover:text-blue-600 font-bold flex items-center"><span className="text-gray-400 mr-2 text-xs">SGP</span> SGD to INR</Link>
              <div className="col-span-2 pt-4 mt-2 border-t border-gray-100 text-center">
                <Link href="/currency-converter" className="text-sm text-blue-600 font-bold hover:underline">Open Currency Converter &rarr;</Link>
              </div>
            </div>
          </div>

          <Link href="/rates" className="hover:text-white transition-colors">Forex Rates</Link>
          <Link href="/faqs" className="hover:text-white transition-colors">FAQs</Link>
          <Link href="/offers" className="text-orange-400 hover:text-orange-300 font-extrabold transition-colors flex items-center"><Flame className="w-4 h-4 mr-1 text-orange-400" /> Offers</Link>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-4">
          <Link href="/buy-forex" className="hidden xl:flex items-center bg-white/10 hover:bg-white/20 text-white font-extrabold px-5 py-2.5 rounded-full text-sm border border-white/20 backdrop-blur-sm transition-all shadow-sm">
            Book An Order
          </Link>
          <Link href="/rates" className="hidden xl:flex items-center bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full text-sm font-extrabold transition-all shadow-md shadow-blue-500/20">
            Live Rates <span className="flex h-2 w-2 relative ml-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span></span>
          </Link>
          
          {user && (
            <Link href="/dashboard" className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center border-2 border-orange-400 hover:bg-orange-600 transition-colors ml-4 shrink-0 shadow-md">
              <span className="font-bold text-sm">{user.fullName.charAt(0).toUpperCase()}</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
