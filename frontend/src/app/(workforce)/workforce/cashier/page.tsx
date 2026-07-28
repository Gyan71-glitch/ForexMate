"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkforceAuth } from '@/context/WorkforceAuthContext';
import { workforceFetch, workforceJson } from '@/lib/workforceApi';
import { BottomNav, StatCard, OrderCard, LoadingScreen, EmptyState } from '@/components/workforce/MobileUI';

const CASHIER_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/workforce/cashier' },
  { id: 'pickup', label: 'Pickups', icon: '📦', href: '/workforce/cashier/pickup' },
  { id: 'cash-sell', label: 'Cash Sell', icon: '💱', href: '/workforce/cashier/cash-sell' },
  { id: 'history', label: 'History', icon: '📋', href: '/workforce/cashier/history' },
  { id: 'profile', label: 'Profile', icon: '👤', href: '/workforce/cashier/profile' },
];

export default function CashierDashboard() {
  const { employee, loading: authLoading } = useWorkforceAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any>({ pickup: [], cashSell: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !employee) router.replace('/workforce/login');
    if (!authLoading && employee?.mustChangePassword) router.replace('/workforce/change-password');
    if (!authLoading && employee && employee.role !== 'BRANCH_CASHIER') {
      if (employee.role === 'BRANCH_MANAGER') router.replace('/workforce/manager');
      else if (employee.role === 'DELIVERY_PARTNER') router.replace('/workforce/delivery');
      else router.replace('/workforce/login');
    }
  }, [employee, authLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await workforceFetch('/orders');
        const data = await workforceJson(res);
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    if (employee) fetchOrders();
  }, [employee]);

  if (authLoading || loading) return <LoadingScreen message="Loading your workspace..." />;
  if (!employee) return null;

  const pickupOrders: any[] = orders.pickup || [];
  const cashSellOrders: any[] = orders.cashSell || [];
  const pendingPickups = pickupOrders.filter((o: any) => o.status !== 'COMPLETED').length;
  const pendingCashSell = cashSellOrders.filter((o: any) => o.status !== 'COMPLETED').length;
  const completedToday = [...pickupOrders, ...cashSellOrders].filter((o: any) => o.fulfillmentStatus?.includes('COMPLETED')).length;

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #4338CA)', padding: '24px 20px 28px' }}>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Branch Cashier</p>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 900, margin: '0 0 2px' }}>Good {getGreeting()}, {employee.name.split(' ')[0]}! 👋</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0 }}>{employee.branchName}</p>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '12px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1 }}>{pendingPickups}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 4 }}>Pending Pickups</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '12px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1 }}>{pendingCashSell}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 4 }}>Cash Sell</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '12px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#86efac', lineHeight: 1 }}>{completedToday}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 4 }}>Completed</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Quick Actions</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <QuickActionCard icon="📦" title="Pickup Orders" count={pendingPickups} color="#4338CA" bg="#eef2ff" href="/workforce/cashier/pickup" />
          <QuickActionCard icon="💱" title="Cash Sell" count={pendingCashSell} color="#7c3aed" bg="#f5f3ff" href="/workforce/cashier/cash-sell" />
          <QuickActionCard icon="📋" title="History" count={null} color="#0369a1" bg="#e0f2fe" href="/workforce/cashier/history" />
          <QuickActionCard icon="👤" title="My Profile" count={null} color="#0f766e" bg="#ccfbf1" href="/workforce/cashier/profile" />
        </div>
      </div>

      {/* Recent Pickups */}
      {pickupOrders.length > 0 && (
        <div style={{ padding: '20px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Recent Pickups</p>
            <a href="/workforce/cashier/pickup" style={{ fontSize: 12, color: '#4338CA', fontWeight: 700, textDecoration: 'none' }}>See all</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pickupOrders.slice(0, 3).map((order: any) => (
              <OrderCard key={order.id} order={order} onClick={() => router.push(`/workforce/cashier/pickup/${order.id}`)} theme="indigo" />
            ))}
          </div>
        </div>
      )}

      {/* Recent Cash Sells */}
      {cashSellOrders.length > 0 && (
        <div style={{ padding: '20px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Recent Cash Sells</p>
            <a href="/workforce/cashier/cash-sell" style={{ fontSize: 12, color: '#4338CA', fontWeight: 700, textDecoration: 'none' }}>See all</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cashSellOrders.slice(0, 3).map((order: any) => (
              <OrderCard key={order.id} order={order} onClick={() => router.push(`/workforce/cashier/cash-sell/${order.id}`)} theme="indigo" />
            ))}
          </div>
        </div>
      )}

      {pickupOrders.length === 0 && cashSellOrders.length === 0 && (
        <EmptyState icon="🎉" title="All Done!" message="No orders assigned to you at the moment. Check back later." />
      )}

      <BottomNav tabs={CASHIER_TABS} active="dashboard" theme="indigo" />
    </div>
  );
}

function QuickActionCard({ icon, title, count, color, bg, href }: { icon: string; title: string; count: number | null; color: string; bg: string; href: string }) {
  return (
    <a href={href} style={{ background: bg, borderRadius: 16, padding: '16px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8, border: `1.5px solid ${bg}`, transition: 'transform 0.15s' }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 13, fontWeight: 800, color, margin: '0 0 2px' }}>{title}</p>
        {count !== null && <p style={{ fontSize: 11, color, margin: 0, opacity: 0.7, fontWeight: 600 }}>{count} pending</p>}
      </div>
    </a>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
