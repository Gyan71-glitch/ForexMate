import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold mb-8">Privacy Policy</h1>
          <div className="prose prose-blue max-w-none text-gray-700">
            <p><strong>Last Updated:</strong> October 2024</p>
            <h3>1. Introduction</h3>
            <p>Welcome to Forexmate. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>
            <h3>2. Data We Collect</h3>
            <p>To provide forex services compliant with RBI regulations, we collect identity data (Passport, PAN, Visa), contact data, and financial data required for KYC.</p>
            <h3>3. How We Use Your Data</h3>
            <p>We use your data exclusively to process your foreign exchange orders, comply with regulatory requirements (FEMA/LRS), and improve our services. We do not sell your data to third parties.</p>
            <h3>4. Data Security</h3>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
