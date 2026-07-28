"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkforceAuth } from '@/context/WorkforceAuthContext';

export default function WorkforceRoot() {
  const { employee, loading } = useWorkforceAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!employee) {
      router.replace('/workforce/login');
    } else if (employee.mustChangePassword) {
      router.replace('/workforce/change-password');
    } else if (employee.role === 'BRANCH_MANAGER') {
      router.replace('/workforce/manager');
    } else if (employee.role === 'BRANCH_CASHIER') {
      router.replace('/workforce/cashier');
    } else if (employee.role === 'DELIVERY_PARTNER') {
      router.replace('/workforce/delivery');
    } else {
      router.replace('/workforce/login');
    }
  }, [employee, loading, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #4338CA', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
