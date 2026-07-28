"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ShieldAlert, LogOut, ArrowRight } from 'lucide-react';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const getDashboardPath = () => {
    if (!user) return '/login';
    const role = user.role;
    if (role === 'SUPER_ADMIN') return '/admin';
    if (role === 'BRANCH_MANAGER') return '/manager/dashboard';
    if (role === 'STAFF' || role === 'BRANCH_OPERATIONS') return '/ops/tasks';
    return '/dashboard'; // default customer dashboard
  };

  const handleGoToDashboard = () => {
    router.push(getDashboardPath());
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-lg text-center space-y-6 animate-in fade-in zoom-in duration-300">
        
        {/* Shield Icon */}
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
          <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Denied</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            You do not have the required permissions to view this page. This happens when you switch users or portals in another tab.
          </p>
          {user && (
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-650 font-semibold inline-block">
              Logged in as: <span className="text-slate-900">{user.fullName} ({user.role})</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Button 
            onClick={handleGoToDashboard}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-1.5"
          >
            Go to My Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={logout}
            className="w-full border-slate-200 text-slate-600 font-bold flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Sign Out / Switch Account
          </Button>
        </div>

      </div>
    </div>
  );
}
