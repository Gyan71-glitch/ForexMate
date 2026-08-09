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

const DEFAULT_SUMMARY: DashboardSummary = {
  totalOrders: 0,
  activeForexCards: 0,
  lrsUsage: 0,
  kycStatus: 'PENDING',
  pendingOrders: 0,
  completedOrders: 0,
  activeQuotes: 0,
  lastOrderDate: null,
  recentOrders: []
};

export function useDashboardSummary() {
  return useQuery<DashboardSummary, Error>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      try {
        const response = await authFetch('/api/v1/dashboard/summary');
        if (!response.ok) return DEFAULT_SUMMARY;
        const data = await apiJson<DashboardSummary>(response);
        return data || DEFAULT_SUMMARY;
      } catch (err) {
        return DEFAULT_SUMMARY;
      }
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
