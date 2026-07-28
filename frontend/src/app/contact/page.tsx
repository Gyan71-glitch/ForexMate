import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Contact Us</h1>
            <p className="text-gray-600 text-lg">
              We're here to help! Reach out to our customer support team for any queries regarding your forex transactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
                <div className="text-3xl">📞</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Phone Support</h3>
                  <p className="text-gray-600">1800-123-4567 (Toll Free)</p>
                  <p className="text-sm text-gray-500 mt-1">Mon-Sat, 9:00 AM - 9:00 PM</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
                <div className="text-3xl">✉️</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Email Us</h3>
                  <p className="text-blue-600 font-medium">support@forexmate.com</p>
                  <p className="text-sm text-gray-500 mt-1">We aim to reply within 2 hours</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
                <div className="text-3xl">🏢</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Corporate Office</h3>
                  <p className="text-gray-600">Sector 62, Noida, Uttar Pradesh, 201309</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                    <option>General Inquiry</option>
                    <option>Order Status</option>
                    <option>KYC Issue</option>
                    <option>Corporate Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="How can we help?"></textarea>
                </div>
                <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                  Submit Message
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
