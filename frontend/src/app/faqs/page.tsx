import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function FAQsPage() {
  const faqs = [
    {
      q: "How does Forexmate offer better rates than banks?",
      a: "Unlike banks that load markup fees of 2-5% on base rates, we operate on a zero-margin live interbank rate model. We aggregate rates from hundreds of RBI-licensed changers to give you the lowest possible rate."
    },
    {
      q: "How long does it take for doorstep delivery?",
      a: "If you place your order before 1 PM, we guarantee same-day doorstep delivery within 4 hours. Orders placed after 1 PM are delivered the next working day."
    },
    {
      q: "What documents are required to buy forex?",
      a: "For leisure travel, you need a valid Passport, Visa (if applicable for destination), Confirmed Air Ticket within 60 days of travel, and PAN card."
    },
    {
      q: "Can I reload my Forex Card while abroad?",
      a: "Absolutely! You can reload your Multi-Currency Forex Card instantly 24/7 through the Forexmate Dashboard or Mobile App. Funds reflect almost immediately."
    },
    {
      q: "What is the maximum amount of foreign currency I can carry?",
      a: "As per RBI guidelines (LRS), an Indian resident can remit or carry up to USD 250,000 per financial year for personal travel, education, or medical treatment."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-black text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600">Everything you need to know about buying, selling, and transferring forex.</p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">Q.</span> {faq.q}
                </h3>
                <p className="text-gray-600 leading-relaxed ml-7">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-blue-600 rounded-3xl p-10 text-center text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="mb-8 opacity-90">Our forex experts are available 24/7 to help you out.</p>
            <button className="bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:bg-gray-50">Contact Support</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
