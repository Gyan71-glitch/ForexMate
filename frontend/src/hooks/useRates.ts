import { useQuery } from '@tanstack/react-query';
import { getLiveRates } from '@/lib/api-public';

// We fetch rates and cache them so multiple components on the same page don't make duplicate requests.
export function useRates() {
  return useQuery({
    queryKey: ['liveRates'],
    queryFn: getLiveRates,
    staleTime: 60 * 1000, // Cache for 1 minute before refetching in background
    refetchOnWindowFocus: false,
  });
}
