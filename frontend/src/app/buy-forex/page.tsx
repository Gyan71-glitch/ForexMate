import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { OrderWizard } from '@/components/orders/OrderWizard';
import { TrendingDown, Truck, ShieldCheck } from 'lucide-react';

export default function BuyForexPage() {
  return (
    <div className="min-h-screen font-sans text-gray-900 flex flex-col relative bg-slate-950">
      <Navbar />

      {/* Full Page Travel Background Image with Gradient Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none z-0"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.65) 40%, rgba(15, 23, 42, 0.88) 100%), url('/full_travel_bg.png')` 
        }}
      />

      {/* Hero Header Section */}
      <section className="relative z-10 text-white pt-28 pb-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">
            Buy Foreign Currency <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">Online</span>
          </h1>
          <p className="text-slate-200 max-w-2xl mx-auto text-base md:text-lg mb-8 font-medium leading-relaxed drop-shadow-sm">
            Get the best exchange rates with zero commission. Order currency notes from the comfort of your home with guaranteed doorstep delivery.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-100">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 shadow-lg">
              <TrendingDown className="w-4 h-4 text-emerald-400" /> Live Interbank Rates
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 shadow-lg">
              <Truck className="w-4 h-4 text-orange-400" /> Same-Day Doorstep Delivery
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 shadow-lg">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> 100% RBI Authorized
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Dynamic Order Engine */}
      <main className="flex-grow px-6 relative z-10 pb-20">
        <div className="max-w-4xl mx-auto text-left shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/20">
          <OrderWizard />
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 hover:border-blue-500/50 transition-all text-white">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-5 font-bold">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Live Interbank Rates</h3>
              <p className="text-slate-300 text-sm leading-relaxed">We offer real-time exchange rates tied to live market feeds, ensuring you get exactly what you see without hidden markups.</p>
            </div>
            
            <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 hover:border-orange-500/50 transition-all text-white">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center mb-5 font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Doorstep Delivery</h3>
              <p className="text-slate-300 text-sm leading-relaxed">Why visit a bank? Complete your KYC online and get currency notes delivered safely to your home or office on the same day.</p>
            </div>
            
            <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 hover:border-emerald-500/50 transition-all text-white">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-5 font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">RBI Authorized</h3>
              <p className="text-slate-300 text-sm leading-relaxed">We are a fully RBI-regulated entity, ensuring 100% compliance and security for all your foreign exchange transactions.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
