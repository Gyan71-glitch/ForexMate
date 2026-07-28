import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroForm from '@/components/HeroForm';
import RatesRibbon from '@/components/RatesRibbon';
import dynamic from 'next/dynamic';

const ValueProps = dynamic(() => import('@/components/ValueProps'));
const ExploreProducts = dynamic(() => import('@/components/ExploreProducts'));
const TrustSection = dynamic(() => import('@/components/TrustSection'));
const Testimonials = dynamic(() => import('@/components/Testimonials'));
const PromoBanner = dynamic(() => import('@/components/PromoBanner'));
const MediaMentions = dynamic(() => import('@/components/MediaMentions'));
const FAQSection = dynamic(() => import('@/components/FAQSection'));

export default function SellForexPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* Blue Top Background for Hero - Sell Accent (Emerald) */}
      <div className="absolute top-0 left-0 w-full h-[360px] bg-blue-900 border-b-4 border-emerald-500 z-0"></div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 relative z-10 pt-20">
        
        {/* Split Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          {/* Left Hero Content */}
          <div className="lg:col-span-5 text-white pr-4 py-8 lg:py-0">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Sell Foreign Currency at the Best Rates
            </h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Exchange your foreign currency quickly, securely, and at competitive live exchange rates. Complete online KYC and get paid directly to your bank.
            </p>
            <a 
              href="#quote-card-section"
              className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-lg px-10 py-4 rounded-full shadow-[0_10px_20px_-10px_rgba(16,185,129,0.8)] transition-all hover:scale-105 active:scale-95 tracking-wide"
            >
              Sell Now
            </a>
          </div>

          {/* Right Hero Quote Card Form */}
          <div id="quote-card-section" className="lg:col-span-7">
            <HeroForm defaultTab="sell" />
          </div>
        </div>

        <RatesRibbon />
        <ValueProps />
        <ExploreProducts />
        <TrustSection />
        <Testimonials />
        <PromoBanner />
        <MediaMentions />
        <FAQSection />

      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
