import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">About Forexmate</h1>
            <p className="text-gray-600 text-lg">
              India's most trusted online foreign exchange marketplace, revolutionizing how you buy, sell, and transfer currency across borders.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-12">
            <h2 className="text-2xl font-bold mb-4 border-b pb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              At Forexmate, we believe that exchanging foreign currency should be as easy, transparent, and fair as buying any other product online. For decades, the forex market in India has been plagued by hidden markups, fluctuating rates, and poor customer service. We are here to change that.
            </p>

            <h2 className="text-2xl font-bold mb-4 border-b pb-4">Why We Started</h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              Founded in 2024 by a team of ex-bankers and tech innovators, Forexmate was born out of personal frustration with opaque banking fees and tedious KYC processes. We built a platform that directly connects customers with RBI-authorized money changers, bypassing middlemen to offer live interbank rates.
            </p>

            <h2 className="text-2xl font-bold mb-4 border-b pb-4">Our Compliance Commitment</h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              Security and regulatory compliance are the cornerstones of our operations. We operate strictly under the guidelines of the Reserve Bank of India (RBI) and the Foreign Exchange Management Act (FEMA). Every transaction is logged, every document is securely verified, and every partner is vetted to ensure your money is always safe.
            </p>
          </div>
          
        </div>
      </main>
      <Footer />
    </div>
  );
}
