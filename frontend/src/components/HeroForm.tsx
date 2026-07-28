"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRates } from '@/hooks/useRates';
import { useTransactionStore } from '@/stores/transactionStore';
import { ShieldCheck, Truck, LockKeyhole, Banknote, TrendingUp, Send, Globe, ChevronDown, Info } from 'lucide-react';
import { CitySelectorModal } from './orders/CitySelectorModal';

const DEFAULT_CURRENCIES = [
  { code: "USD", name: "US Dollar", rate: "94.95", country: "United States", flag: "🇺🇸", popular: true },
  { code: "AED", name: "UAE Dirham", rate: "25.91", country: "United Arab Emirates", flag: "🇦🇪", popular: true },
  { code: "THB", name: "Thai Baht", rate: "2.88", country: "Thailand", flag: "🇹🇭", popular: true },
  { code: "EUR", name: "Euro", rate: "107.76", country: "Eurozone", flag: "🇪🇺", popular: true },
  { code: "SGD", name: "Singapore Dollar", rate: "73.24", country: "Singapore", flag: "🇸🇬", popular: true },
];

const getFlagEmoji = (currencyCode: string | undefined) => {
  if (!currencyCode) return '🌍';
  if (currencyCode === 'EUR') return '🇪🇺';
  if (currencyCode === 'INR') return '🇮🇳';
  const countryCode = currencyCode.substring(0, 2);
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '🌍';
  }
};

const getCurrencyName = (currencyCode: string) => {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
    return displayNames.of(currencyCode) || currencyCode;
  } catch (e) {
    return currencyCode;
  }
};

const getCountryName = (currencyCode: string) => {
  if (currencyCode === 'EUR') return 'Eurozone';
  try {
    const countryCode = currencyCode.substring(0, 2);
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return displayNames.of(countryCode) || currencyCode;
  } catch (e) {
    return currencyCode;
  }
};

