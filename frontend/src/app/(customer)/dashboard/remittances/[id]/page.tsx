'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRemittance } from '@/features/remittance/hooks/useRemittance';
import { RemittanceTracker } from '@/features/remittance/components/RemittanceTracker';

export default function RemittanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data: order, isLoading, error } = useRemittance(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Transfer not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 font-medium hover:underline">← Go Back</button>
      </div>
    );
  }

  const item = order.items[0];
  const detail = item?.remittance;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition-colors">← Back</button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transfer Details</h1>
          <p className="text-blue-600 font-mono text-sm font-bold">{order.orderNumber}</p>
        </div>
      </div>

      {/* Transfer Tracker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Transfer Status</h3>
        <RemittanceTracker status={order.status} complianceStatus={order.complianceStatus} />
      </div>

      {/* Transfer Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Transfer Amount</h3>
          <div className="text-3xl font-extrabold text-blue-600">
            {item?.currency.symbol || item?.currency.code}
            {Number(item?.amount || 0).toLocaleString()} {item?.currency.code}
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">Rate applied:</span>{' '}
            ₹{Number(item?.rate || 0).toFixed(4)} per {item?.currency.code}
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">Total INR debited:</span>{' '}
            ₹{Number(order.totalAmountInr).toLocaleString('en-IN')}
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">Date:</span>{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          {order.branch && (
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Branch:</span>{' '}
              {order.branch.branchName} ({order.branch.branchCode})
            </div>
          )}
        </div>

        {detail && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Beneficiary Details</h3>
            <div className="space-y-3">
              {[
                { label: 'Beneficiary Name', value: detail.beneficiaryName },
                { label: 'Bank Name', value: detail.beneficiaryBank },
                { label: 'SWIFT / BIC Code', value: detail.swiftCode },
                { label: 'IBAN / Account No.', value: detail.ibanOrAccountNumber },
                { label: 'Address', value: detail.beneficiaryAddress },
                detail.partner ? { label: 'Partner', value: detail.partner.name } : null,
              ].filter(Boolean).map((row: any) => (
                <div key={row.label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{row.label}</p>
                  <p className="font-medium text-gray-900 font-mono text-sm mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
