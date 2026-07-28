'use client';

import React from 'react';
import Link from 'next/link';
import { RemittanceOrder, RemittanceStatus } from '../types';

const STATUS_CONFIG: Record<string, { label: string; color: string; step: number }> = {
  PENDING:             { label: 'KYC Pending',          color: 'bg-amber-500',  step: 1 },
  PENDING_KYC:         { label: 'KYC Pending',          color: 'bg-amber-500',  step: 1 },
  KYC_SUBMITTED:       { label: 'Compliance Review',    color: 'bg-blue-500',   step: 2 },
  COMPLIANCE_REVIEW:   { label: 'Compliance Review',    color: 'bg-blue-500',   step: 2 },
  READY_TO_FORWARD:    { label: 'Processing',           color: 'bg-indigo-500', step: 3 },
  PROCESSING:          { label: 'Processing',           color: 'bg-indigo-500', step: 3 },
  FORWARDED_TO_PARTNER:{ label: 'Transfer Processing',  color: 'bg-purple-600', step: 4 },
  PARTNER_PROCESSING:  { label: 'Transfer Processing',  color: 'bg-purple-600', step: 4 },
  TRANSFER_PROCESSING: { label: 'Transfer Processing',  color: 'bg-purple-600', step: 4 },
  TRANSFER_COMPLETED:  { label: 'Completed',            color: 'bg-emerald-600',step: 5 },
  COMPLETED:           { label: 'Completed',            color: 'bg-emerald-600',step: 5 },
  CANCELLED:           { label: 'Cancelled',            color: 'bg-red-500',    step: -1 },
  REJECTED:            { label: 'Rejected',             color: 'bg-red-500',    step: -1 },
};

interface RemittanceListProps {
  remittances: RemittanceOrder[];
}

export const RemittanceList: React.FC<RemittanceListProps> = ({ remittances }) => {
  if (remittances.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-6xl mb-4">🌍</p>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Wire Transfers Yet</h3>
        <p className="text-gray-500 mb-6">Place a remittance order to send money abroad.</p>
        <Link href="/buy-forex" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
          Send Money Abroad
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {remittances.map(order => {
        const item = order.items[0];
        const detail = item?.remittance;
        const isCancelled = order.status === 'CANCELLED' || order.status === 'REJECTED' || order.complianceStatus === 'REJECTED';
        const config = isCancelled
          ? { label: 'Cancelled / Rejected', color: 'bg-red-600', step: -1 }
          : (STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING);

        return (
          <Link key={order.id} href={`/dashboard/remittances/${order.id}`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm text-blue-600 font-bold mb-1">{order.orderNumber}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {item?.currency.symbol || item?.currency.code}{Number(item?.amount || 0).toLocaleString()} {item?.currency.code}
                  </p>
                  {detail && (
                    <p className="text-sm text-gray-500 mt-1">
                      → <span className="font-medium text-gray-700">{detail.beneficiaryName}</span> via{' '}
                      <span className="font-medium text-gray-700">{detail.beneficiaryBank}</span>
                    </p>
                  )}
                  {detail?.swiftCode && (
                    <p className="text-xs text-gray-400 mt-1 font-mono">SWIFT: {detail.swiftCode}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${config.color}`}>
                    {config.label}
                  </span>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">
                    ₹{Number(order.totalAmountInr).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
