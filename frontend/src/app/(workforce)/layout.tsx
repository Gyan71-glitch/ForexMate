import type { Metadata } from 'next';
import { WorkforceAuthProvider } from '@/context/WorkforceAuthContext';

export const metadata: Metadata = {
  title: 'Forexmate Workforce',
  description: 'Forexmate Operational Workforce App for Cashiers and Delivery Partners',
};

export default function WorkforceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkforceAuthProvider>
      <div style={{ minHeight: '100dvh', maxWidth: '480px', margin: '0 auto', background: '#fff', position: 'relative' }}>
        {children}
      </div>
    </WorkforceAuthProvider>
  );
}