export default function HeroForm({ defaultTab = 'buy' }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [cardType, setCardType] = useState('card');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES);
  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCIES[0]);

  const [foreignAmount, setForeignAmount] = useState<string>('');
  const [inrAmount, setInrAmount] = useState<string>('');
  
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);

  const [deliveryInfo, setDeliveryInfo] = useState<{ dayText: string; pillText: string }>({
    dayText: 'Today',
    pillText: 'By today, 9 PM'
  });

  useEffect(() => {
    const updateCutoff = () => {
      const currentHour = new Date().getHours();
      // If order is placed between 12:00 AM (0) and 1:00 PM (13), delivery is TODAY
      if (currentHour < 13) {
        setDeliveryInfo({
          dayText: 'Today',
          pillText: 'By today, 9 PM'
        });
      } else {
        // Exceeds 1:00 PM (13:00) cutoff ➔ shifts to TOMORROW
        setDeliveryInfo({
          dayText: 'Tomorrow',
          pillText: 'By tomorrow, 9 PM'
        });
      }
    };
    updateCutoff();
    const interval = setInterval(updateCutoff, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const router = useRouter();
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data } = useRates();

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      const apiCurrencies = data
        .filter((item: any) => item.currency.code !== 'INR')
        .map((item: any) => ({
          code: item.currency.code,
          name: getCurrencyName(item.currency.code),
          rate: item.inrRate.toFixed(2),
          country: getCountryName(item.currency.code),
          flag: getFlagEmoji(item.currency.code),
          popular: ['USD', 'EUR', 'GBP', 'AED', 'SGD', 'CAD', 'AUD'].includes(item.currency.code)
        }))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      if (apiCurrencies.length > 5) {
        setCurrencies(apiCurrencies);
        
        // Re-select current currency to get updated rate and metadata
        setSelectedCurrency(prev => {
          const updated = apiCurrencies.find(c => c.code === prev.code);
          return updated || prev;
        });
      }
    }
  }, [data]);

  // Ensure cardType is notes for sell orders
  useEffect(() => {
    if (activeTab === 'sell') {
      setCardType('notes');
    }
  }, [activeTab]);

  // Recalculate when currency changes
  useEffect(() => {
    if (foreignAmount && selectedCurrency.rate) {
      const baseRate = parseFloat(selectedCurrency.rate);
      const rate = activeTab === 'sell' ? baseRate - 0.63 : (cardType === 'notes' ? baseRate + 0.63 : baseRate);
      setInrAmount((parseFloat(foreignAmount) * rate).toFixed(2));
    }
  }, [selectedCurrency, activeTab, cardType]);

  const handleForeignAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForeignAmount(val);
    if (val && selectedCurrency.rate) {
      const baseRate = parseFloat(selectedCurrency.rate);
      const rate = activeTab === 'sell' ? baseRate - 0.63 : (cardType === 'notes' ? baseRate + 0.63 : baseRate);
      setInrAmount((parseFloat(val) * rate).toFixed(2));
    } else {
      setInrAmount('');
    }
  };

  const handleInrAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInrAmount(val);
    if (val && selectedCurrency.rate) {
      const baseRate = parseFloat(selectedCurrency.rate);
      const rate = activeTab === 'sell' ? baseRate - 0.63 : (cardType === 'notes' ? baseRate + 0.63 : baseRate);
      setForeignAmount((parseFloat(val) / rate).toFixed(2));
    } else {
      setForeignAmount('');
    }
  };

  const handleBuyNow = () => {
    if (!foreignAmount || !inrAmount) {
      alert("Please enter an amount first");
      return;
    }
    useTransactionStore.getState().clearSession();
    
    const targetUrl = `/buy-forex?tab=${activeTab}&type=${cardType}&currency=${selectedCurrency.code}&amount=${foreignAmount}&inr=${inrAmount}`;
    router.push(targetUrl);
  };

  const filteredCurrencies = currencies.filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.country || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularFiltered = filteredCurrencies.filter(c => c.popular);
  const othersFiltered = filteredCurrencies.filter(c => !c.popular);

  return (
    <div className="w-full max-w-6xl mx-auto mt-2 mb-16 relative z-10 font-sans">
      
      <div className="mb-10 text-left pt-2">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.08]">
          YOUR JOURNEY.<br />
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
            OUR CURRENCY.
          </span>
        </h1>
        <p className="text-slate-200 text-sm md:text-base font-medium mt-3 max-w-2xl leading-relaxed">
          Best forex rates, zero markup, doorstep delivery and trusted by 1M+ happy customers across India.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2 flex items-center gap-3 text-white shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-300 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-white">Zero Forex Markup</p>
              <p className="text-[10px] text-slate-300 font-medium">Best rates guaranteed</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2 flex items-center gap-3 text-white shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-sm">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-white">Doorstep Delivery</p>
              <p className="text-[10px] text-slate-300 font-medium">{deliveryInfo.pillText}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2 flex items-center gap-3 text-white shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-sm">
              <LockKeyhole className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-white">100% Secure</p>
              <p className="text-[10px] text-slate-300 font-medium">RBI Licensed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center -mb-2 relative z-20">
        <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-800 flex overflow-hidden gap-1">
          
          <button 
            onClick={() => setActiveTab('buy')}
            className={`px-8 py-3.5 flex items-center justify-center gap-2 rounded-xl transition-all duration-200 min-w-[150px] font-extrabold text-xs cursor-pointer ${
              activeTab === 'buy' 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Buy Forex</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('sell')}
            className={`px-8 py-3.5 flex items-center justify-center gap-2 rounded-xl transition-all duration-200 min-w-[150px] font-extrabold text-xs cursor-pointer ${
              activeTab === 'sell' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sell Forex</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('transfer')}
            className={`px-8 py-3.5 flex items-center justify-center gap-2 rounded-xl transition-all duration-200 min-w-[150px] font-extrabold text-xs cursor-pointer ${
              activeTab === 'transfer' 
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Transfer Money</span>
          </button>

        </div>
      </div>

      {/* Main Container with Travel & Finance Background Texture */}
      <div className="bg-white/95 rounded-3xl shadow-[0_35px_80px_-20px_rgba(15,23,42,0.22)] pb-12 pt-7 px-8 relative border border-slate-200/80 ring-1 ring-slate-900/5 transition-all">
        {/* Background Texture Overlay */}
        <div 
          className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none bg-cover bg-center z-0 opacity-30"
          style={{ backgroundImage: `url('/card_bg.png')` }}
        />
        
        {/* Content Wrapper Z-10 */}
        <div className="relative z-10">
        
        {/* Delivery Info & Promo */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center text-sm text-gray-700">
            {activeTab === 'transfer' ? (
              <>
                <Globe className="w-4 h-4 text-blue-600 inline mr-2" /> Direct Bank-to-Bank Transfer | <span className="font-bold mx-1">100% RBI LRS Compliant</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4 text-orange-500 inline mr-2" /> Doorstep Delivery by <span className="font-bold mx-1">{deliveryInfo.dayText}, 9:00 PM in</span> 
                <button
                  type="button" 
                  onClick={() => setIsCityModalOpen(true)}
                  className="text-blue-600 font-extrabold ml-1 inline-flex items-center bg-blue-50/80 hover:bg-blue-100 px-2.5 py-0.5 rounded-lg border border-blue-200/60 transition-colors text-xs cursor-pointer shadow-2xs"
                >
                  {selectedCity} <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-blue-600" />
                </button>
                <div className="relative inline-block ml-2">
                  <button 
                    type="button"
                    onClick={() => setShowDeliveryInfo(!showDeliveryInfo)}
                    onMouseEnter={() => setShowDeliveryInfo(true)}
                    onMouseLeave={() => setShowDeliveryInfo(false)}
                    className="text-gray-400 hover:text-blue-600 cursor-pointer text-xs"
                  >
                    ⓘ
                  </button>
                  {showDeliveryInfo && (
                    <div className="absolute left-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none font-medium leading-relaxed border border-slate-700">
                      🚚 <strong>Doorstep Delivery Policy:</strong><br />
                      Orders placed before 1:00 PM are delivered same-day by 9:00 PM. Orders past 1:00 PM are delivered next day by 9:00 PM.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center">
            {activeTab === 'transfer' ? 'Zero Commission Wire Transfer' : 'Upto ₹7,500 Cashback'} <span className="ml-1 opacity-60 font-normal">ⓘ</span>
          </div>
        </div>

        <hr className="border-gray-200 mb-6" />

        {/* Form Fields Row */}
        <div className="flex flex-col md:flex-row gap-0">
          
          {/* Column 1: Currency */}
          <div className="flex-1 md:pr-6 md:border-r border-gray-200 mb-6 md:mb-0 relative" ref={dropdownRef}>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">CURRENCY</label>
            <div 
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -ml-2 rounded-lg transition-colors border border-transparent hover:border-gray-200"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div>
                <div className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="mr-2">{selectedCurrency.flag}</span>
                  {selectedCurrency.name}
                </div>
                <div className="text-xs text-gray-500 font-semibold mt-0.5">{selectedCurrency.code}</div>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>

            {/* Custom Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-[80px] left-0 w-[400px] bg-white border border-gray-200 shadow-2xl rounded-xl z-50 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-gray-100">
                  <div className="relative">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                      type="text" 
                      placeholder="Search Currency" 
                      className="w-full border border-blue-400 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex justify-between px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <span>{searchQuery ? 'Search Results' : 'Popular Currencies'}</span>
                  <span>Country</span>
                </div>

                <div className="overflow-y-auto max-h-[350px]">
                  {/* Popular Currencies */}
                  {popularFiltered.map((curr, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                      onClick={() => {
                        setSelectedCurrency(curr);
                        setIsDropdownOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{curr.flag}</span>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{curr.name}</div>
                          <div className="text-xs text-gray-500 font-medium">Rate: <span className="font-bold text-gray-900">{curr.rate ? `${curr.rate} INR` : 'N/A'}</span></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-right max-w-[120px] truncate" title={curr.country}>
                        {curr.country}
                      </div>
                    </div>
                  ))}

                  {/* All Currencies Header */}
                  {!searchQuery && othersFiltered.length > 0 && (
                    <div className="flex justify-between px-4 py-2 bg-gray-50 border-y border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <span>All Currencies</span>
                      <span>Country</span>
                    </div>
                  )}

                  {/* Other Currencies */}
                  {othersFiltered.map((curr, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                      onClick={() => {
                        setSelectedCurrency(curr);
                        setIsDropdownOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{curr.flag}</span>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{curr.name}</div>
                          <div className="text-xs text-gray-500 font-medium">Rate: <span className="font-bold text-gray-900">{curr.rate ? `${curr.rate} INR` : 'N/A'}</span></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-right max-w-[120px] truncate" title={curr.country}>
                        {curr.country}
                      </div>
                    </div>
                  ))}
                  
                  {filteredCurrencies.length === 0 && (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No currencies found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Choose Card/Notes / Transfer Mode */}
          <div className="flex-[2] md:px-6 md:border-r border-gray-200 mb-6 md:mb-0">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3 flex items-center">
              {activeTab === 'transfer' ? 'TRANSFER MODE' : 'CHOOSE CARD/CURRENCY NOTES'} <span className="ml-1 cursor-help">ⓘ</span>
            </label>
            
            <div className="flex gap-4">
              {activeTab === 'transfer' ? (
                <label className="flex-1 border border-indigo-600 bg-indigo-50/50 rounded-xl p-3 flex items-center cursor-pointer shadow-sm">
                  <div className="w-8 h-6 bg-indigo-600 rounded mr-3 shadow flex items-center justify-center text-[10px] text-white font-bold">🏦</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Direct Wire Transfer</div>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">1 {selectedCurrency.code} = ₹{selectedCurrency.rate || 'N/A'} (Zero Mark-up)</div>
                  </div>
                </label>
              ) : (
                <>
                  {/* Card Option (Hidden/Disabled for Sell) */}
                  {activeTab !== 'sell' && (
                    <label className={`flex-1 border rounded-xl p-3 flex items-center cursor-pointer transition-all ${cardType === 'card' ? 'border-gray-900 bg-gray-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="forex_type" className="w-4 h-4 text-blue-600 focus:ring-0 mr-3" checked={cardType === 'card'} onChange={() => setCardType('card')} />
                      <div className="w-8 h-6 bg-gradient-to-r from-blue-900 to-blue-700 rounded mr-3 shadow flex items-center justify-center text-[8px] text-white font-bold tracking-tighter">CARD</div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">Multi Currency Card</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">1 {selectedCurrency.code} = ₹{selectedCurrency.rate || 'N/A'}</div>
                      </div>
                    </label>
                  )}

                  {/* Notes Option */}
                  <label className={`flex-1 border rounded-xl p-3 flex items-center cursor-pointer transition-all ${cardType === 'notes' || activeTab === 'sell' ? 'border-gray-900 bg-gray-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="forex_type" className="w-4 h-4 text-blue-600 focus:ring-0 mr-3" checked={cardType === 'notes' || activeTab === 'sell'} onChange={() => setCardType('notes')} disabled={activeTab === 'sell'} />
                    <div className="w-8 h-6 bg-green-100 rounded mr-3 border border-green-200 flex items-center justify-center text-[10px]">💵</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{selectedCurrency.code} Currency Notes</div>
                      <div className="text-xs text-gray-500 font-medium mt-0.5">
                        1 {selectedCurrency.code} = ₹{selectedCurrency.rate ? (parseFloat(selectedCurrency.rate) + (activeTab === 'sell' ? -0.63 : 0.63)).toFixed(2) : 'N/A'}
                      </div>
                    </div>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Column 3: Amount Inputs */}
          <div className="flex-[2.2] md:pl-6 relative flex items-start gap-4 pt-0.5">
            
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">{selectedCurrency.code} AMOUNT</label>
              <input 
                type="text" 
                placeholder="Enter Amount" 
                className="w-full text-base lg:text-lg font-bold text-gray-900 border-b border-gray-300 focus:border-blue-600 focus:outline-none pb-1.5 placeholder-gray-300 bg-transparent"
                value={foreignAmount}
                onChange={handleForeignAmountChange}
              />
              <div className="text-[11px] text-gray-500 mt-2 font-medium whitespace-nowrap">
                {activeTab === 'sell' ? 'Live Sell Rate' : 'Live Rate'} ₹{selectedCurrency.rate ? (parseFloat(selectedCurrency.rate) + (activeTab === 'sell' ? -0.63 : 0.63)).toFixed(2) : 'N/A'}
              </div>
            </div>

            {/* OR Badge */}
            <div className="mt-8 bg-gray-100 text-gray-400 rounded-full w-6 h-6 flex items-center justify-center text-[9px] font-bold shrink-0 border border-white">
              OR
            </div>

            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">INR AMOUNT</label>
              <input 
                type="text" 
                placeholder="Enter Amount" 
                className="w-full text-base lg:text-lg font-bold text-gray-900 border-b border-gray-300 focus:border-blue-600 focus:outline-none pb-1.5 placeholder-gray-300 bg-transparent"
                value={inrAmount}
                onChange={handleInrAmountChange}
              />
            </div>

          </div>

        </div>

        {/* Footer info inside card */}
        <div className="mt-8 flex items-center text-xs text-gray-800 font-medium">
          <span className="text-yellow-500 mr-2">✨</span>
          {activeTab === 'transfer' ? 'Direct Bank-to-Bank Wire Transfer via RBI Authorized AD-II Partners' : 'Genuine Notes from RBI Licensed Companies'}
        </div>

        </div>
        {/* End of content wrapper z-10 */}

        {/* Floating Buy/Sell/Transfer Now Button */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-30">
          <button 
            onClick={handleBuyNow}
            className={`text-white font-extrabold text-lg px-12 py-3 rounded-full transition-transform hover:scale-105 active:scale-95 tracking-wide shadow-lg ${
              activeTab === 'sell' 
                ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30' 
                : activeTab === 'transfer'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  : 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/30'
            }`}
          >
            {activeTab === 'sell' ? 'SELL NOW' : activeTab === 'transfer' ? 'TRANSFER NOW' : 'BUY NOW'}
          </button>
        </div>

      </div>

      <CitySelectorModal 
        isOpen={isCityModalOpen} 
        onClose={() => setIsCityModalOpen(false)} 
        onSelect={(city) => {
          setSelectedCity(city);
          setIsCityModalOpen(false);
        }} 
      />
    </div>
  );
}
