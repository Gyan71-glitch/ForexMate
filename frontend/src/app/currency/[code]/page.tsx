import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default async function CurrencyPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = await params;
  const code = resolvedParams.code.toUpperCase();
  
  // We can fetch the specific rate from our API, but for static generation in this demo,
  // we will just use the code to generate the page. In a real app we'd await fetch(`.../rates/${code}`)
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white pt-16 pb-24 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
            <div className="flex-1 pr-10">
              <span className="bg-blue-800 text-blue-100 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6 inline-block">Live Rates</span>
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                {code} Exchange Rate
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-xl">
                Get the best {code} to INR exchange rates today. Buy, sell, or remit {code} with zero markup fees and free doorstep delivery.
              </p>
              <div className="flex space-x-4">
                <Link href={`/booking?currency=${code}`} className="bg-orange-500 hover:bg-orange-400 text-white font-extrabold px-8 py-3 rounded-full transition-transform hover:scale-105 shadow-lg shadow-orange-500/30">
                  Book Order Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto py-16 px-6 -mt-16">
           <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
             <h2 className="text-3xl font-black text-gray-900 mb-6">Why buy {code} from Forexmate?</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-600">
               <div>
                 <h4 className="font-bold text-gray-900 text-lg mb-2 flex items-center"><span className="text-green-500 mr-2">✓</span> Zero Markup Rates</h4>
                 <p>We provide live interbank rates for {code} with absolutely no hidden margins, saving you up to 5% compared to banks.</p>
               </div>
               <div>
                 <h4 className="font-bold text-gray-900 text-lg mb-2 flex items-center"><span className="text-green-500 mr-2">✓</span> Same Day Delivery</h4>
                 <p>Order {code} currency notes or forex cards before 1 PM and get them delivered to your doorstep on the exact same day.</p>
               </div>
               <div>
                 <h4 className="font-bold text-gray-900 text-lg mb-2 flex items-center"><span className="text-green-500 mr-2">✓</span> Authentic Currency</h4>
                 <p>All {code} currency notes are sourced directly from RBI-authorized money changers and undergo strict counterfeit checks.</p>
               </div>
               <div>
                 <h4 className="font-bold text-gray-900 text-lg mb-2 flex items-center"><span className="text-green-500 mr-2">✓</span> Block Your Rate</h4>
                 <p>Lock in your preferred {code} exchange rate for up to 3 days by paying a refundable 2% advance.</p>
               </div>
             </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
