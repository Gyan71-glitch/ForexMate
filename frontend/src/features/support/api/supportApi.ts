import API_URL, { authFetch, apiJson } from '@/lib/api';
import { SupportTicket, TicketCategory } from '../types';

export const supportApi = {
  getCategories: async (): Promise<TicketCategory[]> => {
    const res = await authFetch(`${API_URL}/support/categories`);
    return apiJson(res);
  },

  getMyTickets: async (): Promise<SupportTicket[]> => {
    const res = await authFetch(`${API_URL}/support/my-tickets`);
    return apiJson(res);
  },

  getTicketDetails: async (id: string): Promise<SupportTicket> => {
    const res = await authFetch(`${API_URL}/support/tickets/${id}`);
    return apiJson(res);
  },

  createTicket: async (payload: Partial<SupportTicket>): Promise<SupportTicket> => {
    const res = await authFetch(`${API_URL}/support/tickets`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return apiJson(res);
  },

  addMessage: async (ticketId: string, message: string, type: string = 'TEXT'): Promise<any> => {
    const res = await authFetch(`${API_URL}/support/tickets/${ticketId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message, type }),
    });
    return apiJson(res);
  },

  updateStatus: async (ticketId: string, status: string): Promise<SupportTicket> => {
    const res = await authFetch(`${API_URL}/support/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return apiJson(res);
  }
};
