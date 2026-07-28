import Link from 'next/link';

export default function PromoBanner() {
  return (
    <div className="w-full max-w-6xl mx-auto mb-20 font-sans">
      <div className="bg-gradient-to-r from-blue-50 to-white border border-gray-200 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-sm">
        
        {/* Left Content */}
        <div className="md:w-3/5 relative z-10">
          <div className="bg-teal-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4">LIFETIME FREE</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            Hassle-Free Payments Promised for International Trips
          </h2>
          
          <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8">
            <div className="flex items-center text-sm font-bold text-gray-700">
              <span className="text-orange-500 mr-2">|</span> Zero Reload & Unload Fees
            </div>
            <div className="flex items-center text-sm font-bold text-gray-700">
              <span className="text-orange-500 mr-2">|</span> Zero Forex Markup
            </div>
            <div className="flex items-center text-sm font-bold text-gray-700">
              <span className="text-orange-500 mr-2">|</span> Real-time Spends Tracking
            </div>
            <div className="flex items-center text-sm font-bold text-gray-700">
              <span className="text-orange-500 mr-2">|</span> Refund Anytime
            </div>
          </div>

          <Link href="/forex-cards" className="inline-block border-2 border-gray-200 hover:border-gray-900 text-gray-900 bg-white font-extrabold text-sm px-8 py-3 rounded-xl transition-colors tracking-wide text-center">
            GET YOUR CARD NOW
          </Link>
        </div>

        {/* Right Images (Cards) */}
        <div className="md:w-2/5 mt-10 md:mt-0 relative z-10 flex justify-center md:justify-end">
          <div className="relative w-64 h-40">
            {/* Back Card */}
            <div className="absolute top-0 right-0 w-56 h-32 bg-gray-900 rounded-xl shadow-2xl transform rotate-6 p-4 flex flex-col justify-between border border-gray-700">
              <div className="text-gray-400 text-xs font-bold self-end">VISA</div>
              <div className="w-8 h-6 bg-yellow-600 rounded-sm opacity-50"></div>
            </div>
            
            {/* Front Card */}
            <div className="absolute bottom-0 left-0 w-56 h-32 bg-gradient-to-tr from-blue-900 to-gray-900 rounded-xl shadow-2xl transform -rotate-3 p-4 flex flex-col justify-between border border-gray-700">
               {/* Arrow graphic */}
               <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
               </div>
              <div className="flex justify-between w-full z-10">
                <div className="w-8 h-6 bg-yellow-400 rounded-sm"></div>
                <div className="text-white font-black italic">VISA</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
