import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function RemittancePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Send Money Abroad Securely</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-10">
            Transfer funds internationally for education, medical expenses, or family maintenance at the lowest interbank rates.
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl font-bold mb-6">Transfer Funds Overseas</h2>
            <Link href="/dashboard/order?intent=REMITTANCE">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-xl text-lg transition-transform transform hover:scale-105 shadow-md">
                Start Remittance
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-colors">
              <div className="text-4xl mb-4 text-blue-500">💸</div>
              <h3 className="text-xl font-bold mb-3">Lowest Wire Charges</h3>
              <p className="text-gray-600">Save thousands of rupees compared to traditional banks. Transparent fee structure with no hidden margins.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-colors">
              <div className="text-4xl mb-4 text-blue-500">⚡</div>
              <h3 className="text-xl font-bold mb-3">Fast Processing</h3>
              <p className="text-gray-600">Funds usually credit within 12-48 working hours. Track your transfer status directly from your dashboard.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-colors">
              <div className="text-4xl mb-4 text-blue-500">📜</div>
              <h3 className="text-xl font-bold mb-3">Fully Compliant</h3>
              <p className="text-gray-600">100% compliant with RBI's Liberalised Remittance Scheme (LRS). We assist with Form A2 and compliance checks.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
