"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useProfile, useUpdateProfile } from '../../features/profile/hooks/useProfile';
import { useState, useEffect } from 'react';

export function PersonalInfoForm() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id || '');
  const updateMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    panNumber: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.user?.fullName || user?.fullName || '',
        phone: profile.user?.mobile || user?.mobile || '',
        panNumber: profile.panNumber || ''
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!user?.id) return;
    await updateMutation.mutateAsync({
      userId: user.id,
      data: formData
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-extrabold text-gray-900">Personal Information</CardTitle>
        <CardDescription className="text-gray-500 font-medium">
          Update your personal details and contact information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
            <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
            <Input value={user?.email || ''} disabled className="bg-gray-50" />
            <p className="text-[10px] text-gray-500 font-medium mt-1">Contact support to change your email.</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Phone Number</label>
            <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 9876543210" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">PAN Number</label>
            <Input value={formData.panNumber} onChange={e => setFormData({...formData, panNumber: e.target.value.toUpperCase()})} placeholder="ABCDE1234F" className="uppercase" />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 font-bold px-8">
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
