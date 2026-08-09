import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api';
import { toast } from 'sonner';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getOrders(),
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useRequestCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => ordersApi.requestCancel(id, reason),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', data.id] });
      toast.success('Cancellation request submitted to manager.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to request cancellation.');
    }
  });
}
