import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useSyncStream() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('forexmate_token');
    if (!token) return;

    // Use absolute URL targeting NestJS backend port
    const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const backendUrl = rawBackendUrl.endsWith('/api/v1') ? rawBackendUrl.slice(0, -7) : rawBackendUrl;
    const sseUrl = `${backendUrl}/api/v1/sync/events?token=${token}`;
    
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log('[Sync Engine] Real-time event received:', msg);

        // 1. Dispatch native browser event for classic components
        window.dispatchEvent(new CustomEvent('forexmate-sync', { detail: msg }));

        // 2. Invalidate React Query keys
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['liveRates'] });
      } catch (err) {
        console.error('[Sync Engine] Error processing event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('[Sync Engine] EventSource disconnected, auto-reconnecting...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);
}
