"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkforceAuth } from '@/context/WorkforceAuthContext';
import { workforceFetch, workforceJson } from '@/lib/workforceApi';
import { BottomNav, MobileHeader, OrderCard, LoadingScreen, EmptyState } from '@/components/workforce/MobileUI';

const DELIVERY_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/workforce/delivery' },
  { id: 'orders', label: 'Deliveries', icon: '🚚', href: '/workforce/delivery/orders' },
  { id: 'history', label: 'History', icon: '📋', href: '/workforce/delivery/history' },
  { id: 'profile', label: 'Profile', icon: '👤', href: '/workforce/delivery/profile' },
];

export default function DeliveryHistoryPage() {
  const { employee, loading: authLoading } = useWorkforceAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !employee) router.replace('/workforce/login');
  }, [employee, authLoading, router]);

  useEffect(() => {
    if (!employee) return;
    workforceFetch('/orders/history').then(workforceJson).then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, [employee]);

  if (authLoading || loading) return <LoadingScreen message="Loading history..." />;

  return (
    <div style={{ paddingBottom: 80, background: '#f8fafc', minHeight: '100dvh' }}>
      <MobileHeader title="Delivery History" subtitle={`${orders.length} completed deliveries`} />
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {orders.length === 0 ? (
          <EmptyState icon="📋" title="No History Yet" message="Completed deliveries will appear here." />
        ) : (
          orders.map((o: any) => (
            <OrderCard key={o.id} order={o} onClick={() => router.push(`/workforce/delivery/orders/${o.id}`)} theme="emerald" />
          ))
        )}
      </div>
      <BottomNav tabs={DELIVERY_TABS} active="history" theme="emerald" />
    </div>
  );
}
