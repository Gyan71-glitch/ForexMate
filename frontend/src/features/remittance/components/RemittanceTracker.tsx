'use client';

import React from 'react';
import { RemittanceStatus } from '../types';

const STEPS = [
  { key: 'PENDING',            label: 'Order Created',       icon: '📋' },
  { key: 'KYC_SUBMITTED',      label: 'KYC Submitted',       icon: '🪪' },
  { key: 'COMPLIANCE_REVIEW',  label: 'Compliance Review',   icon: '🛡️' },
  { key: 'PROCESSING',         label: 'Processing',          icon: '⚙️' },
  { key: 'COMPLETED',          label: 'Completed',           icon: '✅' },
];

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  PENDING_KYC: 0,
  KYC_SUBMITTED: 1,
  COMPLIANCE_REVIEW: 2,
  READY_TO_FORWARD: 3,
  PROCESSING: 3,
  FORWARDED_TO_PARTNER: 3,
  PARTNER_PROCESSING: 3,
  TRANSFER_PROCESSING: 3,
  TRANSFER_COMPLETED: 4,
  COMPLETED: 4,
  CANCELLED: -1,
  REJECTED: -1,
};

interface RemittanceTrackerProps {
  status: string;
  complianceStatus?: string;
}

export const RemittanceTracker: React.FC<RemittanceTrackerProps> = ({ status, complianceStatus }) => {
  const isCancelled = status === 'CANCELLED' || status === 'REJECTED' || complianceStatus === 'REJECTED';
  const currentStep = STATUS_ORDER[status] ?? 0;

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto font-black">
          ✕
        </div>
        <h4 className="font-extrabold text-red-900 text-base">Transfer Cancelled / Rejected</h4>
        <p className="text-xs text-red-700 max-w-md mx-auto font-medium">
          This outward remittance request has been cancelled by Central Operations during compliance verification.
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative flex items-center justify-between">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-100 z-0">
          <div
            className="h-full bg-blue-500 transition-all duration-700"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md transition-all
                ${isCompleted ? 'bg-blue-500 text-white scale-100' : ''}
                ${isCurrent ? 'bg-blue-600 text-white scale-110 ring-4 ring-blue-200' : ''}
                ${!isCompleted && !isCurrent ? 'bg-white border-2 border-gray-200 text-gray-300' : ''}
              `}>
                {isCompleted ? '✓' : step.icon}
              </div>
              <span className={`text-xs text-center font-medium leading-tight max-w-[70px] ${
                isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
