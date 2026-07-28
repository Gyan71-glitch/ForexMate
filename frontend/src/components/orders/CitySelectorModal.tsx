import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';

const popularCities = [
  { name: 'Delhi', state: 'Delhi (NCT)', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=100&h=100&fit=crop' },
  { name: 'Bangalore', state: 'Karnataka', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=100&h=100&fit=crop' },
  { name: 'Mumbai', state: 'Maharashtra', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=100&h=100&fit=crop' },
  { name: 'Pune', state: 'Maharashtra', img: 'https://images.unsplash.com/photo-1584443912952-671cb0a84592?w=100&h=100&fit=crop' },
  { name: 'Hyderabad', state: 'Telangana', img: 'https://images.unsplash.com/photo-1626297380963-0a75c1dd5e2e?w=100&h=100&fit=crop' },
  { name: 'Chennai', state: 'Tamil Nadu', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=100&h=100&fit=crop' }
];

const allCities = [
  { name: 'Agra', state: 'Uttar Pradesh' },
  { name: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Amritsar', state: 'Punjab' },
  { name: 'Anand', state: 'Gujarat' },
  { name: 'Aurangabad', state: 'Maharashtra' },
  { name: 'Bareilly', state: 'Uttar Pradesh' },
  { name: 'Bhopal', state: 'Madhya Pradesh' },
  { name: 'Bhubaneswar', state: 'Odisha' },
  { name: 'Chandigarh', state: 'Chandigarh' },
  { name: 'Coimbatore', state: 'Tamil Nadu' },
  { name: 'Dehradun', state: 'Uttarakhand' },
  { name: 'Dilsukh Nagar', state: 'Telangana' },
  { name: 'Ernakulam', state: 'Kerala' },
  { name: 'Faridabad', state: 'Haryana' },
  { name: 'Ghaziabad', state: 'Uttar Pradesh' },
  { name: 'Goa', state: 'Goa' },
  { name: 'Guntur', state: 'Andhra Pradesh' },
  { name: 'Gurgaon', state: 'Haryana' },
  { name: 'Guwahati', state: 'Assam' },
  { name: 'Gwalior', state: 'Madhya Pradesh' },
  { name: 'Hoshiarpur', state: 'Punjab' },
  { name: 'Hosur', state: 'Tamil Nadu' },
  { name: 'Indore', state: 'Madhya Pradesh' },
  { name: 'Jabalpur', state: 'Madhya Pradesh' },
  { name: 'Jaipur', state: 'Rajasthan' },
  { name: 'Jalandhar', state: 'Punjab' },
  { name: 'Jammu', state: 'Jammu and Kashmir' },
  { name: 'Kanpur', state: 'Uttar Pradesh' },
  { name: 'Karnal', state: 'Haryana' },
  { name: 'Kochi', state: 'Kerala' },
  { name: 'Kolkata', state: 'West Bengal' },
  { name: 'Kozhikode', state: 'Kerala' },
  { name: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Ludhiana', state: 'Punjab' },
  { name: 'Madurai', state: 'Tamil Nadu' },
  { name: 'Mangalore', state: 'Karnataka' },
  { name: 'Mohali', state: 'Punjab' },
  { name: 'Mysore', state: 'Karnataka' },
  { name: 'Nagapattinam', state: 'Tamil Nadu' },
  { name: 'Nagpur', state: 'Maharashtra' },
  { name: 'Nashik', state: 'Maharashtra' },
  { name: 'Navi Mumbai', state: 'Maharashtra' },
  { name: 'Navsari', state: 'Gujarat' },
  { name: 'Nawanshahar', state: 'Punjab' },
  { name: 'Nellore', state: 'Andhra Pradesh' },
  { name: 'Noida', state: 'Uttar Pradesh' },
  { name: 'Panchkula', state: 'Haryana' },
  { name: 'Panvel', state: 'Maharashtra' },
  { name: 'Patiala', state: 'Punjab' },
  { name: 'Patna', state: 'Bihar' },
  { name: 'Raipur', state: 'Chhattisgarh' },
  { name: 'Rajkot', state: 'Gujarat' },
  { name: 'Ranchi', state: 'Jharkhand' },
  { name: 'Salem', state: 'Tamil Nadu' },
  { name: 'Secunderabad', state: 'Telangana' },
  { name: 'Surat', state: 'Gujarat' },
  { name: 'Thane', state: 'Maharashtra' },
  { name: 'Thiruvananthapuram', state: 'Kerala' },
  { name: 'Udaipur', state: 'Rajasthan' },
  { name: 'Vadodara', state: 'Gujarat' },
  { name: 'Varanasi', state: 'Uttar Pradesh' },
  { name: 'Vijayawada', state: 'Andhra Pradesh' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { name: 'Warangal', state: 'Telangana' }
];

export function CitySelectorModal({ 
  isOpen, 
  onClose, 
  onSelect 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSelect: (city: string) => void 
}) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredPopular = popularCities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.state.toLowerCase().includes(search.toLowerCase()));
  const filteredAll = allCities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.state.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute -right-3 -top-3 md:-right-6 md:-top-6 text-white hover:text-gray-200 bg-gray-900/50 hover:bg-gray-900 rounded-full p-2 transition-colors z-[101]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header / Search */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-blue-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="City Name" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-blue-200 focus:border-blue-500 rounded-lg outline-none text-[15px] text-gray-900 font-medium transition-colors shadow-sm"
              autoFocus
            />
          </div>
          <button className="flex items-center text-blue-600 font-bold text-sm shrink-0 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
            <MapPin className="w-4 h-4 mr-1.5" /> Detect Location
          </button>
        </div>

        {/* Lists Container */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          
          {/* Popular Cities */}
          {filteredPopular.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-10">
                <span className="font-extrabold text-gray-900 text-sm">Popular Cities</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">State</span>
              </div>
              <div className="space-y-1">
                {filteredPopular.map(city => (
                  <div 
                    key={city.name} 
                    onClick={() => { onSelect(city.name); onClose(); }}
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer rounded-xl group transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden mr-4 bg-gray-100 border border-gray-200 shrink-0">
                        {city.img ? (
                           <img src={city.img} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                           <div className="w-full h-full bg-blue-100 text-blue-500 flex items-center justify-center font-bold text-lg">{city.name.charAt(0)}</div>
                        )}
                      </div>
                      <span className="font-bold text-[14px] text-gray-900 group-hover:text-blue-600 transition-colors">{city.name}</span>
                    </div>
                    <span className="text-[13px] text-gray-500 font-medium">{city.state}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Cities */}
          {filteredAll.length > 0 && (
            <div>
              <div className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-10 border-t border-gray-100 mt-2">
                <span className="font-extrabold text-gray-900 text-sm">{search ? 'Search Results' : 'All Cities'}</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">State</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {filteredAll.map(city => (
                  <div 
                    key={city.name} 
                    onClick={() => { onSelect(city.name); onClose(); }}
                    className="flex justify-between items-center px-5 py-2.5 hover:bg-gray-50 cursor-pointer rounded-lg group transition-colors"
                  >
                    <span className="font-bold text-gray-700 text-[14px] group-hover:text-blue-600">{city.name}</span>
                    <span className="text-[12px] text-gray-400 font-medium">{city.state}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredPopular.length === 0 && filteredAll.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                 <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No cities found</h3>
              <p className="text-gray-500 text-sm">We couldn't find a city matching "{search}"</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
