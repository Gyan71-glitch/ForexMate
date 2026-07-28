'use client';

import React from 'react';
import { Lock, CheckCircle2, Circle, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { KycSummaryResponse } from '../../features/compliance/types';

interface KycSidebarProps {
  data: KycSummaryResponse | undefined;
}

export function KycSidebar({ data }: KycSidebarProps) {
  const documents = data?.documents || [];

  const getDocStatus = (type: string) => {
    const doc = documents.find(d => d.docType === type);
    if (!doc) return 'Missing';
    if (doc.status === 'APPROVED') return 'Approved';
    if (doc.status === 'REJECTED') return 'Rejected';
    if (doc.status === 'REVIEWING') return 'Awaiting Review';
    if (doc.ocrData) return 'OCR Complete';
    return 'Uploaded';
  };

  const getStatusColor = (status: string) => {
    if (['Approved', 'Eligible', 'Cleared'].includes(status)) return 'text-green-600 bg-green-50 border-green-200';
    if (['Missing', 'Unknown'].includes(status)) return 'text-gray-500 bg-gray-50 border-gray-200';
    if (['Rejected', 'Ineligible', 'Flagged'].includes(status)) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  // ─── LRS Eligibility ─────────────────────────────────────────────────────
  // LRS (Liberalised Remittance Scheme) is tracked via PAN card.
  // PAN Approved → Eligible | PAN Reviewing → Under Review | No PAN → Unknown
  const panDoc = documents.find(d => d.docType === 'PAN');
  const lrsStatus = !panDoc
    ? 'Unknown'
    : data?.overallStatus === 'LRS_FAILED'
    ? 'Ineligible'
    : panDoc.status === 'APPROVED'
    ? 'Eligible'
    : panDoc.status === 'REJECTED'
    ? 'Ineligible'
    : 'Under Review';

  // ─── AML Screening ───────────────────────────────────────────────────────
  // Once any document is approved → Cleared (staff review = AML check)
  // Once submitted for review → In Progress
  // Nothing submitted → Pending
  const hasApproved = documents.some(d => d.status === 'APPROVED');
  const hasReviewing = documents.some(d => d.status === 'REVIEWING');
  const amlStatus = hasApproved ? 'Cleared' : hasReviewing ? 'In Progress' : 'Pending';

  // ─── Progress % ──────────────────────────────────────────────────────────
  const requiredTypes = ['PAN', 'PASSPORT'];
  const filled = requiredTypes.filter(t => documents.some(d => d.docType === t)).length;
  const progress = Math.round((filled / requiredTypes.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">KYC Progress</h3>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Completion</span>
          <span className="text-sm font-extrabold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Email Verified</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Mobile Verified</span>
          </div>
          <div className="flex items-center gap-3">
            {getDocStatus('PAN') !== 'Missing'
              ? <CheckCircle2 className="w-5 h-5 text-green-500" />
              : <Circle className="w-5 h-5 text-gray-300" />}
            <span className="text-sm font-medium text-gray-700">PAN</span>
          </div>
          <div className="flex items-center gap-3">
            {getDocStatus('PASSPORT') !== 'Missing'
              ? <CheckCircle2 className="w-5 h-5 text-green-500" />
              : <Circle className="w-5 h-5 text-gray-300" />}
            <span className="text-sm font-medium text-gray-700">Passport</span>
          </div>
        </div>
      </div>

      {/* Compliance Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Compliance Summary</h3>
        <div className="space-y-3">

          {/* Overall */}
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Overall</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getStatusColor(
              data?.overallStatus === 'APPROVED' ? 'Approved' : data?.overallStatus === 'LRS_FAILED' ? 'LRS_FAILED' : data?.overallStatus === 'NOT_SUBMITTED' ? 'Missing' : 'Pending'
            )}`}>
              {data?.overallStatus === 'LRS_FAILED' ? 'LRS Failed' : (data?.overallStatus || 'Pending')}
            </span>
          </div>

          {/* PAN */}
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">PAN</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getStatusColor(getDocStatus('PAN'))}`}>
              {getDocStatus('PAN')}
            </span>
          </div>

          {/* Passport */}
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Passport</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getStatusColor(getDocStatus('PASSPORT'))}`}>
              {getDocStatus('PASSPORT')}
            </span>
          </div>

          {/* LRS Eligible — dynamic */}
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">LRS Eligible</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-md border flex items-center gap-1 ${getStatusColor(lrsStatus)}`}>
              {lrsStatus === 'Eligible' && <ShieldCheck className="w-3 h-3" />}
              {lrsStatus === 'Ineligible' && <ShieldAlert className="w-3 h-3" />}
              {lrsStatus === 'Under Review' && <Clock className="w-3 h-3" />}
              {lrsStatus}
            </span>
          </div>

          {/* AML Screening — dynamic */}
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">AML Screening</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-md border flex items-center gap-1 ${getStatusColor(amlStatus)}`}>
              {amlStatus === 'Cleared' && <ShieldCheck className="w-3 h-3" />}
              {(amlStatus === 'In Progress' || amlStatus === 'Pending') && <Clock className="w-3 h-3" />}
              {amlStatus}
            </span>
          </div>

        </div>
      </div>

      {/* Security Badge */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 flex items-start gap-4">
        <Lock className="w-6 h-6 text-emerald-600 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-emerald-900">AES-256 Encryption</h4>
          <p className="text-xs text-emerald-700 mt-1">Your identity documents are encrypted at rest and securely stored.</p>
        </div>
      </div>
    </div>
  );
}
