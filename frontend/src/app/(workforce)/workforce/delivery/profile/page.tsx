"use client";
import { useWorkforceAuth } from '@/context/WorkforceAuthContext';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/workforce/MobileUI';

const DELIVERY_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/workforce/delivery' },
  { id: 'orders', label: 'Deliveries', icon: '🚚', href: '/workforce/delivery/orders' },
  { id: 'history', label: 'History', icon: '📋', href: '/workforce/delivery/history' },
  { id: 'profile', label: 'Profile', icon: '👤', href: '/workforce/delivery/profile' },
];

export default function DeliveryProfilePage() {
  const { employee, logout } = useWorkforceAuth();
  const router = useRouter();

  return (
    <div style={{ paddingBottom: 80, background: '#f8fafc', minHeight: '100dvh' }}>
      <div style={{ background: 'linear-gradient(135deg, #064e3b, #065f46, #059669)', padding: '32px 20px 28px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 14px' }}>
          {employee?.name?.charAt(0) || '🚚'}
        </div>
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>{employee?.name}</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '0 0 8px', fontWeight: 600 }}>{employee?.employeeCode}</p>
        <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)' }}>Delivery Partner</span>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '1px solid #f1f5f9', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Account Information</p>
          {[
            { icon: '🏢', label: 'Branch', value: employee?.branchName || 'N/A' },
            { icon: '📱', label: 'Phone', value: employee?.phone || 'N/A' },
            { icon: '📧', label: 'Email', value: employee?.email || 'N/A' },
            { icon: '🪪', label: 'Employee ID', value: employee?.employeeCode || 'N/A' },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ fontSize: 14, color: '#111827', fontWeight: 700, margin: 0 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => router.push('/workforce/change-password')} style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: 'none', background: '#d1fae5', color: '#065f46', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}>
            🔐 Change Password
          </button>
          <button onClick={() => { if (confirm('Logout?')) logout(); }} style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}>
            🚪 Logout
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, color: '#9ca3af', fontSize: 11 }}>
          <p style={{ margin: '0 0 4px' }}>Forexmate Workforce v1.0</p>
          <p style={{ margin: 0 }}>🔒 Encrypted & Secure</p>
        </div>
      </div>

      <BottomNav tabs={DELIVERY_TABS} active="profile" theme="emerald" />
    </div>
  );
}
