import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function OffersPage() {
  const offers = [
    {
      title: "Get up to ₹7,500 Cashback",
      code: "BIGFXSALE",
      desc: "Buy or sell forex above $1,000 and get guaranteed cashback directly to your bank account.",
      icon: "💰"
    },
    {
      title: "Free Airport Cab Ride",
      code: "FREERIDE",
      desc: "Book a multi-currency card with minimum load of $2,000 and get a free Uber/Ola airport transfer.",
      icon: "🚕"
    },
    {
      title: "Zero Issuance Fee",
      code: "AUTO-APPLIED",
      desc: "Get your Forex Card completely free. No issuance, reload, or inactivity charges.",
      icon: "💳"
    },
    {
      title: "Refer & Earn ₹500",
      code: "REFERRAL",
      desc: "Refer a friend to Forexmate. They get a discount, and you get ₹500 cashback on successful transaction.",
      icon: "🤝"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold tracking-widest uppercase mb-4 inline-block">Exclusive Deals</span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Current Offers & Promo Codes</h1>
            <p className="text-xl text-gray-600">Save big on your international travels and foreign remittances.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {offers.map((offer, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 flex items-center justify-center text-6xl">
                  {offer.icon}
                </div>
                <div className="p-8 flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-gray-600 mb-6">{offer.desc}</p>
                  <div className="bg-gray-100 border border-gray-200 border-dashed rounded-lg p-3 text-center">
                    <span className="text-sm text-gray-500 uppercase font-bold mr-2">Use Code:</span>
                    <span className="font-black text-blue-600 text-lg tracking-wider">{offer.code}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
