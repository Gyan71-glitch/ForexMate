import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroForm from '@/components/HeroForm';
import FAQSection from '@/components/FAQSection';
import Link from 'next/link';

export default function TransferMoneyPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 overflow-x-hidden">
      <Navbar />

      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white pt-16 pb-40 px-6 border-b-4 border-indigo-500 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Send Money Abroad <span className="text-orange-400">Securely</span></h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto">International money transfers via Wire Transfer & Demand Drafts directly from authorized Indian banks at guaranteed lowest rates.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 -mt-28">
        <HeroForm defaultTab="transfer" />
        
        {/* Purpose of Remittance Grid */}
        <div className="mt-24 mb-20 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Why are you sending money abroad?</h2>
          <p className="text-gray-500 mb-12">Select your purpose to view specific RBI limits, required documents, and TCS tax implications.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform cursor-pointer">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">🎓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Overseas Education</h3>
              <p className="text-gray-600 text-sm mb-4">Pay university tuition fees directly to the institution or send living expenses to student accounts.</p>
              <div className="bg-blue-50 text-blue-800 text-xs font-bold py-2 px-4 rounded-full inline-block">0.5% TCS over ₹7 Lakhs</div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform cursor-pointer">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Family Maintenance</h3>
              <p className="text-gray-600 text-sm mb-4">Send funds to close relatives staying abroad for their daily maintenance and living expenses.</p>
              <div className="bg-orange-50 text-orange-800 text-xs font-bold py-2 px-4 rounded-full inline-block">20% TCS over ₹7 Lakhs</div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform cursor-pointer">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">🏥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Medical Treatment</h3>
              <p className="text-gray-600 text-sm mb-4">Transfer money to foreign hospitals or for patient's living expenses during treatment.</p>
              <div className="bg-emerald-50 text-emerald-800 text-xs font-bold py-2 px-4 rounded-full inline-block">5% TCS over ₹7 Lakhs</div>
            </div>
          </div>
        </div>

        {/* Process Flow */}
        <div className="mb-24 bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-black text-gray-900 mb-6">Fully Digital Process. No branch visits.</h2>
              
              <div className="space-y-6">
                <div className="flex">
                  <div className="mr-6 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold relative z-10">1</div>
                    <div className="w-0.5 h-full bg-blue-200 my-2"></div>
                  </div>
                  <div className="pb-6">
                    <h4 className="text-lg font-bold text-gray-900">Add Beneficiary Details</h4>
                    <p className="text-gray-600 text-sm">Enter the foreign bank account details (SWIFT Code, IBAN/Routing number).</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-6 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold relative z-10">2</div>
                    <div className="w-0.5 h-full bg-blue-200 my-2"></div>
                  </div>
                  <div className="pb-6">
                    <h4 className="text-lg font-bold text-gray-900">Upload KYC</h4>
                    <p className="text-gray-600 text-sm">Upload PAN Card and address proof. Provide university offer letter if remitting for education.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-6 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold relative z-10">3</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Transfer Funds</h4>
                    <p className="text-gray-600 text-sm">Transfer INR to the designated RBI-approved bank account via NEFT/RTGS.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <span className="font-bold text-gray-800">Track Transfer</span>
                  <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">In Progress</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Funds Received</span>
                    </div>
                    <span className="text-xs text-gray-400">10:45 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">KYC Verified</span>
                    </div>
                    <span className="text-xs text-gray-400">11:30 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-600">SWIFT Generated</span>
                    </div>
                    <span className="text-xs text-gray-400">Processing</span>
                  </div>
                  <div className="flex justify-between items-center opacity-50">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Credited to Beneficiary</span>
                    </div>
                    <span className="text-xs text-gray-400">Est. 24hrs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FAQSection />
      </div>

      <Footer />
    </div>
  );
}
