"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Plus, MoreVertical, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfile, useAddAddress, useDeleteAddress } from '../../features/profile/hooks/useProfile';

export function AddressBook() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id || '');
  const addAddressMutation = useAddAddress();
  const deleteAddressMutation = useDeleteAddress();

  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState({
    city: '',
    state: '',
    address: '',
    pin: '',
    landmark: ''
  });

  const handleAdd = async () => {
    if (!user?.id) return;
    await addAddressMutation.mutateAsync({ userId: user.id, data: newAddress });
    setIsAdding(false);
    setNewAddress({ city: '', state: '', address: '', pin: '', landmark: '' });
  };

  const handleDelete = async (addressId: string) => {
    if (!user?.id) return;
    if (confirm('Are you sure you want to delete this address?')) {
      await deleteAddressMutation.mutateAsync({ userId: user.id, addressId });
    }
  };

  const addresses = profile?.profiles?.addresses || [];
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-extrabold text-gray-900">Address Book</CardTitle>
          <CardDescription className="text-gray-500 font-medium">
            Manage your saved delivery and pickup addresses.
          </CardDescription>
        </div>
        <Button variant="outline" className="font-bold text-sm" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add New Address</>}
        </Button>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 p-4 border border-blue-100 bg-blue-50/50 rounded-xl space-y-4">
            <h4 className="font-bold text-gray-900">Add New Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Address Line" value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} />
              <Input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
              <Input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
              <Input placeholder="PIN Code" value={newAddress.pin} onChange={e => setNewAddress({...newAddress, pin: e.target.value})} />
              <Input placeholder="Landmark (Optional)" value={newAddress.landmark} onChange={e => setNewAddress({...newAddress, landmark: e.target.value})} />
            </div>
            <div className="flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700 font-bold" onClick={handleAdd} disabled={addAddressMutation.isPending || !newAddress.address || !newAddress.city}>
                {addAddressMutation.isPending ? 'Saving...' : 'Save Address'}
              </Button>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="py-4 text-gray-500">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No addresses saved yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr: any, index: number) => (
              <div key={addr.id} className="border border-gray-200 rounded-xl p-5 relative hover:border-blue-300 transition-colors">
                <div 
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-600 cursor-pointer"
                  onClick={() => handleDelete(addr.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
                      Address {index + 1} {index === 0 && <span className="bg-blue-100 text-blue-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold">Default</span>}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium mt-1 leading-relaxed">
                      {addr.address}<br />
                      {addr.landmark && <>{addr.landmark}<br /></>}
                      {addr.city}, {addr.state} {addr.pin}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
