import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function FAQPage() {
  const faqs = [
    {
      q: "What documents are required to buy foreign currency?",
      a: "As per RBI guidelines, you need to submit a valid Passport, PAN Card, Visa (for the destination country), and a confirmed Air Ticket. For amounts over $250,000 equivalent, additional documentation may be required."
    },
    {
      q: "Can I get same-day delivery?",
      a: "Yes, orders placed and successfully verified before 1:00 PM are generally delivered on the same day in our serviceable cities. Orders placed after 1:00 PM are delivered on the next working day."
    },
    {
      q: "What is the maximum amount I can carry in cash?",
      a: "Under the Liberalised Remittance Scheme (LRS), an Indian resident can buy up to $3000 (or equivalent) in foreign currency notes per trip abroad. The remaining amount up to the $250,000 limit must be carried in a Forex Card or Travellers Cheques."
    },
    {
      q: "Is it safe to buy forex online?",
      a: "Absolutely. Forexmate partners only with RBI-authorized Category II Authorized Dealers and Banks. All transactions are fully encrypted, and cash is delivered by verified personnel."
    },
    {
      q: "Can I load multiple currencies on a single Forex card?",
      a: "Yes, our multi-currency forex cards support up to 14 different currencies on a single card, allowing you to avoid cross-currency markup fees when traveling to multiple countries."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-600 text-lg">
              Find answers to common questions about buying, selling, and transferring forex.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-3">{faq.q}</h3>
                <p className="text-gray-700 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
