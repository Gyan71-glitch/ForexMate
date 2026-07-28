import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '../api/supportApi';
import { SupportTicket, TicketCategory } from '../types';

export function useTicketCategories() {
  return useQuery<TicketCategory[]>({
    queryKey: ['supportCategories'],
    queryFn: supportApi.getCategories,
  });
}

export function useMyTickets() {
  return useQuery<SupportTicket[]>({
    queryKey: ['myTickets'],
    queryFn: supportApi.getMyTickets,
  });
}

export function useTicketDetails(id: string) {
  return useQuery<SupportTicket>({
    queryKey: ['ticket', id],
    queryFn: () => supportApi.getTicketDetails(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supportApi.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
    },
  });
}

export function useAddTicketMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, message, type }: { ticketId: string; message: string; type?: string }) => 
      supportApi.addMessage(ticketId, message, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) => 
      supportApi.updateStatus(ticketId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
    },
  });
}
