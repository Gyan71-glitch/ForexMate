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

export default function PickupOrdersPage() {
  const { employee, loading: authLoading } = useWorkforceAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  useEffect(() => {
    if (!authLoading && !employee) router.replace('/workforce/login');
  }, [employee, authLoading, router]);

  useEffect(() => {
    if (!employee) return;
    workforceFetch('/orders')
      .then(workforceJson)
      .then((d) => setOrders(d.pickup || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [employee]);

  if (authLoading || loading) return <LoadingScreen message="Loading pickup orders..." />;

  const filtered = orders.filter(o => {
    if (filter === 'PENDING') return !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status);
    if (filter === 'COMPLETED') return o.status === 'COMPLETED';
    return true;
  });

  return (
    <div style={{ paddingBottom: 80, background: '#f8fafc', minHeight: '100dvh' }}>
      <MobileHeader title="Pickup Orders" subtitle={`${orders.filter(o => !['COMPLETED','CANCELLED','REJECTED'].includes(o.status)).length} active`} />

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
        {(['ALL', 'PENDING', 'COMPLETED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', background: filter === f ? '#4338CA' : '#f3f4f6', color: filter === f ? 'white' : '#6b7280', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <EmptyState icon="📦" title="No Pickup Orders" message="No pickup orders match your filter. You're all caught up!" />
        ) : (
          filtered.map((order: any) => (
            <OrderCard key={order.id} order={order} onClick={() => router.push(`/workforce/cashier/pickup/${order.id}`)} theme="indigo" />
          ))
        )}
      </div>

      <BottomNav tabs={CASHIER_TABS} active="pickup" theme="indigo" />
    </div>
  );
}
