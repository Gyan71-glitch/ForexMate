import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ForexCardsPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Zero Markup Multi-Currency Forex Cards</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-10">
            Travel the world like a local. Load multiple currencies on a single card and swipe globally with zero hidden charges.
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl font-bold mb-6">Get your Forex Card today</h2>
            <Link href="/dashboard/order?intent=BUY&product=CARD">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-xl text-lg transition-transform transform hover:scale-105 shadow-md">
                Order Forex Card
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-colors">
              <div className="text-4xl mb-4 text-blue-500">🌍</div>
              <h3 className="text-xl font-bold mb-3">Load 14+ Currencies</h3>
              <p className="text-gray-600">Avoid cross-currency markup fees. Load USD, EUR, GBP, and many more on a single smart card.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-colors">
              <div className="text-4xl mb-4 text-blue-500">🛡️</div>
              <h3 className="text-xl font-bold mb-3">Chip & PIN Secure</h3>
              <p className="text-gray-600">Highest level of security. Instantly block, unblock, or change PIN from the Forexmate app.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-colors">
              <div className="text-4xl mb-4 text-blue-500">📱</div>
              <h3 className="text-xl font-bold mb-3">App Controlled</h3>
              <p className="text-gray-600">Track spends in real-time, reload on the go, and manage multiple wallets seamlessly through our mobile app.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
