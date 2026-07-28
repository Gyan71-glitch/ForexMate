"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Users,
  Package,
  ArrowLeftRight,
  TrendingUp,
  FileSpreadsheet,
  BarChart3,
  ShieldAlert,
  Settings,
  LogOut,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem('forexmate_token');
    sessionStorage.removeItem('forexmate_user');
    localStorage.removeItem('forexmate_token');
    localStorage.removeItem('forexmate_user');
    // Clear cookies if present
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  };

  const navSections = [
    {
      title: 'Executive ERP',
      links: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'City Management', href: '/admin/cities', icon: MapPin },
        { name: 'Branch Network', href: '/admin/branches', icon: Building2 },
        { name: 'Employee Master', href: '/admin/employees', icon: Users },
      ],
    },
    {
      title: 'Vault & Treasury',
      links: [
        { name: 'Enterprise Inventory', href: '/admin/inventory', icon: Package },
        { name: 'Vault Transfers', href: '/admin/vault-transfers', icon: ArrowLeftRight },
        { name: 'Rates & Currency Master', href: '/admin/rates', icon: TrendingUp },
      ],
    },
    {
      title: 'Governance & Control',
      links: [
        { name: 'Order Monitor', href: '/admin/orders', icon: FileSpreadsheet },
        { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
        { name: 'Audit Center', href: '/admin/audit', icon: ShieldAlert },
        { name: 'System Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen shadow-xl flex-shrink-0 flex flex-col justify-between border-r border-slate-800">
      <div>
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <div>
              <h1 className="text-base font-black tracking-wider text-indigo-400">
                FOREXMATE ERP
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Headquarters Admin
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-4 px-3 space-y-5">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    link.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
        >
          <LogOut size={15} />
          <span>Logout Session</span>
        </button>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
          Forexmate Enterprise ERP v2.4
        </p>
      </div>
    </aside>
  );
}
