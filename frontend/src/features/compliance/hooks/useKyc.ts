import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kycApi } from '../api/kycApi';
import { UploadKycRequest } from '../types';

export const useKycRules = (product?: string, purpose?: string) => {
  return useQuery({
    queryKey: ['kyc-rules', product, purpose],
    queryFn: () => kycApi.getRules(product, purpose),
  });
};

export const useKycDocuments = () => {
  return useQuery({
    queryKey: ['kyc-documents'],
    queryFn: kycApi.getDocuments,
  });
};

export const useUploadKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { file: File; docType: string; knownDocNumber?: string; knownDob?: string; knownName?: string; knownExpiryDate?: string }) =>
      kycApi.uploadDocument(data.file, data.docType, data.knownDocNumber, data.knownDob, data.knownName, data.knownExpiryDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-documents'] });
    },
  });
};

export const useDeleteKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => kycApi.deleteDocument(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-documents'] });
    },
  });
};

export const useSubmitKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => kycApi.submitKyc(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-documents'] });
    },
  });
};

export const useSendOtp = () => {
  return useMutation({
    mutationFn: (data: { recipient: string; purpose: string }) => kycApi.sendOtp(data.recipient, data.purpose),
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (data: { recipient: string; purpose: string; code: string }) => kycApi.verifyOtp(data.recipient, data.purpose, data.code),
  });
};
