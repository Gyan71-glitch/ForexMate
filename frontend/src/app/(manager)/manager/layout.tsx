"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { InAppNotificationListener } from '@/components/notifications/InAppNotificationListener';

export default function ManagerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'SUPER_ADMIN']}>
      <InAppNotificationListener />
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        {children}
      </div>
    </ProtectedRoute>
  );
}
