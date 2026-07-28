"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkforceAuth } from '@/context/WorkforceAuthContext';
import { workforceFetch, workforceJson } from '@/lib/workforceApi';
import { BottomNav, MobileHeader, OrderCard, LoadingScreen, EmptyState } from '@/components/workforce/MobileUI';

const CASHIER_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/workforce/cashier' },
  { id: 'pickup', label: 'Pickups', icon: '📦', href: '/workforce/cashier/pickup' },
  { id: 'cash-sell', label: 'Cash Sell', icon: '💱', href: '/workforce/cashier/cash-sell' },
  { id: 'history', label: 'History', icon: '📋', href: '/workforce/cashier/history' },
  { id: 'profile', label: 'Profile', icon: '👤', href: '/workforce/cashier/profile' },
];

export default function CashierHistoryPage() {
  const { employee, loading: authLoading } = useWorkforceAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !employee) router.replace('/workforce/login');
  }, [employee, authLoading, router]);

  useEffect(() => {
    if (!employee) return;
    workforceFetch('/orders/history')
      .then(workforceJson)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [employee]);

  if (authLoading || loading) return <LoadingScreen message="Loading history..." />;

  return (
    <div style={{ paddingBottom: 80, background: '#f8fafc', minHeight: '100dvh' }}>
      <MobileHeader title="Order History" subtitle={`${orders.length} completed orders`} />
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {orders.length === 0 ? (
          <EmptyState icon="📋" title="No History Yet" message="Your completed orders will appear here." />
        ) : (
          orders.map((order: any) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => router.push(`/workforce/cashier/${order.productType === 'CASH_SELL' ? 'cash-sell' : 'pickup'}/${order.id}`)}
              theme="indigo"
            />
          ))
        )}
      </div>
      <BottomNav tabs={CASHIER_TABS} active="history" theme="indigo" />
    </div>
  );
}
