import Link from 'next/link';
import { Mail, Phone, ShieldCheck, MapPin, Send, ArrowRight, Heart } from 'lucide-react';

export default function Footer() {
  const topCities = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Gurgaon", "Noida", "Chandigarh", "Jaipur", "Lucknow", "Kochi", "Coimbatore", "Indore", "Surat", "Patna"];
  const topCurrencies = ["USD", "EUR", "GBP", "AUD", "CAD", "SGD", "AED", "CHF", "THB", "NZD"];

  return (
    <footer className="bg-slate-950 text-slate-300 text-sm font-sans border-t border-slate-800/80 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10 pt-16 pb-12">
        
        {/* Top Newsletter & Offer Subscription Strip */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl p-8 mb-16 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-xl">
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              🔥 Daily Rate Alerts & Coupons
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Get Zero Margin Rate Drops In Your Inbox
            </h3>
            <p className="text-slate-400 text-xs font-medium mt-1">
              Subscribe to get daily forex market trends, zero commission promo codes & instant rate alerts before your trip.
            </p>
          </div>

          <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-3 shrink-0">
            <div className="relative flex-1 min-w-[280px]">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl py-3 pl-11 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
              />
            </div>
            <button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0">
              <span>Subscribe Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12 mb-16">
          
          {/* Column 1 */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>Buy Forex In Top Cities</span>
            </div>
            <ul className="space-y-2.5">
              {topCities.slice(0, 9).map(city => (
                <li key={city}>
                  <Link 
                    href={`/currency-exchange/${city.toLowerCase()}`} 
                    className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs flex items-center font-medium"
                  >
                    Currency Exchange in {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 2 */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-blue-500" />
              <span>Send Money Abroad</span>
            </div>
            <ul className="space-y-2.5">
              <li><Link href="/buy-forex?tab=transfer&country=US&currency=USD" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Send Money to USA</Link></li>
              <li><Link href="/buy-forex?tab=transfer&country=GB&currency=GBP" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Send Money to UK</Link></li>
              <li><Link href="/buy-forex?tab=transfer&country=CA&currency=CAD" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Send Money to Canada</Link></li>
              <li><Link href="/buy-forex?tab=transfer&country=AU&currency=AUD" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Send Money to Australia</Link></li>
              <li><Link href="/buy-forex?tab=transfer&country=DE&currency=EUR" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Send Money to Germany</Link></li>
              <li><Link href="/buy-forex?tab=transfer&country=SG&currency=SGD" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Send Money to Singapore</Link></li>
              <li><Link href="/buy-forex?tab=transfer&country=AE&currency=AED" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Send Money to UAE</Link></li>
            </ul>
            
            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 mt-8">Top Currencies</div>
            <ul className="space-y-2">
              {topCurrencies.slice(0, 4).map(curr => (
                <li key={curr}>
                  <Link href={`/currency/${curr.toLowerCase()}`} className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">
                    {curr} Live Rate Today
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Currency Converters</div>
            <ul className="space-y-2.5">
              <li><Link href="/currency-converter/usd-to-inr" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">USD to INR Converter</Link></li>
              <li><Link href="/currency-converter/eur-to-inr" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">EUR to INR Converter</Link></li>
              <li><Link href="/currency-converter/gbp-to-inr" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">GBP to INR Converter</Link></li>
              <li><Link href="/currency-converter/aud-to-inr" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">AUD to INR Converter</Link></li>
              <li><Link href="/currency-converter/cad-to-inr" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">CAD to INR Converter</Link></li>
              <li><Link href="/currency-converter/inr-to-usd" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">INR to USD Converter</Link></li>
              <li><Link href="/currency-converter/inr-to-eur" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">INR to EUR Converter</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Our Services</div>
            <ul className="space-y-2.5">
              <li><Link href="/buy-forex" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Buy Foreign Currency</Link></li>
              <li><Link href="/sell-forex" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Sell Foreign Currency</Link></li>
              <li><Link href="/transfer-money" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Transfer Money Abroad</Link></li>
              <li><Link href="/forex-cards" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Multi-Currency Forex Card</Link></li>
              <li><Link href="/rates" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Live Forex Rates</Link></li>
              <li><Link href="/travel-insurance" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Travel Insurance</Link></li>
              <li><Link href="/international-sim" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">International SIM Card</Link></li>
            </ul>
          </div>

          {/* Column 5 */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Company</div>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">About Us</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Contact Us</Link></li>
              <li><Link href="/staff/login" className="text-indigo-400 hover:text-indigo-300 hover:translate-x-1 transition-all text-xs font-extrabold flex items-center gap-1">🔒 Staff Portal</Link></li>
              <li><Link href="/faqs" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">FAQs</Link></li>
              <li><Link href="/offers" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Current Offers</Link></li>
              <li><Link href="/privacy" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all text-xs font-medium">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Accepted Payment Methods & Security Seals Strip */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-extrabold text-white">100% RBI Authorized & Regulated FFMC</div>
              <div className="text-[11px] text-slate-400 font-medium">License No: NDL-FFMC-0093-2023 | 100% Insured Delivery</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 text-xs font-bold mr-2">We Accept:</span>
            <span className="bg-slate-950 text-slate-200 border border-slate-800 px-3 py-1 rounded-lg text-xs font-extrabold shadow-sm">VISA</span>
            <span className="bg-slate-950 text-slate-200 border border-slate-800 px-3 py-1 rounded-lg text-xs font-extrabold shadow-sm">Mastercard</span>
            <span className="bg-slate-950 text-slate-200 border border-slate-800 px-3 py-1 rounded-lg text-xs font-extrabold shadow-sm">RuPay</span>
            <span className="bg-slate-950 text-emerald-400 border border-slate-800 px-3 py-1 rounded-lg text-xs font-extrabold shadow-sm">UPI Instant</span>
            <span className="bg-slate-950 text-blue-400 border border-slate-800 px-3 py-1 rounded-lg text-xs font-extrabold shadow-sm">NetBanking</span>
            <span className="bg-slate-950 text-orange-400 border border-slate-800 px-3 py-1 rounded-lg text-xs font-extrabold shadow-sm">Pay on Delivery</span>
          </div>
        </div>

        <hr className="border-slate-800/80 w-full mb-10" />

        {/* Bottom Contact & Legal Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="max-w-2xl">
            <div className="text-blue-500 font-black text-3xl tracking-tighter italic mb-3 flex items-center">
              Forex<span className="text-orange-500">mate</span>
              <span className="ml-2 text-[10px] not-italic bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                RBI Approved
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
              Forexmate Pvt. Ltd. is a currency exchange platform authorized by the Reserve Bank of India (RBI). License number: NDL-FFMC-0093-2023. Insurance is the subject matter of solicitation | IRDAI Registration No. CA0429. *Zero margin rates are available on select forex cards in 65+ Indian cities for orders amounting to ₹1.5 Lakh or more. Same-day delivery available Monday to Friday for orders placed before 1:00 PM.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-5 w-full lg:w-auto">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">24/7 Helpline</p>
                  <p className="text-white font-black text-lg tracking-tight">+91-9212219191</p>
                </div>
              </div>
              <div className="w-px h-10 bg-slate-800"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Email Support</p>
                  <p className="text-white font-bold text-sm">hello@forexmate.com</p>
                </div>
              </div>
            </div>
            
            {/* Social Icons */}
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 hover:border-rose-500 transition-all shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center text-xs text-slate-400 font-medium flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Forexmate Pvt. Ltd. All rights reserved.</div>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Global Travelers in India
          </div>
        </div>
        
      </div>
    </footer>
  );
}
