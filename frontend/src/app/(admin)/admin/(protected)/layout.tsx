import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'COMPLIANCE_ADMIN']}>
      <div className="flex h-screen bg-slate-50 font-sans">
        <AdminSidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
