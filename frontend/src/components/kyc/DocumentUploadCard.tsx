'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, FileText, Camera, File, Image as ImageIcon, X, RefreshCw, Trash2, Eye, Lock, Shield, Clock, ShieldCheck, PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUploadKyc, useDeleteKyc, useSendOtp, useVerifyOtp } from '../../features/compliance/hooks/useKyc';
import { Button } from '@/components/ui/button';
import { KycDocument } from '../../features/compliance/types';
import { useDev } from '@/components/devtools/DevContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';


interface DocumentUploadCardProps {
  docType: string;
  title: string;
  description: string;
  existingDoc?: KycDocument;
  onSuccess: () => void;
}

export function DocumentUploadCard({ docType, title, description, existingDoc, onSuccess }: DocumentUploadCardProps) {
  const { devFlags } = useDev();
  const skipOcr = devFlags?.skipOcr;
  const skipOtp = devFlags?.skipOtp;

  const [file, setFile] = useState<File | null>(null);
  const [ocrStep, setOcrStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState<'IDLE' | 'SENT' | 'VERIFIED'>('IDLE');
  const [otpValue, setOtpValue] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    documentNumber: '',
    fullName: '',
    dob: '',
    expiryDate: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || '');

  useEffect(() => {
    // Reset state when switching between document types
    setFormData({ documentNumber: '', fullName: '', dob: '', expiryDate: '' });
    setOtpStep('IDLE');
    setOtpValue('');
    setError(null);
    setDevOtpCode(null);
    setCountdown(0);
  }, [docType]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);
  
  const uploadMutation = useUploadKyc();
  const deleteMutation = useDeleteKyc();
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError('File too large. Maximum size is 5MB.');
        return;
      }
      setFile(selected);
      setError(null);
      startOcrSimulation(selected);
    }
  };

  const startOcrSimulation = (selectedFile: File) => {
    const ocrSpeed = skipOcr ? 125 : 1500;
    setOcrStep(1); // Uploading
    setTimeout(() => setOcrStep(2), ocrSpeed); // Reading Document
    setTimeout(() => setOcrStep(3), ocrSpeed * 2); // Extracting Fields
    setTimeout(() => setOcrStep(4), ocrSpeed * 3); // Verifying
    setTimeout(() => completeUpload(selectedFile), ocrSpeed * 4);
  };


  const completeUpload = async (selectedFile: File) => {
    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        docType,
        // Pass the user-typed values so OCR can use them as fallback
        knownDocNumber: formData.documentNumber || undefined,
        knownDob: formData.dob || undefined,
        knownName: formData.fullName || undefined,
        knownExpiryDate: formData.expiryDate || undefined,
      });
      setFile(null);
      setOcrStep(0);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setOcrStep(0);
      setFile(null);
    }
  };

  const handleDelete = async () => {
    if (existingDoc) {
      await deleteMutation.mutateAsync(existingDoc.id);
    }
  };

  if (existingDoc) {
    const ocr = existingDoc.ocrData?.extractedData;
    const confidence = existingDoc.ocrData?.ocrConfidence;
    const isRejected = existingDoc.status === 'REJECTED';
    const latestReviewNotes = existingDoc.reviews?.[0]?.notes;

    if (isRejected) {
      return (
        <div className="border-2 border-red-500 bg-red-50/20 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 bg-red-100 text-red-650 text-red-650 text-red-650 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <X className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-red-900 text-lg truncate animate-pulse" title={existingDoc.filePath}>{existingDoc.filePath}</h3>
                <p className="text-sm text-red-700 font-black mt-1">❌ Document Rejected</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-white border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 font-bold" onClick={handleDelete} disabled={deleteMutation.isPending}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete & Re-upload
              </Button>
            </div>
          </div>

          {latestReviewNotes && (
            <div className="bg-white rounded-xl border border-red-100 p-4 shadow-inner">
              <h4 className="text-xs font-black text-red-700 uppercase tracking-wider mb-1">Reason for Rejection</h4>
              <p className="text-xs text-gray-700 font-semibold leading-relaxed">{latestReviewNotes}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="border-2 border-emerald-500 bg-emerald-50/20 rounded-2xl p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-emerald-900 text-lg truncate" title={existingDoc.filePath}>{existingDoc.filePath}</h3>
              <p className="text-sm text-emerald-700 font-medium mt-1">✓ Uploaded & Verified</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white" onClick={() => window.open(`/uploads/${existingDoc.filePath}`, '_blank')}>
              <Eye className="w-4 h-4 mr-2" /> Preview
            </Button>
            <Button variant="outline" size="sm" className="bg-white text-red-600 hover:text-red-700" onClick={handleDelete} disabled={deleteMutation.isPending}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        {ocr && (
          <div className="mt-6 bg-white rounded-xl border border-emerald-100 p-4">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">OCR Data Extracted</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Document Number</p>
                <p className="font-mono text-sm font-bold text-gray-900 mt-0.5">{ocr.documentNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Full Name</p>
                <p className="font-mono text-sm font-bold text-gray-900 mt-0.5">{ocr.name || ocr.fullName || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">
                  {docType === 'PAN' ? 'Date of Birth' : 'Date of Birth'}
                </p>
                <p className="font-mono text-sm font-bold text-gray-900 mt-0.5">
                  {ocr.dob || '---'}
                </p>
              </div>
              {docType === 'PASSPORT' ? (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Expiry Date</p>
                  <p className="font-mono text-sm font-bold text-gray-900 mt-0.5">
                    {ocr.expiryDate || '---'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <p className="font-mono text-sm font-bold text-emerald-600 mt-0.5">Valid</p>
                </div>
              )}
              {docType === 'PASSPORT' && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <p className="font-mono text-sm font-bold text-emerald-600 mt-0.5">Valid</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const isFormValid = () => {
    if (skipOtp) return true;
    const recipient = mobileNumber || user?.mobile || user?.email;
    if (!recipient) return false;
    if (docType === 'PASSPORT') return formData.fullName && formData.documentNumber && formData.dob && formData.expiryDate && (otpStep === 'VERIFIED' || skipOtp);
    if (docType === 'PAN') return formData.documentNumber && formData.documentNumber.length === 10 && (otpStep === 'VERIFIED' || skipOtp);
    return true; // Aadhaar or Visa
  };

  return (
    <div className="space-y-4">
      {ocrStep === 0 && (docType === 'PASSPORT' || docType === 'PAN') && (
        <div className="mb-6 space-y-4 text-left border border-gray-200 p-5 rounded-xl bg-gray-50">
           <h4 className="font-bold text-gray-900 text-sm mb-2">Document Details</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {docType === 'PASSPORT' && (
               <>
                 <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Passport Number</label>
                   <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100" placeholder="e.g. Z9876543" value={formData.documentNumber} onChange={e => setFormData({...formData, documentNumber: e.target.value})} disabled={otpStep === 'VERIFIED' || skipOtp} />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Full Name</label>
                   <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="As per passport" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Date of Birth</label>
                   <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} disabled={otpStep === 'VERIFIED' || skipOtp} />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Expiry Date</label>
                   <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} disabled={otpStep === 'VERIFIED' || skipOtp} />
                 </div>
               </>
             )}
             {docType === 'PAN' && (
               <>
                 <div className="col-span-1 md:col-span-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">PAN Number</label>
                   <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase disabled:bg-gray-100" placeholder="ABCDE1234F" value={formData.documentNumber} onChange={e => setFormData({...formData, documentNumber: e.target.value.toUpperCase()})} disabled={otpStep === 'VERIFIED' || skipOtp} />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Date of Birth <span className="text-gray-400 font-normal">(as on PAN)</span></label>
                   <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} disabled={otpStep === 'VERIFIED' || skipOtp} />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Full Name <span className="text-gray-400 font-normal">(as on PAN)</span></label>
                   <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100" placeholder="As on your PAN card" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} disabled={otpStep === 'VERIFIED' || skipOtp} />
                 </div>
               </>
             )}             {/* Mobile Number Input if missing in Profile */}
             {(!user?.mobile && !skipOtp) && (
               <div className="col-span-1 md:col-span-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Registered Mobile Number</label>
                 <div className="relative">
                   <PhoneCall className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                   <input className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100" placeholder="e.g. +91 98765 43210" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} disabled={otpStep === 'VERIFIED'} />
                 </div>
               </div>
             )}

             <div className="col-span-1 md:col-span-2 mt-2">
                {skipOtp ? (
                  <div className="flex items-center justify-center p-3 text-emerald-700 font-bold border border-emerald-200 rounded-lg bg-emerald-50">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" /> OTP Verification Bypassed (Dev Mode)
                  </div>
                ) : (
                  <>
                    {otpStep === 'IDLE' && (
                      <Button type="button" variant="outline" className="w-full bg-blue-50 border-blue-200 text-blue-700 font-bold hover:bg-blue-100 flex items-center justify-center gap-2" onClick={async (e) => { 
                        e.stopPropagation(); 
                        console.log('OTP Send clicked. documentNumber:', formData.documentNumber, 'mobileNumber:', mobileNumber);
                        if(!formData.documentNumber) {
                          console.log('Error: documentNumber empty');
                          return setError('Enter document number first'); 
                        }
                        const recipient = mobileNumber || user?.mobile || user?.email || '';
                        if(!recipient) {
                          console.log('Error: recipient empty');
                          return setError('Please enter a valid mobile number or email');
                        }
                        setError(null); 
                        try {
                          console.log('Sending OTP request to:', recipient);
                          const res = await sendOtpMutation.mutateAsync({ recipient, purpose: `KYC_${docType}` });
                          console.log('OTP request successful. Response:', res);
                          if (res && (res as any).devCode) {
                            setDevOtpCode((res as any).devCode);
                          }
                          setOtpStep('SENT'); 
                          setCountdown(60);
                        } catch (err: any) {
                          console.error('Failed to send OTP:', err);
                          setError(err.message || 'Failed to send OTP');
                        }
                      }}>
                        <Lock className="w-4 h-4" /> {sendOtpMutation.isPending ? 'Sending Verification OTP...' : 'Authenticate & Send Verification OTP'}
                      </Button>
                    )}
                    
                    {error && (
                      <div className="mt-2 text-xs text-red-600 font-bold bg-red-50 border border-red-100 p-2.5 rounded-lg animate-in fade-in">
                        ⚠️ {error}
                      </div>
                    )}
                    
                    {otpStep === 'SENT' && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-xs font-semibold text-blue-800">
                            An OTP has been sent to <strong>{mobileNumber || user?.mobile || user?.email}</strong>.
                          </p>
                          {countdown > 0 ? (
                            <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1"><Clock size={12} /> Resend in {countdown}s</span>
                          ) : (
                            <button className="text-[10px] text-blue-600 hover:text-blue-700 font-bold underline" onClick={async (e) => {
                              e.stopPropagation();
                              setError(null);
                              try {
                                const res = await sendOtpMutation.mutateAsync({ recipient: mobileNumber || user?.mobile || user?.email || '', purpose: `KYC_${docType}` });
                                if (res && (res as any).devCode) {
                                  setDevOtpCode((res as any).devCode);
                                }
                                setCountdown(60);
                                toast.success('Verification OTP resent successfully!');
                              } catch (err: any) {
                                setError(err.message || 'Failed to send OTP');
                              }
                            }}>Resend OTP</button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter 6-digit OTP" maxLength={6} value={otpValue} onChange={e => setOtpValue(e.target.value)} />
                          <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={verifyOtpMutation.isPending} onClick={async (e) => { 
                            e.stopPropagation(); 
                            setError(null);
                            try {
                              const res = await verifyOtpMutation.mutateAsync({ recipient: mobileNumber || user?.mobile || user?.email || '', purpose: `KYC_${docType}`, code: otpValue });
                              if (res.verified) {
                                setOtpStep('VERIFIED');
                                setDevOtpCode(null);
                              } else {
                                setError('Invalid OTP code. Please check and try again.');
                              }
                            } catch (err: any) {
                              setError(err.message || 'Verification failed');
                            }
                          }}>
                            {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                          </Button>
                        </div>
                        {devOtpCode && (
                          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 flex items-center justify-between shadow-sm">
                            <span className="flex items-center gap-1.5"><Shield size={14} className="text-amber-600 shrink-0" /> [Sandbox Dev Mode] Verification code: <strong>{devOtpCode}</strong></span>
                            <button className="underline font-bold text-amber-950 hover:text-amber-900 ml-2" onClick={(e) => { e.stopPropagation(); setOtpValue(devOtpCode); }}>Auto-fill</button>
                          </div>
                        )}
                      </div>
                    )}
 
                    {otpStep === 'VERIFIED' && (
                      <div className="flex items-center justify-center p-3 text-emerald-800 font-bold border border-emerald-200 rounded-lg bg-emerald-50">
                        <ShieldCheck className="w-5 h-5 mr-2 text-emerald-500" /> {docType === 'PAN' ? 'PAN ID Card' : 'Passport Document'} Authenticated Successfully
                      </div>
                    )}
                  </>
                )}
             </div>
           </div>
        </div>
      )}


      <div
        onClick={() => {
          if (docType === 'PAN' && formData.documentNumber && formData.documentNumber.length !== 10) {
            setError('PAN number must be exactly 10 characters long.');
            return;
          }
          if (!isFormValid()) {
            setError('Please fill in the document details above before uploading.');
            return;
          }
          !ocrStep && fileInputRef.current?.click()
        }}
        className={cn(
          "border-2 border-dashed rounded-2xl p-10 text-center transition-all",
          ocrStep > 0 ? "border-blue-500 bg-blue-50/50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".jpg,.jpeg,.png,.pdf" 
          onChange={handleFileChange}
          disabled={ocrStep > 0}
        />
        
        {ocrStep === 0 ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg">Upload {title}</h3>
            <p className="text-sm text-gray-500 font-medium mt-2 max-w-sm">{description}</p>
            {error && <p className="text-sm text-red-500 mt-4 font-semibold">{error}</p>}
            
            <div className="flex gap-4 mt-8">
              <Button type="button" variant="outline" className="gap-2" onClick={(e) => { e.stopPropagation(); if (!isFormValid()) { setError('Please fill details first.'); return; } fileInputRef.current?.click(); }}>
                <Camera className="w-4 h-4" /> Take Photo
              </Button>
              <Button type="button" variant="outline" className="gap-2" onClick={(e) => { e.stopPropagation(); if (!isFormValid()) { setError('Please fill details first.'); return; } fileInputRef.current?.click(); }}>
                <ImageIcon className="w-4 h-4" /> Upload Image
              </Button>
              <Button type="button" variant="outline" className="gap-2" onClick={(e) => { e.stopPropagation(); if (!isFormValid()) { setError('Please fill details first.'); return; } fileInputRef.current?.click(); }}>
                <File className="w-4 h-4" /> Upload PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-6" />
            <div className="space-y-3 w-64 text-left">
              <p className={cn("text-sm font-semibold transition-colors", ocrStep >= 1 ? "text-blue-600" : "text-gray-400")}>
                {ocrStep > 1 ? '✓ Uploaded securely' : 'Uploading...'}
              </p>
              <p className={cn("text-sm font-semibold transition-colors", ocrStep >= 2 ? "text-blue-600" : "text-gray-400")}>
                {ocrStep > 2 ? '✓ Document identified' : ocrStep === 2 ? 'Reading Document...' : 'Waiting...'}
              </p>
              <p className={cn("text-sm font-semibold transition-colors", ocrStep >= 3 ? "text-blue-600" : "text-gray-400")}>
                {ocrStep > 3 ? '✓ Data extracted' : ocrStep === 3 ? 'Extracting Name & Details...' : 'Waiting...'}
              </p>
              <p className={cn("text-sm font-semibold transition-colors", ocrStep >= 4 ? "text-blue-600" : "text-gray-400")}>
                {ocrStep > 4 ? '✓ Verification complete' : ocrStep === 4 ? 'Running verification checks...' : 'Waiting...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
