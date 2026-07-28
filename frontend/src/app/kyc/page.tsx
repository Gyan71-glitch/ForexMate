'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { useKycDocuments } from '@/features/compliance/hooks/useKyc';
import { KycWizard } from '@/components/kyc/KycWizard';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function KycRequirementsPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId') || '';

  const { data: requirementsData, isLoading: reqLoading } = useQuery({
    queryKey: ['order-kyc-requirements', orderId],
    queryFn: () => authFetch(`${API_URL}/kyc/requirements?orderId=${orderId}`).then(apiJson<{ requiredDocuments: string[] }>),
    enabled: !!orderId,
  });

  const { data: kycStatus, isLoading: docsLoading } = useKycDocuments();

  const isLoading = reqLoading || docsLoading;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
        <Navbar />

        <main className="flex-grow pt-28 pb-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order KYC Verification</h1>
              <p className="text-gray-500 font-medium mt-1">
                Please complete your identity verification for order <span className="font-mono text-gray-900 font-bold">{orderId}</span>.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-150 shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 sm:p-10">
                <KycWizard 
                  documents={kycStatus?.documents || []} 
                  requiredDocTypes={requirementsData?.requiredDocuments}
                  orderId={orderId || undefined}
                />
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}

export default function KycPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <KycRequirementsPage />
    </Suspense>
  );
}
