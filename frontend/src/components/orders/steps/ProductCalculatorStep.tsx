import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTransactionStore } from '@/stores/transactionStore';
import { useQuoteStore } from '@/stores/quoteStore';
import { useRates } from '@/hooks/useRates';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Calendar, Briefcase, Plus, Edit2, Info, CheckCircle2, Ticket, Globe, Landmark, User2, X, ChevronDown } from 'lucide-react';
import { CitySelectorModal } from '../CitySelectorModal';
import { getActiveBranches } from '@/lib/api-public';
import { AddressSelector } from '../AddressSelector';
import API_URL, { authFetch, apiJson } from '@/lib/api';

// ─── Remittance Types ───────────────────────────────────────────────────────
interface TransferPurpose {
  id: string;
  code: string;
  name: string;
  description: string;
  tcsRateAbove: number;
  tcsThreshold: number;
  documentRequirements: { docType: string }[];
}

interface CountryConfig {
  id: string;
  countryCode: string;
  countryName: string;
  currencyCode: string;
}

interface Beneficiary {
  id: string;
  name: string;
  bankName: string;
  ibanOrAccountNumber: string;
  swiftCode: string;
  country: string;
}

export function ProductCalculatorStep() {
  const { draftState, updateDraft, allowedActions, sessionId } = useTransactionStore();
  const { lockQuote, isLocking } = useQuoteStore();
  const { data: rates } = useRates();
  const searchParams = useSearchParams();

  const [deliveryDay, setDeliveryDay] = useState<'Today' | 'Tomorrow'>('Today');
  const [cutoffTimer, setCutoffTimer] = useState<string>('00h : 00m');

  useEffect(() => {
    const updateCutoff = () => {
      const now = new Date();
      const currentHour = now.getHours();
      if (currentHour < 13) {
        setDeliveryDay('Today');
        const target = new Date();
        target.setHours(13, 0, 0, 0);
        const diffMs = Math.max(0, target.getTime() - now.getTime());
        const hrs = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(2, '0');
        const mins = String(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        setCutoffTimer(`${hrs}h : ${mins}m`);
      } else {
        setDeliveryDay('Tomorrow');
        const target = new Date();
        target.setDate(target.getDate() + 1);
        target.setHours(13, 0, 0, 0);
        const diffMs = Math.max(0, target.getTime() - now.getTime());
        const hrs = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(2, '0');
        const mins = String(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        setCutoffTimer(`${hrs}h : ${mins}m`);
      }
    };
    updateCutoff();
    const interval = setInterval(updateCutoff, 10000);
    return () => clearInterval(interval);
  }, []);

  // Initialize draft state from URL parameters
  useEffect(() => {
    if (sessionId) {
      const type = searchParams?.get('type');
      const tab = searchParams?.get('tab');
      const intent = searchParams?.get('intent');
      const paramCurrency = searchParams?.get('currency');
      const paramAmount = searchParams?.get('amount');
      
      const updates: any = {};
      if (!draftState.product) {
        if (tab === 'sell' || intent === 'SELL') {
          updates.product = 'CASH_SELL';
        } else if (tab === 'transfer') {
          updates.product = 'REMITTANCE';
        } else {
          updates.product = type === 'notes' ? 'CASH' : type === 'card' ? 'CARD' : 'CASH';
        }
      }
      if (!draftState.currency) {
        updates.currency = paramCurrency || 'USD';
      }
      if (!draftState.amount && paramAmount) {
        updates.amount = paramAmount;
      }
      
      if (Object.keys(updates).length > 0) {
        updateDraft(updates);
      }
    }
  }, [sessionId, searchParams]);

  const product = draftState.product || 'CASH'; // Default to CASH
  const isSell = product === 'CASH_SELL';
  const isRemittance = product === 'REMITTANCE';
  const currency = draftState.currency || 'SGD';
  const amount = draftState.amount || '';
  const branchId = draftState.branchId || '';
  const deliveryMethod = draftState.deliveryMethod || 'PICKUP';

  // Travel Details
  const destination = draftState.destination || '';
  const departureDate = draftState.departureDate || '';
  const returnDate = draftState.returnDate || '';
  const noReturnDate = draftState.noReturnDate || false;
  const purpose = draftState.purpose || '';
  const selectedCity = draftState.city || 'Delhi';

  // Remittance-specific state
  const [transferPurposes, setTransferPurposes] = useState<TransferPurpose[]>([]);
  const [countries, setCountries] = useState<CountryConfig[]>([]);
  const [savedBeneficiaries, setSavedBeneficiaries] = useState<Beneficiary[]>([]);
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [newBenName, setNewBenName] = useState('');
  const [newBenBank, setNewBenBank] = useState('');
  const [newBenAccount, setNewBenAccount] = useState('');
  const [newBenSwift, setNewBenSwift] = useState('');
  const [newBenAddress, setNewBenAddress] = useState('');
  const [remCalc, setRemCalc] = useState<any>(null);
  const [isCalcLoading, setIsCalcLoading] = useState(false);

  // Fetch remittance lookup data
  // Fetch remittance lookup data
  useEffect(() => {
    if (!isRemittance) return;
    const fetchData = async () => {
      try {
        const [purposesRes, countriesRes] = await Promise.all([
          fetch(`${API_URL}/public/remittance-purposes`),
          fetch(`${API_URL}/public/remittance-countries`),
        ]);
        const [purposes, ctries] = await Promise.all([
          apiJson<TransferPurpose[]>(purposesRes),
          apiJson<CountryConfig[]>(countriesRes),
        ]);
        setTransferPurposes(purposes || []);
        setCountries(ctries || []);
      } catch (err) {
        console.error('Failed to load remittance lookup data:', err);
      }

      // Separately attempt to fetch saved beneficiaries (requires auth)
      try {
        const benRes = await authFetch(`${API_URL}/remittances/beneficiaries`);
        if (benRes.ok) {
          const bens = await apiJson<Beneficiary[]>(benRes);
          setSavedBeneficiaries(bens || []);
        }
      } catch (err) {
        // Guest user or unauthenticated
        setSavedBeneficiaries([]);
      }
    };
    fetchData();
  }, [isRemittance]);

  // Auto-sync currency when country changes for remittance
  useEffect(() => {
    if (!isRemittance || !draftState.countryCode) return;
    const found = countries.find(c => c.countryCode === draftState.countryCode);
    if (found && found.currencyCode !== currency) {
      updateDraft({ currency: found.currencyCode });
    }
  }, [draftState.countryCode, countries]);

  // Debounced TCS/Fee calculation for remittance
  useEffect(() => {
    if (!isRemittance || !amount || !currency || !draftState.countryCode || !draftState.purposeCode) return;
    const timer = setTimeout(async () => {
      setIsCalcLoading(true);
      try {
        const res = await authFetch(
          `${API_URL}/remittances/calculate?amount=${amount}&currency=${currency}&countryCode=${draftState.countryCode}&purposeCode=${draftState.purposeCode}`
        );
        if (res.ok) {
          const calc = await apiJson<any>(res);
          setRemCalc(calc);
          updateDraft({
            feeAmount: calc.feeAmount,
            tcsAmount: calc.tcsAmount,
          });
        }
      } catch (err) {
        console.error('Calculation failed:', err);
      } finally {
        setIsCalcLoading(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [amount, currency, draftState.countryCode, draftState.purposeCode, isRemittance]);

  const [isEditingAmount, setIsEditingAmount] = useState(!amount);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);

  // Fetch active branches
  useEffect(() => {
    getActiveBranches()
      .then((data) => {
        if (Array.isArray(data)) {
          setBranches(data);
          // Auto-select the first branch if branchId is not set
          if (data.length > 0 && !draftState.branchId) {
            updateDraft({ branchId: data[0].id });
          }
        }
      })
      .catch((err) => console.error('Failed to fetch branches:', err));
  }, []);

  // Pre-fill mock dates and purpose for Cash Sell to bypass regular travel details validation
  useEffect(() => {
    if (product === 'CASH_SELL') {
      const updates: any = {};
      if (!draftState.departureDate) {
        updates.departureDate = new Date().toISOString().split('T')[0];
      }
      if (!draftState.purpose) {
        updates.purpose = 'CASH_SELL_DECLARATION';
      }
      if (Object.keys(updates).length > 0) {
        updateDraft(updates);
      }
    }
    // Pre-fill remittance dates too (not required but referenced by engine)
    if (product === 'REMITTANCE') {
      const updates: any = {};
      if (!draftState.departureDate) {
        updates.departureDate = new Date().toISOString().split('T')[0];
      }
      if (!draftState.purpose) {
        updates.purpose = 'REMITTANCE';
      }
    }
  }, [product, draftState.departureDate, draftState.purpose]);

  const canGetQuote = allowedActions.includes('GET_QUOTE');
  const [isSavingBeneficiary, setIsSavingBeneficiary] = useState(false);

  // Remittance: add new beneficiary helper with debouncing & deduplication guard
  const handleAddNewBeneficiary = async () => {
    if (isSavingBeneficiary || !newBenName || !newBenBank || !newBenAccount || !newBenSwift) return;
    setIsSavingBeneficiary(true);
    try {
      const res = await authFetch(`${API_URL}/remittances/beneficiaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBenName,
          bankName: newBenBank,
          ibanOrAccountNumber: newBenAccount,
          swiftCode: newBenSwift.toUpperCase(),
          address: newBenAddress,
          country: countries.find(c => c.countryCode === draftState.countryCode)?.countryName || '',
        }),
      });
      if (res.status === 401) {
        alert("Please sign in to save your beneficiary.");
        window.location.href = `/login?redirect=/buy-forex?tab=transfer`;
        return;
      }
      const newBen = await apiJson<Beneficiary>(res);
      setSavedBeneficiaries(prev => {
        if (prev.some(b => b.id === newBen.id || (b.ibanOrAccountNumber === newBen.ibanOrAccountNumber && b.swiftCode === newBen.swiftCode))) {
          return prev;
        }
        return [newBen, ...prev];
      });
      updateDraft({ beneficiaryId: newBen.id, beneficiaryName: newBen.name });
      setShowAddBeneficiary(false);
      setNewBenName(''); setNewBenBank(''); setNewBenAccount(''); setNewBenSwift(''); setNewBenAddress('');
    } catch (err: any) {
      console.error('Failed to add beneficiary:', err);
      alert(err.message || 'Please login to add a beneficiary.');
    } finally {
      setIsSavingBeneficiary(false);
    }
  };

  // Find the rate for the selected currency
  const currencyRateData = Array.isArray(rates) ? rates.find(r => r.currency?.code === currency || r.currency === currency) : null;
  const rawRate = currencyRateData ? (currencyRateData.inrRate || currencyRateData.rate) : null;
  
  // Adjust rate slightly based on product (Card usually cheaper than Cash, Sell has margins subtracted)
  const adjustedRate = rawRate
    ? (product === 'CASH_SELL' ? rawRate - 0.63 : product === 'CASH' ? rawRate + 0.63 : rawRate)
    : null;
  
  const inrEquivalent = adjustedRate && amount ? (parseFloat(amount) * adjustedRate) : 0;
  
  // Fee breakdown (mimicking the screenshot)
  const parsedAmount = parseFloat(amount) || 0;
  const serviceCharge = parsedAmount > 0 ? 150 : 0;
  const gst = parsedAmount > 0 ? (inrEquivalent ? Math.round(inrEquivalent * 0.0018) : 119) : 0;
  const cashback = parsedAmount > 0 ? 300 : 0;

  const payableAmount = product === 'CASH_SELL'
    ? (parsedAmount > 0 && inrEquivalent ? (inrEquivalent - serviceCharge - gst) : 0)
    : (parsedAmount > 0 && inrEquivalent ? (inrEquivalent + serviceCharge + gst) : 0);

  const netEffective = product === 'CASH_SELL'
    ? (payableAmount > 0 ? payableAmount + cashback : 0) // Cashback bonus adds to received cash
    : (payableAmount > 0 ? Math.max(0, payableAmount - cashback) : 0);

  const handleQuote = async () => {
    if (!product || !currency || !amount) {
      alert("Please enter a valid amount.");
      return;
    }
    const { sessionId } = useTransactionStore.getState();
    if (!sessionId) return;
    
    await lockQuote(sessionId, {
      product,
      currency,
      amount: Number(amount),
      branchId,
    });
    
    const errorMsg = useQuoteStore.getState().lockError;
    if (errorMsg && errorMsg.toLowerCase().includes('unauthorized')) {
      useQuoteStore.getState().clearQuote();
      window.location.href = `/login?redirect=/buy-forex`;
      return;
    }
    
    await useTransactionStore.getState().fetchWorkflow();
  };

  const getCurrencyName = (code: string) => {
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
      return displayNames.of(code) || code;
    } catch {
      return code;
    }
  };

  const currencyName = getCurrencyName(currency);
  const productName = product === 'CASH_SELL'
    ? 'Foreign Currency Notes Sell'
    : product === 'REMITTANCE'
      ? 'International Money Transfer'
      : product === 'CASH'
        ? 'Foreign Currency Notes'
        : product === 'CARD'
          ? 'Forex Card'
          : 'International Money Transfer';

  const selectedPurposeObj = transferPurposes.find(p => p.code === draftState.purposeCode);
  const selectedBeneficiary = savedBeneficiaries.find(b => b.id === draftState.beneficiaryId);

  const getEligibilityMessage = () => {
    if (product === 'CASH_SELL') {
      if (draftState.deliveryMethod === 'HOME_DELIVERY') {
        return <span>You are eligible for <strong className="text-gray-700">Doorstep Collection</strong></span>;
      }
      return <span>You are eligible for <strong className="text-gray-700">Branch Visit Encashment</strong></span>;
    }
    if (product === 'CARD') {
      return <span>Pre-payment required for <strong className="text-gray-700">Card Issuance</strong></span>;
    }
    if (product === 'REMITTANCE') {
      return <span>100% RBI LRS Compliant <strong className="text-gray-700">International Wire Transfer</strong></span>;
    }
    if (draftState.deliveryMethod === 'HOME_DELIVERY') {
      return <span>You are eligible for <strong className="text-gray-700">Pay On Delivery</strong></span>;
    }
    return <span>You are eligible for <strong className="text-gray-700">Pay At Branch</strong></span>;
  };

  return (
    <div className="bg-white/95 rounded-b-xl border-t border-slate-200/80 p-0 sm:p-6 shadow-md min-h-screen sm:min-h-0 text-left relative overflow-hidden">
      {/* Background Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none bg-cover bg-center z-0 opacity-40"
        style={{ backgroundImage: `url('/card_bg.png')` }}
      />

      <div className="relative z-10">
      
      {/* Top Banner Info */}
      <div className="mb-6 flex flex-wrap items-center gap-4 text-[13px] font-medium text-gray-700">
        <div className="flex items-center">
          <span className="mr-1 text-lg">🛵</span> Doorstep Delivery by <span className="font-bold text-gray-900 mx-1">{deliveryDay}, 9:00 PM</span> in 
          <span 
            className="text-blue-600 font-bold ml-1 cursor-pointer hover:underline"
            onClick={() => setIsCityModalOpen(true)}
          >
            {selectedCity} ▾
          </span>
        </div>
        <div className="flex items-center bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold border border-orange-200">
          <span className="mr-1 opacity-70">⏱</span> {cutoffTimer} <Info className="w-3.5 h-3.5 ml-1 opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Funnel Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Required Amount Card */}
          <Card className="shadow-sm border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-6 pb-5">
              <h2 className="text-[17px] font-bold text-gray-900 mb-5">Required Amount</h2>
              
              <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4 w-full">
                  <div className="font-bold text-gray-900 w-1/3 min-w-[140px] text-[15px]">{currencyName}</div>
                  
                  {isEditingAmount ? (
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="number"
                        className="border border-gray-300 rounded px-3 py-1.5 w-32 focus:outline-none focus:border-blue-500 font-medium bg-white"
                        value={amount}
                        onChange={e => updateDraft({ amount: e.target.value })}
                        placeholder="Amount"
                        autoFocus
                      />
                      <span className="text-gray-500 self-center">{currency}</span>
                      <Button size="sm" variant="outline" className="ml-2 bg-white" onClick={() => setIsEditingAmount(false)}>Save</Button>
                    </div>
                  ) : (
                    <div className="flex-1 text-gray-700 flex items-center font-medium">
                      <span>{amount || 0} {currency} = <span className="font-bold text-gray-900">₹ {inrEquivalent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></span>
                      <button onClick={() => setIsEditingAmount(true)} className="ml-3 text-blue-600 text-xs font-bold flex items-center hover:underline">
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                
                <button className="text-gray-400 hover:text-red-500 transition-colors ml-4 shrink-0">
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">-</div>
                </button>
              </div>

              <div className="mt-5">
                <button className="text-blue-600 font-bold text-[13px] flex items-center hover:underline">
                  + Add Another Currency
                </button>
              </div>
            </div>
          </Card>

          {/* Fulfillment Options Card — SHOWN ONLY FOR CASH BUY, CASH SELL & CARD */}
          {!isRemittance && (
            <Card className="shadow-sm border-gray-200 rounded-2xl">
              <div className="p-6">
                <h2 className="text-[17px] font-bold text-gray-900 mb-2">Fulfillment Options</h2>
                <p className="text-[13px] text-gray-500 mb-6">
                  {product === 'CASH_SELL' ? 'Choose how you would like to hand over your foreign currency' : 'Choose how you would like to receive your foreign exchange'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div 
                    onClick={() => updateDraft({ deliveryMethod: 'PICKUP' })}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${deliveryMethod === 'PICKUP' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className="font-bold text-gray-900 mb-1">
                      {product === 'CASH_SELL' ? 'Branch Visit' : 'Branch Pickup'}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {product === 'CASH_SELL' ? 'Visit our branch office to verify cash & get paid' : 'Collect notes/card directly from our branch office'}
                    </div>
                  </div>
                  
                  <div 
                    onClick={() => updateDraft({ deliveryMethod: 'HOME_DELIVERY' })}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${deliveryMethod === 'HOME_DELIVERY' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className="font-bold text-gray-900 mb-1">
                      {product === 'CASH_SELL' ? 'Home Collection' : 'Home Delivery'}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {product === 'CASH_SELL' ? 'Our executive will collect currency notes from your doorstep' : 'Get it delivered safely to your home or office address'}
                    </div>
                  </div>
                </div>

                {deliveryMethod === 'PICKUP' ? (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <label className="block text-[13px] font-bold text-gray-900 mb-1">Select Pickup Branch</label>
                    <select 
                      value={branchId}
                      onChange={(e) => updateDraft({ branchId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none bg-white font-medium text-gray-700"
                    >
                      <option value="">Choose Branch</option>
                      {branches.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.branchName} ({b.branchCity}) - {b.branchAddress}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-200">
                    <AddressSelector 
                      value={draftState.deliveryAddress || ''}
                      onChange={(compiled, addressId) => updateDraft({ deliveryAddress: compiled, addressId })}
                    />
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ─── REMITTANCE SPECIFIC FUNNEL (REORDERED & DYNAMIC) ─────────────────────────────── */}
          {isRemittance && (
            <>
              {/* 1. Transfer Details (Country, Purpose, Source of Funds, Relationship) */}
              <Card className="shadow-sm border-gray-200 rounded-2xl">
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-[17px] font-bold text-gray-900 mb-1">Transfer Details</h2>
                    <p className="text-[13px] text-gray-500">Select destination country and transfer information.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Destination Country */}
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-indigo-600" />
                        Destination Country *
                      </label>
                      <select
                        value={draftState.countryCode || ''}
                        onChange={e => updateDraft({ countryCode: e.target.value })}
                        className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white outline-none font-medium text-gray-800"
                      >
                        <option value="">Select Destination Country</option>
                        {countries.map(c => (
                          <option key={c.id} value={c.countryCode}>
                            {c.countryName} ({c.currencyCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Purpose Selector */}
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                        Purpose of Remittance *
                      </label>
                      <select
                        value={draftState.purposeCode || ''}
                        onChange={e => updateDraft({ purposeCode: e.target.value, destination: e.target.value })}
                        className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white outline-none font-medium text-gray-800"
                      >
                        <option value="">Select Purpose</option>
                        {transferPurposes.map(p => (
                          <option key={p.id} value={p.code}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Source of Funds & Relationship */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2">Source of Funds</label>
                      <select
                        value={draftState.sourceOfFunds || ''}
                        onChange={e => updateDraft({ sourceOfFunds: e.target.value })}
                        className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white outline-none font-medium text-gray-800"
                      >
                        <option value="">Select Source</option>
                        <option value="SALARY">Salary / Personal Income</option>
                        <option value="SAVINGS">Personal Savings</option>
                        <option value="BUSINESS">Business Income</option>
                        <option value="LOAN">Bank Education/Personal Loan</option>
                        <option value="GIFT">Gift / Family Contribution</option>
                        <option value="INVESTMENT">Investment Liquidation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2">Relationship with Beneficiary</label>
                      <select
                        value={draftState.relationship || ''}
                        onChange={e => updateDraft({ relationship: e.target.value })}
                        className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white outline-none font-medium text-gray-800"
                      >
                        <option value="">Select Relationship</option>
                        <option value="SELF">Self</option>
                        <option value="SPOUSE">Spouse</option>
                        <option value="CHILD">Child</option>
                        <option value="PARENT">Parent</option>
                        <option value="SIBLING">Sibling</option>
                        <option value="FRIEND">Relative / Friend</option>
                        <option value="INSTITUTION">University / Institution</option>
                        <option value="BUSINESS">Vendor / Business Partner</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 2. Beneficiary Selection Card */}
              <Card className="shadow-sm border-gray-200 rounded-2xl">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-[17px] font-bold text-gray-900">Beneficiary Details</h2>
                      <p className="text-[13px] text-gray-500">Select who will receive the funds abroad.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddBeneficiary(!showAddBeneficiary)}
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Add Beneficiary
                    </Button>
                  </div>

                  {/* Add New Beneficiary Inline Form */}
                  {showAddBeneficiary && (
                    <div className="border border-dashed border-indigo-300 rounded-xl p-4 bg-indigo-50/30 space-y-3 animate-in fade-in duration-200">
                      <p className="text-[12px] font-bold text-indigo-700 uppercase tracking-wider">New Foreign Beneficiary</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 mb-1 block">Full Name *</label>
                          <input
                            value={newBenName}
                            onChange={e => setNewBenName(e.target.value)}
                            placeholder="e.g. Harvard University or John Doe"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white outline-none bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 mb-1 block">Bank Name *</label>
                          <input
                            value={newBenBank}
                            onChange={e => setNewBenBank(e.target.value)}
                            placeholder="e.g. Bank of America"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white outline-none bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 mb-1 block">IBAN / Account Number *</label>
                          <input
                            value={newBenAccount}
                            onChange={e => setNewBenAccount(e.target.value)}
                            placeholder="e.g. 123456789012"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white outline-none bg-white font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 mb-1 block">SWIFT / BIC Code *</label>
                          <input
                            value={newBenSwift}
                            onChange={e => setNewBenSwift(e.target.value.toUpperCase())}
                            placeholder="e.g. BOFAUS3N"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white outline-none bg-white font-mono uppercase font-bold"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[11px] font-bold text-gray-600 mb-1 block">Bank Address</label>
                          <input
                            value={newBenAddress}
                            onChange={e => setNewBenAddress(e.target.value)}
                            placeholder="e.g. Boston, MA, USA"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white outline-none bg-white font-medium"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={handleAddNewBeneficiary}
                          disabled={isSavingBeneficiary || !newBenName || !newBenBank || !newBenAccount || !newBenSwift}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50"
                        >
                          {isSavingBeneficiary ? 'Saving...' : 'Save & Select Beneficiary'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowAddBeneficiary(false)}
                          className="text-gray-500"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Saved Beneficiaries List */}
                  {savedBeneficiaries.length > 0 ? (
                    <div className="space-y-2">
                      {savedBeneficiaries.map(ben => (
                        <div
                          key={ben.id}
                          onClick={() => updateDraft({ beneficiaryId: ben.id, beneficiaryName: ben.name })}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            draftState.beneficiaryId === ben.id
                              ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                              : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                {ben.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{ben.name}</p>
                                <p className="text-[11px] text-gray-500 font-medium">{ben.bankName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-[11px] text-gray-600 font-bold">{ben.ibanOrAccountNumber}</p>
                              <p className="text-[10px] text-gray-400 font-semibold uppercase">SWIFT: {ben.swiftCode}</p>
                            </div>
                          </div>
                          {draftState.beneficiaryId === ben.id && (
                            <div className="mt-2 flex items-center gap-1 text-indigo-600 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Selected Beneficiary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                      <Landmark className="w-8 h-8 mx-auto text-indigo-400 opacity-60" />
                      <p className="text-xs font-bold text-gray-700">No beneficiaries found.</p>
                      <p className="text-[11px] text-gray-500">Add your beneficiary account to continue with your transfer.</p>
                      <Button
                        size="sm"
                        onClick={() => setShowAddBeneficiary(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                      >
                        + Add Beneficiary
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* 3. Assigned Forexmate Branch Card (Only for Cash Buy & Sell, NOT for Outward Remittance) */}
              {!isRemittance && (
                <Card className="shadow-sm border-gray-200 rounded-2xl">
                  <div className="p-6 space-y-3">
                    <div>
                      <h2 className="text-[17px] font-bold text-gray-900">Assigned Forexmate Branch</h2>
                      <p className="text-[13px] text-gray-500">This branch will verify your documents and process your compliance request.</p>
                    </div>
                    <select
                      value={branchId}
                      onChange={(e) => updateDraft({ branchId: e.target.value })}
                      className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white outline-none font-medium text-gray-800"
                    >
                      <option value="">Choose Assigned Branch</option>
                      {branches.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.branchName} ({b.branchCity}) - {b.branchAddress}
                        </option>
                      ))}
                    </select>
                  </div>
                </Card>
              )}


              {/* 4. Dynamic Purpose-Specific Fields Card (Education / Medical / Travel) */}
              {draftState.purposeCode === 'TRAVEL' && (
                <Card className="shadow-sm border-gray-200 rounded-2xl animate-in fade-in duration-200">
                  <div className="p-6 space-y-4">
                    <h2 className="text-[17px] font-bold text-gray-900">Travel Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Departure Date *</label>
                        <input
                          type="date"
                          value={departureDate}
                          onChange={(e) => updateDraft({ departureDate: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Return Date (Optional)</label>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => updateDraft({ returnDate: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {draftState.purposeCode === 'EDUCATION' && (
                <Card className="shadow-sm border-gray-200 rounded-2xl animate-in fade-in duration-200">
                  <div className="p-6 space-y-4">
                    <h2 className="text-[17px] font-bold text-gray-900">University / Education Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">University / College Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Harvard University"
                          value={draftState.universityName || ''}
                          onChange={(e) => updateDraft({ universityName: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Student ID / Roll No. (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. STU-2026-99"
                          value={draftState.studentId || ''}
                          onChange={(e) => updateDraft({ studentId: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {draftState.purposeCode === 'MEDICAL' && (
                <Card className="shadow-sm border-gray-200 rounded-2xl animate-in fade-in duration-200">
                  <div className="p-6 space-y-4">
                    <h2 className="text-[17px] font-bold text-gray-900">Hospital / Medical Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Hospital / Clinic Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Mayo Clinic"
                          value={draftState.hospitalName || ''}
                          onChange={(e) => updateDraft({ hospitalName: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-1">Hospital Country</label>
                        <input
                          type="text"
                          placeholder="e.g. USA"
                          value={draftState.hospitalCountry || ''}
                          onChange={(e) => updateDraft({ hospitalCountry: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* 5. Required Documents Preview Banner */}
              {selectedPurposeObj && (
                <div className="bg-indigo-50/70 border border-indigo-150 rounded-2xl p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    Required Documents Preview
                  </div>
                  <p className="text-xs text-indigo-700 font-medium">
                    Based on your selected purpose (<strong className="font-bold">{selectedPurposeObj.name}</strong>), you will be asked to upload the following documents after placing your order:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="bg-white border border-indigo-200 text-indigo-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                      ✔ PAN Card
                    </span>
                    <span className="bg-white border border-indigo-200 text-indigo-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                      ✔ Passport
                    </span>
                    {selectedPurposeObj.documentRequirements.map((d, i) => (
                      <span key={i} className="bg-white border border-indigo-200 text-indigo-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                        ✔ {d.docType.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Travel Details / Source of Currency Card — SHOWN ONLY FOR CASH SELL & CASH BUY / CARD */}
          {!isRemittance && (
            product === 'CASH_SELL' ? (
              <Card className="shadow-sm border-gray-200 rounded-2xl">
                <div className="p-6">
                  <h2 className="text-[17px] font-bold text-gray-900">Source of Foreign Currency</h2>
                  <p className="text-[13px] text-gray-500 mb-6 font-medium">Please declare the source of the foreign currency you wish to encash.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[13px] font-bold text-gray-950 mb-2">Select Source of Currency</label>
                      <select
                        value={['Returned from Overseas Travel', 'Salary Earned Abroad', 'Gift', 'Business Income', 'Savings'].includes(destination) ? destination : destination ? 'Other' : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'Other') {
                            updateDraft({ destination: '' });
                          } else {
                            updateDraft({ destination: val });
                          }
                        }}
                        className="w-full md:w-1/2 border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-xs focus:border-emerald-500 focus:bg-white outline-none text-gray-700 font-bold"
                      >
                        <option value="">-- Choose Source --</option>
                        <option value="Returned from Overseas Travel">Returned from Overseas Travel</option>
                        <option value="Salary Earned Abroad">Salary Earned Abroad</option>
                        <option value="Gift">Gift</option>
                        <option value="Business Income">Business Income</option>
                        <option value="Savings">Savings</option>
                        <option value="Other">Other (Please specify)</option>
                      </select>
                    </div>

                    {/* Show specification field if destination is not in list but is not empty */}
                    {(destination && !['Returned from Overseas Travel', 'Salary Earned Abroad', 'Gift', 'Business Income', 'Savings'].includes(destination)) || 
                    (!destination && !['Returned from Overseas Travel', 'Salary Earned Abroad', 'Gift', 'Business Income', 'Savings'].includes(destination) && destination === '') ? (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="block text-[13px] font-bold text-gray-950 mb-2">Specify Custom Source</label>
                        <input
                          type="text"
                          placeholder="Enter source of currency"
                          value={destination}
                          onChange={(e) => updateDraft({ destination: e.target.value })}
                          className="w-full md:w-1/2 border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white outline-none text-gray-900 font-bold"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="shadow-sm border-gray-200 rounded-2xl">
                <div className="p-6">
                  <h2 className="text-[17px] font-bold text-gray-900">Travel Details</h2>
                  <p className="text-[13px] text-gray-500 mb-6">Air ticket required to support your travel to below countries</p>
                  
                  <div className="space-y-6">
                    
                    {/* Destination */}
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2">Add Travel Destination</label>
                      <div className="flex flex-wrap gap-3">
                        {destination ? (
                          <div className="flex items-center bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-[13px] font-medium text-gray-800">
                            {destination} 
                            <button onClick={() => updateDraft({ destination: '' })} className="ml-2 text-gray-400 hover:text-gray-700 w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">✕</button>
                          </div>
                        ) : (
                          <select 
                            value={destination}
                            onChange={(e) => updateDraft({ destination: e.target.value })}
                            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none w-48"
                          >
                            <option value="">Select Country</option>
                            <option value="Singapore">Singapore</option>
                            <option value="USA">United States</option>
                            <option value="UAE">United Arab Emirates</option>
                            <option value="UK">United Kingdom</option>
                            <option value="Europe">Europe</option>
                            <option value="Thailand">Thailand</option>
                          </select>
                        )}
                        
                        <button className="border border-gray-200 rounded-lg px-4 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-wide">
                          Add Country
                        </button>
                      </div>
                    </div>

                    {/* Dates */}
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2">Add Travel Date</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="relative">
                          <input 
                            type={departureDate ? "date" : "text"}
                            placeholder="DEPARTURE DATE"
                            value={departureDate}
                            onChange={(e) => updateDraft({ departureDate: e.target.value })}
                            onFocus={(e) => e.target.type = 'date'}
                            className="border border-gray-100 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-gray-200 outline-none w-full text-gray-600 uppercase tracking-wider text-[11px] font-bold placeholder:text-gray-400"
                          />
                        </div>
                        <div className="relative">
                          <input 
                            type={returnDate ? "date" : "text"}
                            placeholder="RETURN DATE"
                            value={returnDate}
                            disabled={noReturnDate}
                            onChange={(e) => updateDraft({ returnDate: e.target.value })}
                            onFocus={(e) => { if(!noReturnDate) e.target.type = 'date' }}
                            className={`border border-gray-100 rounded-lg px-4 py-2.5 text-sm focus:border-gray-200 outline-none w-full uppercase tracking-wider text-[11px] font-bold placeholder:text-gray-400 ${noReturnDate ? 'bg-gray-100/50 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-600'}`}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center justify-between text-[11.5px] text-gray-500 pt-1">
                        <p>Start date should be within 60 days from order date</p>
                        <label className="flex items-center mt-3 md:mt-0 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={noReturnDate}
                            onChange={(e) => updateDraft({ noReturnDate: e.target.checked, returnDate: '' })}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-0 mr-2"
                          />
                          <span className="text-gray-700 font-medium text-[13px]">I don't have a return date yet</span>
                        </label>
                      </div>
                    </div>

                    {/* Purpose */}
                    <div>
                      <label className="block text-[13px] font-bold text-gray-900 mb-2">Purpose of Travel</label>
                      <select 
                        value={purpose}
                        onChange={(e) => updateDraft({ purpose: e.target.value })}
                        className="w-full md:w-1/2 border border-gray-100 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:border-gray-200 outline-none uppercase tracking-wider text-[11px] font-bold text-gray-500 appearance-none"
                      >
                        <option value="">SELECT PURPOSE</option>
                        <option value="TOURISM">Leisure / Tourism</option>
                        <option value="BUSINESS">Business Travel</option>
                        <option value="EDUCATION">Education</option>
                        <option value="MEDICAL">Medical Treatment</option>
                      </select>
                    </div>

                  </div>
                </div>
              </Card>
            )
          )}

          <div className="space-y-2">
            <Button 
              onClick={handleQuote} 
              disabled={
                !canGetQuote || 
                isLocking || 
                !amount || 
                (isRemittance ? (
                  !draftState.countryCode ||
                  !draftState.purposeCode ||
                  !draftState.beneficiaryId
                ) : (
                  !destination || 
                  (!isSell && (!departureDate || !purpose)) ||
                  (deliveryMethod === 'PICKUP' && !branchId) ||
                  (deliveryMethod === 'HOME_DELIVERY' && !draftState.deliveryAddress)
                ))
              }
              className={`w-full md:w-1/3 text-white font-bold py-6 rounded-lg text-sm shadow-sm transition-all tracking-wider disabled:opacity-50 ${
                isSell ? 'bg-emerald-500 hover:bg-emerald-600' : isRemittance ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {isLocking ? 'PROCESSING...' : 'CONTINUE'}
            </Button>

            {isRemittance && (!amount || !draftState.countryCode || !draftState.purposeCode || !draftState.beneficiaryId) && (
              <p className="text-[12px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 max-w-md">
                💡 Please enter transfer amount, select destination country, purpose, and beneficiary to continue.
              </p>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar Summary */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Product Box */}
          <Card className="shadow-sm border-gray-200 rounded-xl">
            <div className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-gray-900 text-[15px] mb-1">{productName}</h3>
                <p className="text-[11px] text-gray-700 mb-1"><strong>Best</strong> Rates & <strong>Genuine</strong> {product === 'CASH' ? 'Notes' : 'Card'}</p>
                <a href="#" className="text-blue-500 text-[11px] font-medium hover:underline">Know More</a>
              </div>
              <div className="w-14 h-9 bg-green-50 rounded-md border border-green-200/50 flex flex-col justify-center items-center overflow-hidden relative shadow-sm">
                 <div className="absolute inset-0 bg-green-200 opacity-20 pattern-dots"></div>
                 <div className="text-[7px] font-bold text-green-800 z-10">{currency}</div>
                 <div className="text-[9px] font-bold text-green-700 z-10">NOTE</div>
              </div>
            </div>
          </Card>

          {/* Amount Breakup */}
          <Card className="shadow-sm border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-[15px]">Amount Breakup</h3>
            </div>
            
            <div className="p-4 space-y-2.5">
              {isRemittance ? (
                // REMITTANCE Breakup
                isCalcLoading ? (
                  <div className="text-center text-gray-400 text-sm py-4">Calculating...</div>
                ) : remCalc ? (
                  <>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-900 font-medium">Transfer Amount</span>
                      <span className="font-bold text-gray-900">{remCalc.foreignAmount} {currency}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-gray-500 pl-2">
                      <span>• Rate: ₹{remCalc.exchangeRate?.toFixed(2)}</span>
                      <span>₹ {remCalc.inrSubtotal?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] pt-1">
                      <span className="text-gray-900 font-medium">Transfer Fee</span>
                      <span className="font-bold text-gray-900">₹ {remCalc.feeAmount?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] border-b border-gray-200/60 pb-3">
                      <span className="text-gray-900 font-medium flex items-center gap-1">
                        TCS Tax
                        {remCalc.thresholdExceeded && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">Threshold Crossed</span>}
                      </span>
                      <span className="font-bold text-gray-900">₹ {remCalc.tcsAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 pb-1">
                      <div>
                        <span className="text-gray-900 font-bold block text-[13px]">Total Payable (INR)</span>
                        <span className="text-[10px] text-gray-500">Incl. Transfer Fee & TCS</span>
                      </div>
                      <span className="font-extrabold text-indigo-700 text-[17px]">₹ {remCalc.totalInr?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    {remCalc.thresholdExceeded && (
                      <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-[11px] text-orange-700 font-medium">
                        ⚠️ Your cumulative LRS spending has exceeded ₹7 Lakhs. Higher TCS rate applies.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-400 text-sm py-4">
                    Enter amount, select country & purpose to see fee breakdown.
                  </div>
                )
              ) : (
                // CASH BUY / CASH SELL Breakup
                <>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-900 font-medium">Total Currency Value</span>
                    <span className="font-bold text-gray-900">₹ {inrEquivalent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-gray-500 pl-2">
                    <span>• {amount || 0} {currency} @ {adjustedRate?.toFixed(2) || '0.00'}</span>
                    <span>₹ {inrEquivalent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[13px] pt-1">
                    <span className="text-gray-900 font-medium">Service Charge</span>
                    <span className="font-bold text-gray-900">₹ {serviceCharge}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[13px] border-b border-gray-200/60 pb-3">
                    <span className="text-gray-900 font-medium">GST</span>
                    <span className="font-bold text-gray-900">₹ {gst}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1.5 pb-1">
                    <div>
                      <span className="text-gray-900 font-bold block text-[13px]">
                        {product === 'CASH_SELL' ? 'Total Amount to Receive' : 'Total Payable Amount'}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {product === 'CASH_SELL' ? 'After GST & Service charge' : 'Incl GST & Service charge'}
                      </span>
                    </div>
                    <span className="font-extrabold text-gray-900 text-[17px]">₹ {payableAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>

                  {/* Cashback Banner */}
                  {cashback > 0 && (
                    <div className="mt-3 bg-[#e6fcf5] border border-[#b2f2d9] rounded-lg p-3">
                      <div className="flex justify-between items-center text-[#087f5b] font-bold text-[12px] mb-2">
                        <span className="flex items-center">{product === 'CASH_SELL' ? 'Bonus Applied!' : 'Cashback Applied!'} <CheckCircle2 className="w-3.5 h-3.5 ml-1 inline text-[#0ca678]" /></span>
                        <span>₹{cashback}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-gray-900 text-[12px]">
                        <span>{product === 'CASH_SELL' ? 'Net amount including bonus' : 'Net effective price after cashback'}</span>
                        <span className="text-[15px]">₹{netEffective.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="bg-[#f8f9fa] py-2.5 text-center border-t border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium">{getEligibilityMessage()}</span>
            </div>
          </Card>

          {/* Offers */}
          <Card className="shadow-sm border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-[15px]">Available Offers</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50/50 hover:bg-white transition-colors focus-within:border-gray-300 focus-within:bg-white">
                <div className="pl-2 opacity-40"><Ticket className="w-4 h-4 text-gray-600 transform -rotate-45" /></div>
                <input 
                  type="text" 
                  placeholder="Enter Coupon Code" 
                  className="bg-transparent flex-1 min-w-0 py-1.5 px-1 text-[13px] focus:outline-none placeholder:text-gray-400"
                />
                <button className="text-gray-400 font-bold text-[11.5px] px-2 hover:text-gray-700 transition-colors uppercase shrink-0">Apply</button>
              </div>
            </div>
          </Card>

        </div>
      </div>

      </div>

      <CitySelectorModal 
        isOpen={isCityModalOpen} 
        onClose={() => setIsCityModalOpen(false)} 
        onSelect={(city) => updateDraft({ city })} 
      />
    </div>
  );
}
