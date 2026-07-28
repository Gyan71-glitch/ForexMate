import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function FaasPartnersPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-3xl mx-auto text-center bg-white p-12 rounded-3xl shadow-xl">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🤝</div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Forex as a Service (FaaS)</h1>
          <p className="text-xl text-gray-600 mb-8">Integrate our powerful B2B APIs to offer seamless forex and remittance to your own customers. Coming soon.</p>
          <button className="bg-orange-500 text-white font-bold px-8 py-3 rounded-full hover:bg-orange-600">View API Docs</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
