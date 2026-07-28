import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import HeroForm from '@/components/HeroForm';

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const resolvedParams = await params;
  const city = resolvedParams.city.charAt(0).toUpperCase() + resolvedParams.city.slice(1).replace('-', ' ');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white pt-20 pb-40 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <span className="bg-blue-800 text-blue-100 px-4 py-2 rounded-full text-sm font-bold tracking-widest uppercase mb-6 inline-block">Best Rates in {city}</span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Foreign Currency Exchange in <span className="text-orange-400">{city}</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Get the best foreign exchange rates in {city}. Buy forex online and get same-day doorstep delivery anywhere in {city}.
            </p>
          </div>
        </div>

        <div className="-mt-32 relative z-10 px-6">
           <HeroForm />
        </div>

        <div className="max-w-6xl mx-auto py-20 px-6">
          <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">Why exchange currency in {city} with us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">🛵</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Doorstep Delivery</h3>
              <p className="text-gray-600">Free and secure same-day delivery of your foreign currency notes across all major pin codes in {city}.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">📉</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Rates</h3>
              <p className="text-gray-600">No static bank rates. We scan hundreds of RBI authorized money changers in {city} to give you the lowest live rate.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Authentic</h3>
              <p className="text-gray-600">All currency notes are verified for authenticity before they are dispatched from our {city} partner branches.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
