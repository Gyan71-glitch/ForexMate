"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { MarketWidget } from '@/components/dashboard/MarketWidget';
import { RecentOrdersTable } from '@/components/dashboard/RecentOrdersTable';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { formatCurrencyINR, formatDate } from '@/lib/utils';
import { 
  CreditCard, ShoppingBag, ShieldCheck, Activity, 
  Clock, CheckCircle, FileText, Calendar, ShieldAlert 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function DashboardOverview() {
  const { user } = useAuth();
  const { data: summary, isLoading, error } = useDashboardSummary();
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !summary) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Failed to load dashboard summary.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
      </div>
    );
  }

  const isKycVerified = summary.kycStatus === 'VERIFIED';
  const remainingLRS = Math.max(0, 10000000 - summary.lrsUsage); // ₹100 Lakhs (1 Crore INR) Limit

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-500 font-medium mt-1">Here is what's happening with your Forexmate account today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-bold border-gray-300">Download Statement</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md" onClick={() => window.location.href = '/buy-forex'}>
            New Order
          </Button>
        </div>
      </div>

      {/* KYC Alert Banner */}
      {!isKycVerified && (
        <Alert className="bg-amber-50 border-amber-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <ShieldAlert className="w-32 h-32 text-amber-600" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <AlertTitle className="text-amber-800 font-extrabold tracking-tight text-lg">Action Required: Complete your KYC</AlertTitle>
                <AlertDescription className="text-amber-700 font-medium mt-1">
                  You cannot place orders above $1,000 without completing standard RBI KYC compliance.
                </AlertDescription>
              </div>
            </div>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold whitespace-nowrap shadow-sm border-none">
              Verify Identity Now
            </Button>
          </div>
        </Alert>
      )}

      {/* KPIs Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Active Forex Cards" 
          value={summary.activeForexCards.toString()} 
          icon={CreditCard} 
          className="bg-gradient-to-br from-blue-900 to-slate-900 text-white border-none"
        />
        <StatsCard 
          title="Total Orders" 
          value={summary.totalOrders.toString()} 
          icon={ShoppingBag} 
        />
        <StatsCard 
          title="LRS Usage (FY 24-25)" 
          value={formatCurrencyINR(summary.lrsUsage)} 
          icon={Activity} 
          description={`${formatCurrencyINR(remainingLRS)} remaining`} 
        />
        <StatsCard 
          title="KYC Status" 
          value={summary.kycStatus.replace(/_/g, ' ')} 
          icon={ShieldCheck} 
          description={isKycVerified ? "Fully Verified" : "Limits are restricted"} 
        />
      </div>

      {/* KPIs Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Pending Orders" 
          value={summary.pendingOrders.toString()} 
          icon={Clock} 
        />
        <StatsCard 
          title="Completed Orders" 
          value={summary.completedOrders.toString()} 
          icon={CheckCircle} 
        />
        <StatsCard 
          title="Active Quotes" 
          value={summary.activeQuotes.toString()} 
          icon={FileText} 
        />
        <StatsCard 
          title="Last Order Date" 
          value={summary.lastOrderDate ? formatDate(summary.lastOrderDate) : 'Never'} 
          icon={Calendar} 
        />
      </div>

      {/* Complex Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table taking up 2 columns on large screens */}
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={summary.recentOrders} />
        </div>

        {/* Live Market Rates taking 1 column */}
        <div className="lg:col-span-1">
          <MarketWidget />
        </div>
        
      </div>
    </div>
  );
}
