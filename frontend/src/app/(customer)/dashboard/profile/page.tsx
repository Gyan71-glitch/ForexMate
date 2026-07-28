import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoForm } from '@/components/profile/PersonalInfoForm';
import { AddressBook } from '@/components/profile/AddressBook';
import { BankAccounts } from '@/components/profile/BankAccounts';

export default function ProfilePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-gray-500 font-medium mt-1">Manage your profile, security preferences, and linked accounts.</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12 items-center bg-gray-100/50 p-1 rounded-xl">
          <TabsTrigger value="personal" className="font-bold text-sm h-full rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Personal Info</TabsTrigger>
          <TabsTrigger value="address" className="font-bold text-sm h-full rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Address Book</TabsTrigger>
          <TabsTrigger value="banks" className="font-bold text-sm h-full rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Bank Accounts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="mt-0 outline-none">
          <PersonalInfoForm />
        </TabsContent>
        
        <TabsContent value="address" className="mt-0 outline-none">
          <AddressBook />
        </TabsContent>
        
        <TabsContent value="banks" className="mt-0 outline-none">
          <BankAccounts />
        </TabsContent>
      </Tabs>
      
    </div>
  );
}
