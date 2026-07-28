import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '../api';

export const useMyCards = () => {
  return useQuery({
    queryKey: ['forex-cards'],
    queryFn: cardsApi.getMyCards,
  });
};

export const useCard = (id: string) => {
  return useQuery({
    queryKey: ['forex-cards', id],
    queryFn: () => cardsApi.getCardById(id),
    enabled: !!id,
  });
};

export const useMyCardTransactions = () => {
  return useQuery({
    queryKey: ['card-transactions'],
    queryFn: cardsApi.getMyTransactions,
  });
};

export const useFreezeCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cardsApi.freezeCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forex-cards'] }),
  });
};

export const useUnfreezeCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cardsApi.unfreezeCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forex-cards'] }),
  });
};
