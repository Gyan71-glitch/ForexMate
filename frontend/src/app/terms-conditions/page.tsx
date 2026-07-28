import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold mb-8">Terms & Conditions</h1>
          <div className="prose prose-blue max-w-none text-gray-700">
            <p><strong>Last Updated:</strong> October 2024</p>
            <h3>1. Agreement to Terms</h3>
            <p>By accessing and using Forexmate, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.</p>
            <h3>2. Services Provided</h3>
            <p>Forexmate acts as a technology platform connecting users with RBI-authorized money changers. We do not independently buy or sell forex without authorized partners.</p>
            <h3>3. User Responsibilities</h3>
            <p>Users must provide accurate and verifiable KYC documents. Any attempt to provide forged documents will result in account suspension and reporting to relevant authorities.</p>
            <h3>4. Cancellation and Refunds</h3>
            <p>Once a quote is locked and payment is processed, cancellations may attract a cancellation fee as determined by the live market rates and partner policies.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
