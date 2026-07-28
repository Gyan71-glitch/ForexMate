'use client';

import React from 'react';
import { KycWizard } from '@/components/kyc/KycWizard';
import { KycSidebar } from '@/components/kyc/KycSidebar';
import { useKycDocuments } from '@/features/compliance/hooks/useKyc';

export default function KycPage() {
  const { data: kycStatus, isLoading } = useKycDocuments();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const isApproved = kycStatus?.overallStatus === 'APPROVED';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">KYC Verification</h1>
        <p className="text-gray-500 font-medium mt-1">Complete your identity verification to unlock full trading limits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isApproved ? (
            <div className="bg-white rounded-2xl border border-green-150 shadow-sm p-10 text-center flex flex-col justify-center items-center h-full min-h-[350px]">
              <p className="text-5xl mb-4">🎉</p>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">You're fully verified!</h2>
              <p className="text-gray-500 font-medium max-w-md leading-relaxed">
                No further action needed. Enjoy full access to all Forexmate services.
              </p>
            </div>
          ) : (
            <KycWizard documents={kycStatus?.documents || []} />
          )}
        </div>
        <div className="lg:col-span-1">
          <KycSidebar data={kycStatus} />
        </div>
      </div>
    </div>
  );
}
