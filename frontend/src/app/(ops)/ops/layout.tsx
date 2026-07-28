"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { InAppNotificationListener } from '@/components/notifications/InAppNotificationListener';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export default function OperationsPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['CENTRAL_STAFF', 'OPERATIONS_ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF', 'BRANCH_OPERATIONS']}>
      <InAppNotificationListener />
      <div className="flex h-screen bg-slate-950 text-slate-100">
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex-shrink-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <span className="text-xl">🏛️</span>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">Central Operations</h2>
                <p className="text-[11px] text-indigo-400 font-semibold">Head Office Queue</p>
              </div>
            </div>
            <nav className="space-y-2 text-sm font-medium">
              <a href="/ops/tasks" className="block hover:bg-slate-800 text-slate-200 font-semibold px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950">
                🌐 Nationwide Queue
              </a>
              <a href="/ops/kyc" className="block hover:bg-slate-800 text-slate-400 hover:text-white px-3 py-2.5 rounded-lg">
                📋 Dynamic KYC & Compliance
              </a>
              <a href="/ops/inventory" className="block hover:bg-slate-800 text-slate-400 hover:text-white px-3 py-2.5 rounded-lg">
                📦 Central Cash Allocation
              </a>
            </nav>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-3 px-1">
              Logged in: <strong className="text-white block truncate">{user?.fullName || user?.email}</strong>
            </div>
            <button 
              onClick={logout}
              className="w-full text-left flex items-center gap-2 hover:bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-800"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold px-2.5 py-1 rounded-full">
                CENTRAL HQ QUEUE
              </span>
              <span className="text-sm font-semibold text-slate-300">
                Nationwide Order Processing & Compliance Center
              </span>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          </header>
          <div className="flex-1 p-8 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
