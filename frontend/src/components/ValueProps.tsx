export default function ValueProps() {
  return (
    <div className="w-full max-w-6xl mx-auto mb-16 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 border border-slate-200/80 rounded-3xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-orange-500/20 mb-5 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">Zero Forex Markup</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">Interbank live exchange rates with 0% margin guaranteed across major world currencies.</p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-orange-600">
            <span>Interbank Guarantee</span>
            <span>&rarr;</span>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 border border-slate-200/80 rounded-3xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-blue-600/20 mb-5 group-hover:scale-110 transition-transform">
              🚀
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Same-Day Doorstep Delivery</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">Pay on delivery at your home or office in 65+ major Indian cities with full RBI verification.</p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-blue-600">
            <span>65+ Cities Covered</span>
            <span>&rarr;</span>
          </div>
        </div>
        
        {/* Card 3 */}
        <div className="bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 border border-slate-200/80 rounded-3xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-emerald-600/20 mb-5 group-hover:scale-110 transition-transform">
              🌍
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">Forex for All Travel Needs</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">Leisure travel, university overseas tuition, medical remittances & corporate travel solutions.</p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-emerald-600">
            <span>100% RBI LRS Compliant</span>
            <span>&rarr;</span>
          </div>
        </div>

      </div>
    </div>
  );
}
