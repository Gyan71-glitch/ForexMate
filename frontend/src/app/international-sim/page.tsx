import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function InternationalSimPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white pt-20 pb-32 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
            <div className="flex-1 pr-10">
              <span className="bg-purple-800 text-purple-100 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6 inline-block">Stay Connected Everywhere</span>
              <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Global Roaming <span className="text-pink-400">SIM Cards</span> & eSIMs
              </h1>
              <p className="text-lg text-indigo-100 mb-8 max-w-xl">
                Skip the expensive international roaming charges. Get a prepaid international SIM card or instantly download an eSIM before you travel to 150+ countries.
              </p>
              <div className="flex space-x-4">
                <Link href="#buy-sim" className="bg-pink-500 hover:bg-pink-400 text-white font-extrabold px-8 py-3 rounded-full transition-transform hover:scale-105 shadow-lg shadow-pink-500/30">
                  Buy SIM Card
                </Link>
                <Link href="#esim" className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-full transition-colors backdrop-blur-sm border border-white/20">
                  Get eSIM Instantly
                </Link>
              </div>
            </div>
            
            <div className="flex-1 mt-12 md:mt-0 flex justify-center">
              <div className="w-[300px] h-[500px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10"></div>
                <div className="w-full h-full bg-gradient-to-b from-blue-500 to-purple-600 flex flex-col p-6 text-white relative">
                  <div className="flex justify-between items-center mb-8 mt-4">
                    <span className="font-bold">5G Network</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-3 bg-white rounded-full"></div>
                      <div className="w-1 h-4 bg-white rounded-full"></div>
                      <div className="w-1 h-5 bg-white rounded-full"></div>
                      <div className="w-1 h-6 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 mb-auto">
                    <h4 className="text-xl font-bold mb-1">USA & Canada Plan</h4>
                    <div className="text-3xl font-black mb-4">50GB <span className="text-sm font-normal">/ 30 Days</span></div>
                    <ul className="space-y-2 text-sm font-medium">
                      <li className="flex items-center"><span className="mr-2">✓</span> Unlimited Incoming</li>
                      <li className="flex items-center"><span className="mr-2">✓</span> 500 Min Outgoing</li>
                      <li className="flex items-center"><span className="mr-2">✓</span> 4G/5G Speeds</li>
                    </ul>
                  </div>
                  
                  <button className="w-full bg-white text-purple-900 font-extrabold py-3 rounded-xl mt-4">Activate Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Plans Section */}
        <div className="max-w-6xl mx-auto py-20 px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Popular Country Plans</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose a physical SIM delivered to your doorstep, or scan a QR code to install an eSIM instantly on compatible devices.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* USA */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-24 bg-blue-50 flex items-center justify-center relative">
                <span className="text-5xl">🇺🇸</span>
              </div>
              <div className="p-6">
                <h3 className="font-extrabold text-gray-900 text-lg mb-1">USA Matrix Plan</h3>
                <div className="text-sm text-gray-500 font-medium mb-4">Valid for 30 Days</div>
                <div className="flex justify-between items-end mb-4">
                  <div className="text-2xl font-black text-blue-600">₹2,499</div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700 font-medium mb-6">
                  <li>Data: <span className="font-bold text-gray-900">Unlimited 5G</span></li>
                  <li>Calls: <span className="font-bold text-gray-900">Unlimited Local</span></li>
                  <li>India Calls: <span className="font-bold text-gray-900">1000 Mins</span></li>
                </ul>
                <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 rounded-xl transition-colors">Select Plan</button>
              </div>
            </div>

            {/* Europe */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow relative">
              <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Bestseller</div>
              <div className="h-24 bg-indigo-50 flex items-center justify-center relative">
                <span className="text-5xl">🇪🇺</span>
              </div>
              <div className="p-6">
                <h3 className="font-extrabold text-gray-900 text-lg mb-1">Europe (33 Countries)</h3>
                <div className="text-sm text-gray-500 font-medium mb-4">Valid for 15 Days</div>
                <div className="flex justify-between items-end mb-4">
                  <div className="text-2xl font-black text-blue-600">₹1,999</div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700 font-medium mb-6">
                  <li>Data: <span className="font-bold text-gray-900">10GB 4G</span></li>
                  <li>Calls: <span className="font-bold text-gray-900">300 Mins EU</span></li>
                  <li>India Calls: <span className="font-bold text-gray-900">Incoming Free</span></li>
                </ul>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition-colors">Select Plan</button>
              </div>
            </div>

            {/* UK */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-24 bg-red-50 flex items-center justify-center relative">
                <span className="text-5xl">🇬🇧</span>
              </div>
              <div className="p-6">
                <h3 className="font-extrabold text-gray-900 text-lg mb-1">UK O2 Network</h3>
                <div className="text-sm text-gray-500 font-medium mb-4">Valid for 30 Days</div>
                <div className="flex justify-between items-end mb-4">
                  <div className="text-2xl font-black text-blue-600">₹1,499</div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700 font-medium mb-6">
                  <li>Data: <span className="font-bold text-gray-900">20GB 5G</span></li>
                  <li>Calls: <span className="font-bold text-gray-900">Unlimited UK</span></li>
                  <li>India Calls: <span className="font-bold text-gray-900">Not Included</span></li>
                </ul>
                <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 rounded-xl transition-colors">Select Plan</button>
              </div>
            </div>

            {/* Global */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-24 bg-teal-50 flex items-center justify-center relative">
                <span className="text-5xl">🌍</span>
              </div>
              <div className="p-6">
                <h3 className="font-extrabold text-gray-900 text-lg mb-1">Global 100+</h3>
                <div className="text-sm text-gray-500 font-medium mb-4">Valid for 30 Days</div>
                <div className="flex justify-between items-end mb-4">
                  <div className="text-2xl font-black text-blue-600">₹3,499</div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700 font-medium mb-6">
                  <li>Data: <span className="font-bold text-gray-900">5GB Roaming</span></li>
                  <li>Calls: <span className="font-bold text-gray-900">Receive Only</span></li>
                  <li>Coverage: <span className="font-bold text-gray-900">120 Countries</span></li>
                </ul>
                <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 rounded-xl transition-colors">Select Plan</button>
              </div>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
