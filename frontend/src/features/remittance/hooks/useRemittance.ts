import { useQuery } from '@tanstack/react-query';
import { remittanceApi } from '../api';

export const useMyRemittances = () => {
  return useQuery({
    queryKey: ['remittances'],
    queryFn: remittanceApi.getMyRemittances,
  });
};

export const useRemittance = (id: string) => {
  return useQuery({
    queryKey: ['remittances', id],
    queryFn: () => remittanceApi.getRemittanceById(id),
    enabled: !!id,
  });
};

export const useRemittancePartners = () => {
  return useQuery({
    queryKey: ['remittance-partners'],
    queryFn: remittanceApi.getPartners,
  });
};
