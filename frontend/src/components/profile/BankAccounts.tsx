"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Plus, MoreVertical, ShieldCheck, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfile, useAddBank, useDeleteBank } from '../../features/profile/hooks/useProfile';

export function BankAccounts() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id || '');
  const addBankMutation = useAddBank();
  const deleteBankMutation = useDeleteBank();

  const [isAdding, setIsAdding] = useState(false);
  const [newBank, setNewBank] = useState({
    bankName: '',
    holderName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const handleAdd = async () => {
    if (!user?.id) return;
    await addBankMutation.mutateAsync({ userId: user.id, data: newBank });
    setIsAdding(false);
    setNewBank({ bankName: '', holderName: '', accountNumber: '', ifscCode: '' });
  };

  const handleDelete = async (bankId: string) => {
    if (!user?.id) return;
    if (confirm('Are you sure you want to delete this bank account?')) {
      await deleteBankMutation.mutateAsync({ userId: user.id, bankId });
    }
  };

  const banks = profile?.profiles?.banks || [];
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-extrabold text-gray-900">Bank Accounts</CardTitle>
          <CardDescription className="text-gray-500 font-medium">
            Link your bank accounts for fast INR deposits and withdrawals.
          </CardDescription>
        </div>
        <Button variant="outline" className="font-bold text-sm" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Link Account</>}
        </Button>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 p-4 border border-blue-100 bg-blue-50/50 rounded-xl space-y-4">
            <h4 className="font-bold text-gray-900">Add New Bank Account</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Bank Name" value={newBank.bankName} onChange={e => setNewBank({...newBank, bankName: e.target.value})} />
              <Input placeholder="Account Holder Name" value={newBank.holderName} onChange={e => setNewBank({...newBank, holderName: e.target.value})} />
              <Input placeholder="Account Number" type="password" value={newBank.accountNumber} onChange={e => setNewBank({...newBank, accountNumber: e.target.value})} />
              <Input placeholder="IFSC Code" value={newBank.ifscCode} onChange={e => setNewBank({...newBank, ifscCode: e.target.value.toUpperCase()})} />
            </div>
            <div className="flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700 font-bold" onClick={handleAdd} disabled={addBankMutation.isPending || !newBank.bankName || !newBank.accountNumber}>
                {addBankMutation.isPending ? 'Saving...' : 'Save Bank Account'}
              </Button>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="py-4 text-gray-500">Loading bank accounts...</div>
        ) : banks.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No bank accounts linked yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banks.map((bank: any) => (
              <div key={bank.id} className="border border-gray-200 rounded-xl p-5 relative bg-gradient-to-br from-white to-gray-50 hover:border-gray-300 transition-colors">
                <div 
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-600 cursor-pointer"
                  onClick={() => handleDelete(bank.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white border border-gray-100 shadow-sm rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900">{bank.bankName}</h3>
                    <p className="text-sm text-gray-500 font-medium mt-0.5 tracking-wider">
                      •••• •••• {bank.accountNumber?.slice(-4) || '****'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{bank.holderName}</p>
                    <div className="flex items-center gap-1 mt-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 font-medium">
            Your bank accounts are securely encrypted. By RBI mandate, refunds and withdrawals can only be processed to bank accounts matching your KYC name.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
