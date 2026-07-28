"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import API_URL, { authFetch } from '@/lib/api';

export default function AddressBanks() {
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [addressModal, setAddressModal] = useState(false);
  const [bankModal, setBankModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  // Address form
  const [addrForm, setAddrForm] = useState({ address: '', city: '', state: '', pin: '', landmark: '' });
  // Bank form
  const [bankForm, setBankForm] = useState({ bankName: '', holderName: '', accountNumber: '', ifscCode: '', bankAddress: '' });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const loadProfile = (userId: number) => {
    authFetch(`${API_URL}/users/${userId}`)
      .then(r => r.json())
      .then(data => {
        setAddresses(data?.data?.profiles?.addresses || []);
        setBanks(data?.data?.profiles?.banks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const userStr = sessionStorage.getItem('forexmate_user');
    if (!userStr) { window.location.href = '/login'; return; }
    const u = JSON.parse(userStr);
    setUser(u);
    loadProfile(u.id);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('forexmate_token');
    sessionStorage.removeItem('forexmate_user');
    window.location.href = '/login';
  };

  // ---- Address handlers ----
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_URL}/users/${user.id}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addrForm),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setAddresses(prev => [...prev, saved.data]);
      setAddressModal(false);
      setAddrForm({ address: '', city: '', state: '', pin: '', landmark: '' });
      showToast('Address saved successfully!');
    } catch { showToast('Failed to save address.'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Delete this address?')) return;
    try {
      await authFetch(`${API_URL}/users/${user.id}/addresses/${id}`, { method: 'DELETE' });
      setAddresses(prev => prev.filter(a => a.id !== id));
      showToast('Address removed.');
    } catch { showToast('Failed to delete address.'); }
  };

  // ---- Bank handlers ----
  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_URL}/users/${user.id}/banks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankForm),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setBanks(prev => [...prev, saved.data]);
      setBankModal(false);
      setBankForm({ bankName: '', holderName: '', accountNumber: '', ifscCode: '', bankAddress: '' });
      showToast('Bank account linked successfully!');
    } catch { showToast('Failed to link bank.'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteBank = async (id: number) => {
    if (!confirm('Remove this bank account?')) return;
    try {
      await authFetch(`${API_URL}/users/${user.id}/banks/${id}`, { method: 'DELETE' });
      setBanks(prev => prev.filter(b => b.id !== id));
      showToast('Bank account removed.');
    } catch { showToast('Failed to remove bank.'); }
  };

  if (!user) return <div className="min-h-screen bg-gray-50" />;
  const initials = user.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-700 text-white px-6 py-3 rounded-xl shadow-xl font-semibold text-sm">
          {toast}
        </div>
      )}

      {/* Address Modal */}
      {addressModal && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-extrabold text-gray-800 mb-6">Add New Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address</label>
                <input required value={addrForm.address} onChange={e => setAddrForm({...addrForm, address: e.target.value})} placeholder="142, Spring Valley Apartments, Sector 14" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                  <input required value={addrForm.city} onChange={e => setAddrForm({...addrForm, city: e.target.value})} placeholder="Delhi" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                  <input required value={addrForm.state} onChange={e => setAddrForm({...addrForm, state: e.target.value})} placeholder="Delhi" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">PIN Code</label>
                  <input required value={addrForm.pin} onChange={e => setAddrForm({...addrForm, pin: e.target.value})} placeholder="110001" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Landmark</label>
                  <input value={addrForm.landmark} onChange={e => setAddrForm({...addrForm, landmark: e.target.value})} placeholder="Near City Mall" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setAddressModal(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className={`flex-1 py-3 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800 transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {submitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Modal */}
      {bankModal && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-extrabold text-gray-800 mb-6">Link Bank Account</h3>
            <form onSubmit={handleAddBank} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Name</label>
                <input required value={bankForm.bankName} onChange={e => setBankForm({...bankForm, bankName: e.target.value})} placeholder="HDFC Bank" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Account Holder Name</label>
                <input required value={bankForm.holderName} onChange={e => setBankForm({...bankForm, holderName: e.target.value})} placeholder="Gyan Vaibhav" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Account Number</label>
                <input required value={bankForm.accountNumber} onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} placeholder="XXXXXXXXXXXX" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">IFSC Code</label>
                <input required value={bankForm.ifscCode} onChange={e => setBankForm({...bankForm, ifscCode: e.target.value})} placeholder="HDFC0001234" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setBankModal(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className={`flex-1 py-3 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800 transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {submitting ? 'Linking...' : 'Link Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-blue-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-wider">Forexmate</Link>
          <div className="space-x-6 flex items-center">
            <Link href="/buy-sell" className="hover:text-blue-300 transition-colors font-semibold">Buy & Sell</Link>
            <Link href="/cards" className="hover:text-blue-300 transition-colors">Forex Cards</Link>
            <Link href="/dashboard" className="hover:text-blue-300 transition-colors border-b-2 border-white pb-1 font-semibold">My Profile</Link>
            <button onClick={handleLogout} className="ml-4 px-4 py-2 text-sm bg-blue-800 rounded hover:bg-blue-700 transition-colors border border-blue-600">Logout</button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 flex space-x-12">
        {/* Sidebar */}
        <div className="w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl mb-4 mx-auto">{initials}</div>
            <h2 className="text-xl font-bold text-center mb-1">{user.fullName || 'User'}</h2>
            <p className="text-sm text-gray-500 text-center mb-6">{user.email}</p>
            <nav className="space-y-2">
              <Link href="/dashboard" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 font-semibold rounded-lg">My Orders</Link>
              <Link href="/dashboard/kyc" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 font-semibold rounded-lg">KYC Documents</Link>
              <Link href="/dashboard/address" className="block px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg">Addresses & Banks</Link>
            </nav>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 space-y-10">

          {/* --- Addresses Section --- */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-800">Saved Addresses</h2>
              <button onClick={() => setAddressModal(true)} className="px-4 py-2 bg-blue-900 text-white rounded-lg shadow-sm hover:bg-blue-800 font-bold text-sm transition-colors">
                + Add New Address
              </button>
            </div>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : addresses.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
                <p className="mb-3">No addresses saved yet.</p>
                <button onClick={() => setAddressModal(true)} className="text-blue-600 font-bold hover:underline text-sm">+ Add your first address</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {addresses.map((addr: any, i: number) => (
                  <div key={addr.id} className={`bg-white rounded-xl shadow-sm border p-6 relative overflow-hidden ${i === 0 ? 'border-blue-200' : 'border-gray-100'}`}>
                    {i === 0 && <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Primary</div>}
                    <h3 className="font-bold text-lg mb-2">{addr.city || 'Address'}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {addr.address}<br/>
                      {addr.landmark && <>{addr.landmark}<br/></>}
                      {addr.city}, {addr.state} - {addr.pin}
                    </p>
                    <div className="flex space-x-4">
                      <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 text-sm font-semibold hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* --- Bank Section --- */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-800">Bank Accounts</h2>
              <button onClick={() => setBankModal(true)} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg border border-gray-200 hover:bg-gray-200 font-bold text-sm transition-colors">
                + Link Bank Account
              </button>
            </div>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : banks.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
                <p className="mb-3">No bank accounts linked yet.</p>
                <button onClick={() => setBankModal(true)} className="text-blue-600 font-bold hover:underline text-sm">+ Link your first bank account</button>
              </div>
            ) : (
              <div className="space-y-4">
                {banks.map((bank: any) => (
                  <div key={bank.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500 text-xs text-center">
                        {bank.bankName?.split(' ')[0]?.toUpperCase() || 'BANK'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{bank.bankName}</h3>
                        <p className="text-sm text-gray-600">{bank.holderName} &nbsp;|&nbsp; A/C: •••• {bank.accountNumber?.slice(-4)}</p>
                        <p className="text-sm text-gray-500 font-mono">IFSC: {bank.ifscCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">Verified</span>
                      <button onClick={() => handleDeleteBank(bank.id)} className="text-red-500 hover:underline font-semibold text-sm">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
