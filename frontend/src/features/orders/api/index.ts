import { authFetch, apiJson } from '@/lib/api';
import { Order } from '../types';

export const ordersApi = {
  getOrders: async (): Promise<Order[]> => {
    const response = await authFetch('/api/v1/orders');
    return apiJson<Order[]>(response);
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await authFetch(`/api/v1/orders/${id}`);
    return apiJson<Order>(response);
  },

  requestCancel: async (id: string, reason: string): Promise<Order> => {
    const response = await authFetch(`/api/v1/orders/${id}/request-cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return apiJson<Order>(response);
  },
};
