import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '../api';

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: documentsApi.getInvoices,
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => documentsApi.getInvoiceById(id),
    enabled: !!id,
  });
};

export const useReceipts = () => {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: documentsApi.getReceipts,
  });
};
