import { useQuery } from '@tanstack/react-query';
import { apiJson, authFetch } from '@/lib/api';

export interface DashboardSummary {
  totalOrders: number;
  activeForexCards: number;
  lrsUsage: number;
  kycStatus: string;
  pendingOrders: number;
  completedOrders: number;
  activeQuotes: number;
  lastOrderDate: string | null;
  recentOrders: any[];
}

export function useDashboardSummary() {
  return useQuery<DashboardSummary, Error>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await authFetch('/api/v1/dashboard/summary');
      return apiJson<DashboardSummary>(response);
    },
    staleTime: 60 * 1000, // Cache for 1 minute
  });
}
