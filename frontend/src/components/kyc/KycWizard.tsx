"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, ShieldCheck, CheckCircle2, FileText, Globe, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentUploadCard } from './DocumentUploadCard';
import { useSubmitKyc, useKycRules } from '../../features/compliance/hooks/useKyc';
import { KycDocument } from '../../features/compliance/types';
import { useTransactionStore } from '@/stores/transactionStore';

interface KycWizardProps {
  documents: KycDocument[];
  requiredDocTypes?: string[];
  orderId?: string;
}

const WIZARD_STEPS = [
  { id: 'IDENTITY', label: 'Identity' },
  { id: 'DOCUMENTS', label: 'Documents' },
  { id: 'REVIEW', label: 'Review' },
  { id: 'SUBMITTED', label: 'Submitted' }
];

export function KycWizard({ documents, requiredDocTypes, orderId }: KycWizardProps) {
  const [step, setStep] = useState(0);
  const [activeDoc, setActiveDoc] = useState<string>('PAN');
  const submitMutation = useSubmitKyc();

  const getDoc = (type: string) => documents.find(d => d.docType === type);
  const hasDoc = (type: string) => !!getDoc(type);

  const { draftState } = useTransactionStore();
  const { data: dynamicRules, isLoading: isRulesLoading } = useKycRules(draftState.product || 'CASH', draftState.purpose || 'TOURISM');

  const getDocMeta = (type: string) => {
    switch (type) {
      case 'PAN':
        return { name: 'PAN Card (Self-Attested)', reason: 'Mandatory identity & tax clearance under Income Tax Act', icon: FileText };
      case 'PASSPORT':
        return { name: 'Indian Passport Copy', reason: 'Mandatory proof of citizenship for international transactions', icon: Globe };
      case 'VISA':
        return { name: 'Student / Tourist Visa / I-20 Form', reason: 'Proof of overseas stay duration & legal status', icon: Plane };
      case 'ADMISSION_INVOICE':
        return { name: 'University Admission / Fee Invoice', reason: 'Official fee invoice / cost estimate from foreign institution', icon: FileText };
      case 'BANK_STATEMENT':
        return { name: '6-Month Bank Account Statement', reason: 'RBI requirement to verify source of funds & solvency', icon: FileText };
      case 'FORM_A2':
        return { name: 'Signed RBI Form A2 Declaration', reason: 'Mandatory declaration under Liberalised Remittance Scheme (LRS)', icon: FileText };
      case 'TICKET':
        return { name: 'Confirmed Flight Ticket', reason: 'Travel proof for foreign exchange purchase', icon: Plane };
      default:
        return { name: type.replace(/_/g, ' '), reason: 'Required for compliance verification', icon: FileText };
    }
  };

  const REQUIRED_DOCS = requiredDocTypes
    ? requiredDocTypes.map(type => {
        const meta = getDocMeta(type);
        return {
          type,
          name: meta.name,
          icon: meta.icon,
          required: true,
          reason: meta.reason,
          usedFor: ['RBI LRS Compliance']
        };
      })
    : (dynamicRules ? dynamicRules.map((r: any) => ({
        type: r.type,
        name: r.name,
        icon: r.type === 'PAN' ? FileText : r.type === 'PASSPORT' ? Globe : Plane,
        required: r.required,
        reason: r.reason,
        usedFor: r.usedFor || []
      })) : []);

  const handleFinalSubmit = async () => {
    try {
      await submitMutation.mutateAsync();
      setStep(3); // Go to submitted
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full">
      {/* Premium Step Indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500"
          style={{ width: `${(step / (WIZARD_STEPS.length - 1)) * 100}%` }}
        ></div>
        
        {WIZARD_STEPS.map((s, i) => (
          <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 flex-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500",
              step >= i ? "bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-white" : "bg-white border-2 border-gray-200 text-gray-400"
            )}>
              {step > i ? '✓' : i + 1}
            </div>
            <span className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              step >= i ? "text-blue-600" : "text-gray-400"
            )}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: IDENTITY */}
      {step === 0 && (
        <Card className="border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold text-gray-900">Select Document Type</CardTitle>
            <CardDescription className="text-gray-500 font-medium text-base">
              To comply with RBI guidelines, we need to verify your identity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isRulesLoading ? (
              <div className="py-8 text-center text-gray-500">Loading requirements...</div>
            ) : REQUIRED_DOCS.filter((d: any) => d.type === 'PAN').length === 0 ? (
              <div className="py-8 text-center text-gray-500">No identity documents required.</div>
            ) : (
              REQUIRED_DOCS.filter((d: any) => d.type === 'PAN').map((doc: any) => (
                <div 
                  key={doc.type}
                  onClick={() => setActiveDoc(doc.type)}
                  className={cn(
                    "border-2 rounded-xl p-5 cursor-pointer transition-all flex items-center justify-between",
                    activeDoc === doc.type ? "border-blue-600 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-full", activeDoc === doc.type ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500")}>
                      <doc.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900">{doc.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{doc.reason}</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", activeDoc === doc.type ? "border-blue-600 bg-blue-600" : "border-gray-300")}>
                    {activeDoc === doc.type && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>
              ))
            )}

            <div className="pt-6 border-t border-gray-100">
              <DocumentUploadCard 
                docType={activeDoc} 
                title={REQUIRED_DOCS.find((d: any) => d.type === activeDoc)?.name || activeDoc} 
                description={`Upload a clear picture of your ${REQUIRED_DOCS.find((d: any) => d.type === activeDoc)?.name || activeDoc}.`} 
                existingDoc={getDoc(activeDoc)}
                onSuccess={() => {}}
              />
            </div>

            <div className="flex justify-end pt-6">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 font-bold px-8"
                disabled={!hasDoc(activeDoc)}
                onClick={() => { 
                  setStep(1); 
                  const nextDocs = REQUIRED_DOCS.filter((d: any) => d.type !== 'PAN');
                  if(nextDocs.length > 0) setActiveDoc(nextDocs[0].type); 
                }}
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: TRAVEL DOCUMENTS */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-8 duration-500">
          {/* Document Checklist Sidebar */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="font-bold text-gray-900 mb-4">Required Documents</h3>
            {REQUIRED_DOCS.filter((d: any) => d.type !== 'PAN').map(doc => {
              const isDone = hasDoc(doc.type);
              const isActive = activeDoc === doc.type;
              return (
                <div 
                  key={doc.type}
                  onClick={() => setActiveDoc(doc.type)}
                  className={cn(
                    "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3",
                    isActive ? "border-blue-600 bg-blue-50/50" : "border-gray-100 hover:border-blue-200 bg-white",
                    isDone && !isActive && "border-emerald-200 bg-emerald-50/20"
                  )}
                >
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0", isDone ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400")}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <doc.icon className="w-3 h-3" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn("font-bold text-sm", isActive ? "text-blue-900" : "text-gray-700")}>{doc.name}</p>
                    <p className="text-xs text-gray-400 font-medium">{doc.required ? 'Required' : 'Optional'}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Upload Area */}
          <div className="md:col-span-8">
            <Card className="border-gray-200 shadow-sm h-full">
              <CardContent className="p-6">
                {REQUIRED_DOCS.map(doc => doc.type === activeDoc && (
                  <div key={doc.type} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                        <doc.icon className="w-6 h-6 text-blue-600" /> {doc.name}
                      </h2>
                      <p className="text-sm text-gray-500 font-medium mt-2">{doc.reason}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 self-center">Used For:</span>
                        {doc.usedFor.map((u: string) => (
                          <span key={u} className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">✓ {u}</span>
                        ))}
                      </div>
                    </div>
                    
                    <DocumentUploadCard 
                      docType={doc.type} 
                      title={doc.name} 
                      description={`Upload a clear color copy of your ${doc.name.toLowerCase()}.`} 
                      existingDoc={getDoc(doc.type)}
                      onSuccess={() => {}}
                    />
                  </div>
                ))}
                
                <div className="flex justify-between pt-8 mt-auto border-t border-gray-100">
                  <Button variant="ghost" onClick={() => setStep(0)} className="font-bold text-gray-500">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 font-bold px-8"
                    disabled={REQUIRED_DOCS.filter(d => d.required).some(d => !hasDoc(d.type))}
                    onClick={() => setStep(2)}
                  >
                    Review Application <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW */}
      {step === 2 && (
        <Card className="border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold text-gray-900">Review Application</CardTitle>
            <CardDescription className="text-gray-500 font-medium text-base">
              Verify your extracted details before final submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Identity Data</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Full Name</span>
                    <span className="font-bold text-gray-900">{getDoc('PASSPORT')?.ocrData?.extractedData?.fullName || '---'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Passport Number</span>
                    <span className="font-bold text-gray-900">{getDoc('PASSPORT')?.ocrData?.extractedData?.documentNumber || '---'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">PAN Number</span>
                    <span className="font-bold text-gray-900">{getDoc('PAN')?.ocrData?.extractedData?.documentNumber || '---'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Uploaded Documents</h4>
                <div className="space-y-3 text-sm">
                  {documents.map(d => (
                    <div key={d.id} className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {d.docType}
                      </span>
                      <span className="text-xs font-mono text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded">
                        {d.ocrData?.ocrConfidence}% Match
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex justify-between pt-6 border-t border-gray-100 mt-8">
              <Button variant="ghost" onClick={() => setStep(1)} className="font-bold text-gray-500" disabled={submitMutation.isPending}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-10"
                onClick={handleFinalSubmit}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit to Compliance'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: SUBMITTED */}
      {step === 3 && (
        <Card className="border-gray-200 shadow-sm text-center py-16 animate-in zoom-in-95 duration-500">
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                {orderId ? '✓ Documents Submitted Successfully' : 'KYC Submitted Successfully'}
              </h2>
              <p className="text-gray-500 font-medium mt-3 max-w-md mx-auto">
                {orderId
                  ? 'Your documents have been sent for verification.'
                  : 'Your application is now under review by our compliance engine.'}
              </p>
              {orderId ? (
                <div className="mt-4 inline-flex flex-col items-center gap-1 bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-3">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Estimated verification time</span>
                  <span className="text-2xl font-extrabold text-indigo-700">2–24 Hours</span>
                </div>
              ) : (
                <p className="text-gray-400 font-medium mt-2 text-sm">Standard processing time is 5-15 minutes.</p>
              )}
            </div>
            {orderId ? (
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button
                  onClick={() => window.location.href = '/dashboard/remittances'}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8"
                >
                  Track Your Transfer →
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard'}
                  className="font-bold text-gray-600"
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <Button onClick={() => window.location.href = '/dashboard'} className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-10 mt-6">
                Go to Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
