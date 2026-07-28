"use client";

import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, Briefcase, Plus, Check, Edit2, Loader2, MapPin } from 'lucide-react';
import API_URL, { authFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface AddressSelectorProps {
  value: string;
  onChange: (compiledAddress: string, addressId?: string) => void;
}

const compileAddressString = (addr: {
  address: string;
  city: string;
  state: string;
  pin: string;
  landmark?: string | null;
}) => {
  const parts = [
    addr.address.trim(),
    addr.landmark?.trim() ? `Landmark: ${addr.landmark.trim()}` : '',
    `${addr.city.trim()}, ${addr.state.trim()}`,
    addr.pin.trim()
  ].filter(Boolean);
  return parts.join(', ');
};

export function AddressSelector({ value, onChange }: AddressSelectorProps) {
  const { user } = useAuth();
  const [dbAddresses, setDbAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  
  // Form/Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editAddressType, setEditAddressType] = useState<string>('Home');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form Fields
  const [houseNo, setHouseNo] = useState('');
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [state, setState] = useState('Delhi');

  // Load addresses from backend on mount/user change
  const fetchAddresses = async (selectNewId?: string) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/users/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        const addresses = data.data?.profiles?.addresses || [];
        setDbAddresses(addresses);
        
        // If a new address was just saved, auto-select it
        if (selectNewId) {
          const newAddr = addresses.find((a: any) => a.id === selectNewId);
          if (newAddr) {
            setSelectedId(newAddr.id);
            onChange(compileAddressString(newAddr), newAddr.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load addresses from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user?.id]);

  // Sync selection with parent value
  useEffect(() => {
    if (!value && dbAddresses.length > 0) {
      // Auto-select Home if available, otherwise first address
      const home = dbAddresses.find(a => a.addressType === 'Home');
      const defaultAddr = home || dbAddresses[0];
      setSelectedId(defaultAddr.id);
      onChange(compileAddressString(defaultAddr), defaultAddr.id);
    }
  }, [value, dbAddresses]);

  // Derived addresses
  const homeAddress = dbAddresses.find(a => a.addressType === 'Home');
  const officeAddress = dbAddresses.find(a => a.addressType === 'Office');
  const otherAddresses = dbAddresses.filter(a => a.addressType !== 'Home' && a.addressType !== 'Office');

  const startEditing = (type: string, existingAddr?: any) => {
    setEditAddressType(type);
    setIsEditing(true);
    
    if (existingAddr) {
      setEditingAddressId(existingAddr.id);
      // Split address into houseNo & locality if possible, otherwise use whole string
      const addrStr = existingAddr.address || '';
      const splitIdx = addrStr.indexOf(',');
      if (splitIdx !== -1) {
        setHouseNo(addrStr.substring(0, splitIdx).trim());
        setLocality(addrStr.substring(splitIdx + 1).trim());
      } else {
        setHouseNo(addrStr);
        setLocality('');
      }
      setLandmark(existingAddr.landmark || '');
      setPincode(existingAddr.pin || '');
      setCity(existingAddr.city || '');
      setState(existingAddr.state || '');
    } else {
      setEditingAddressId(null);
      setHouseNo('');
      setLocality('');
      setLandmark('');
      setPincode('');
      setCity('New Delhi');
      setState('Delhi');
    }
  };

  const handleSave = async () => {
    if (!houseNo || !locality || !pincode || !city || !state) {
      alert('Please fill out all required fields.');
      return;
    }

    setSaving(true);
    const fullAddress = `${houseNo.trim()}, ${locality.trim()}`;
    const payload = {
      address: fullAddress,
      city: city.trim(),
      state: state.trim(),
      pin: pincode.trim(),
      landmark: landmark.trim() || undefined,
      addressType: editAddressType
    };

    if (!user?.id) {
      // Simulate saving for unauthenticated users (so they can proceed in draft state)
      const mockAddr = { ...payload, id: 'temp-' + Date.now() };
      setDbAddresses((prev: any[]) => [...prev, mockAddr]);
      setIsEditing(false);
      setSelectedId(mockAddr.id);
      onChange(compileAddressString(mockAddr), undefined);
      setSaving(false);
      return;
    }

    try {
      let res;
      if (editingAddressId) {
        // Edit existing address
        res = await authFetch(`${API_URL}/users/${user.id}/addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new address
        res = await authFetch(`${API_URL}/users/${user.id}/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.message || 'Failed to save address');
      }

      const saved = await res.json();
      setIsEditing(false);
      
      // Reload list and auto-select saved item
      await fetchAddresses(saved.data?.id);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectCard = (addr: any) => {
    if (isEditing) return; // Prevent selection changes while editing
    setSelectedId(addr.id);
    onChange(compileAddressString(addr), addr.id);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <label className="block text-[13px] font-bold text-gray-900">Select Delivery Address</label>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
      </div>
      
      {/* Saved Addresses grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* HOME Card */}
        <div
          onClick={() => homeAddress ? handleSelectCard(homeAddress) : startEditing('Home')}
          className={`border-2 p-3.5 rounded-xl transition-all flex flex-col justify-between min-h-[105px] relative group ${
            homeAddress 
              ? selectedId === homeAddress.id && !isEditing
                ? 'border-blue-500 bg-blue-50/40 shadow-sm cursor-pointer' 
                : 'border-gray-200 bg-white hover:border-blue-300 cursor-pointer'
              : 'border-dashed border-gray-300 bg-gray-50/50 hover:bg-white cursor-pointer'
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${homeAddress && selectedId === homeAddress.id && !isEditing ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                <HomeIcon className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-gray-900">Home</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              {homeAddress && !isEditing && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing('Home', homeAddress);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-all"
                  title="Edit Address"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {homeAddress && selectedId === homeAddress.id && !isEditing && (
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
          </div>
          
          <p className="text-[11px] text-gray-500 leading-relaxed mt-1">
            {homeAddress ? (
              <>
                <span className="font-medium text-gray-700 block line-clamp-1">{homeAddress.address}</span>
                <span className="line-clamp-1">{homeAddress.city}, {homeAddress.state} - {homeAddress.pin}</span>
              </>
            ) : (
              <span className="text-gray-400 font-semibold italic flex items-center gap-1">
                + Add Home Address
              </span>
            )}
          </p>
        </div>

        {/* OFFICE Card */}
        <div
          onClick={() => officeAddress ? handleSelectCard(officeAddress) : startEditing('Office')}
          className={`border-2 p-3.5 rounded-xl transition-all flex flex-col justify-between min-h-[105px] relative group ${
            officeAddress 
              ? selectedId === officeAddress.id && !isEditing
                ? 'border-blue-500 bg-blue-50/40 shadow-sm cursor-pointer' 
                : 'border-gray-200 bg-white hover:border-blue-300 cursor-pointer'
              : 'border-dashed border-gray-300 bg-gray-50/50 hover:bg-white cursor-pointer'
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${officeAddress && selectedId === officeAddress.id && !isEditing ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-gray-900">Office</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              {officeAddress && !isEditing && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing('Office', officeAddress);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-all"
                  title="Edit Address"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {officeAddress && selectedId === officeAddress.id && !isEditing && (
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
          </div>
          
          <p className="text-[11px] text-gray-500 leading-relaxed mt-1">
            {officeAddress ? (
              <>
                <span className="font-medium text-gray-700 block line-clamp-1">{officeAddress.address}</span>
                <span className="line-clamp-1">{officeAddress.city}, {officeAddress.state} - {officeAddress.pin}</span>
              </>
            ) : (
              <span className="text-gray-400 font-semibold italic flex items-center gap-1">
                + Add Office Address
              </span>
            )}
          </p>
        </div>

        {/* OTHER / CUSTOM Card */}
        <div
          onClick={() => startEditing('Other')}
          className={`border-2 p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[105px] ${
            isEditing && editAddressType === 'Other'
              ? 'border-blue-500 bg-blue-50/40 shadow-sm'
              : 'border-dashed border-gray-300 bg-gray-50/50 hover:bg-white'
          }`}
        >
          <div className="flex justify-between items-start mb-1.5">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${isEditing && editAddressType === 'Other' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                <Plus className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-gray-900">New Address</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 font-medium leading-normal">
            Save a new structured address to your address book
          </p>
        </div>
      </div>

      {/* Render Other Db Addresses if any */}
      {otherAddresses.length > 0 && !isEditing && (
        <div className="space-y-2 pt-2">
          <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Other Saved Addresses</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {otherAddresses.map((addr: any) => (
              <div
                key={addr.id}
                onClick={() => handleSelectCard(addr)}
                className={`border-2 p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center ${
                  selectedId === addr.id
                    ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-gray-900 block truncate">{addr.address}</span>
                    <span className="text-[10px] text-gray-500 block truncate">{addr.city}, {addr.state}</span>
                  </div>
                </div>
                {selectedId === addr.id && (
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Address Form */}
      {isEditing && (
        <div className="border border-gray-200 bg-gray-50 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
            <h4 className="font-bold text-sm text-gray-800">
              {editingAddressId ? `Edit ${editAddressType} Address` : `Add New ${editAddressType} Address`}
            </h4>
            <button 
              onClick={() => setIsEditing(false)}
              className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
            >
              Cancel
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">House / Flat No / Building / Floor</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium bg-white text-gray-800"
                placeholder="e.g. Flat 405, Block B, Floor 4"
                value={houseNo}
                onChange={e => setHouseNo(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Area / Locality / Sector / Road</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium bg-white text-gray-800"
                placeholder="e.g. Sector 5, Dwarka"
                value={locality}
                onChange={e => setLocality(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Landmark (Optional)</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium bg-white text-gray-800"
                placeholder="e.g. Near Metro Station"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Pincode</label>
              <input
                type="text"
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium bg-white text-gray-800"
                placeholder="e.g. 110075"
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">City</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium bg-white text-gray-800"
                placeholder="City"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">State</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium bg-white text-gray-800"
                placeholder="State"
                value={state}
                onChange={e => setState(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingAddressId ? 'Save Changes' : 'Save Address'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
