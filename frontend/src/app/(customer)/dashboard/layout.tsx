"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useNotificationStore } from '@/stores/notificationStore';
import { InAppNotificationListener } from '@/components/notifications/InAppNotificationListener';
import API_URL, { authFetch } from '@/lib/api';
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowRightLeft, 
  Send, 
  Users, 
  ShieldCheck, 
  FileText, 
  Bell, 
  LifeBuoy, 
  Plane, 
  User, 
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const sidebarGroups = [
  {
    title: 'Command Center',
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Active Orders', href: '/dashboard/orders', icon: ArrowRightLeft },
      { name: 'Forex Cards', href: '/dashboard/cards', icon: CreditCard },
      { name: 'Remittance', href: '/dashboard/remittances', icon: Send },
      { name: 'Dealer Desk', href: '/dashboard/dealer', icon: Briefcase },
    ]
  },
  {
    title: 'Compliance & Docs',
    items: [
      { name: 'KYC Wizard', href: '/dashboard/kyc', icon: ShieldCheck },
      { name: 'Beneficiaries', href: '/dashboard/beneficiaries', icon: Users },
      { name: 'Invoices & Receipts', href: '/dashboard/invoices', icon: FileText },
    ]
  },
  {
    title: 'Hubs',
    items: [
      { name: 'Travel Hub', href: '/dashboard/travel', icon: Plane },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { name: 'Support Tickets', href: '/dashboard/support', icon: LifeBuoy },
    ]
  },
  {
    title: 'Account',
    items: [
      { name: 'Profile Details', href: '/dashboard/profile', icon: User },
      { name: 'Security Settings', href: '/dashboard/settings', icon: Settings },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'SUPER_ADMIN']}>
      <InAppNotificationListener />
      <div className="min-h-screen bg-gray-50/50 flex">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 h-screen sticky top-0">
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
              <span className="text-xl font-bold tracking-tight text-gray-900">Forex<span className="text-blue-600">mate</span></span>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
            {sidebarGroups.map((group, idx) => (
              <div key={idx}>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                  {group.title}
                </h4>
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-blue-50 text-blue-700" 
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        )}
                      >
                        <item.icon className={cn("w-5 h-5", isActive ? "text-blue-700" : "text-gray-400")} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={logout} 
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          
          {/* Top Navigation */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
            <div className="flex items-center flex-1 gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden -ml-2"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="hidden sm:flex max-w-md w-full relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input 
                  placeholder="Search orders, cards, invoices..." 
                  className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-blue-500 h-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-gray-500"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </Button>
                
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 ? (
                          <button 
                            onClick={async () => {
                              try {
                                await authFetch(`${API_URL}/notifications/read-all`, { method: 'POST' });
                                markAllAsRead();
                              } catch (_) {}
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Mark all read
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-gray-405">All read</span>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs font-medium">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div 
                              key={n.id}
                              onClick={async () => {
                                setIsNotificationsOpen(false);
                                if (!n.read) {
                                  try {
                                    await authFetch(`${API_URL}/notifications/${n.id}/read`, { method: 'POST' });
                                    markAsRead(n.id);
                                  } catch (_) {}
                                }
                                if (n.actionUrl) {
                                  router.push(n.actionUrl);
                                }
                              }}
                              className={cn(
                                "p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 text-left",
                                !n.read ? "bg-blue-50/30" : "opacity-80"
                              )}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                !n.read ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"
                              )}>
                                <Bell className={cn("w-4 h-4", !n.read ? "text-blue-600" : "text-gray-400")} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-xs leading-relaxed text-gray-800", !n.read ? "font-bold text-gray-900" : "font-medium")}>
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-gray-400 block mt-1">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
                        <Link href="/dashboard/notifications" className="text-xs font-semibold text-blue-600 hover:text-blue-800" onClick={() => setIsNotificationsOpen(false)}>
                          View All Notifications
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-semibold text-gray-900 leading-none">{user?.fullName || 'User'}</div>
                  <div className="text-xs text-gray-500 mt-1">{user?.role === 'SUPER_ADMIN' ? 'Administrator' : 'Retail Customer'}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </main>

        {/* Mobile Sidebar Overlay (Simple Implementation) */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
            <aside className="fixed inset-y-0 left-0 w-72 bg-white flex flex-col shadow-xl">
               <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                  <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    Forexmate
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
               </div>
               <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
                 {/* Re-use groups here or abstract to a shared component */}
                 <div className="text-sm text-gray-500">Mobile Navigation... (Select from Desktop list)</div>
               </div>
            </aside>
          </div>
        )}
        
      </div>
    </ProtectedRoute>
  );
}
