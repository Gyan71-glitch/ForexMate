"use client";

import React, { useState, useEffect } from 'react';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { 
  Bell, CheckCheck, Trash2, Eye, ShieldAlert, 
  Clock, ArrowRight, ShieldCheck, MailOpen 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`${API_URL}/notifications`);
      const data = await apiJson(res);
      setNotifications(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (n: Notification) => {
    if (n.read) {
      if (n.actionUrl) router.push(n.actionUrl);
      return;
    }

    try {
      await authFetch(`${API_URL}/notifications/${n.id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
      toast.success('Notification marked as read');
      if (n.actionUrl) {
        router.push(n.actionUrl);
      }
    } catch (_) {
      toast.error('Could not update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await authFetch(`${API_URL}/notifications/read-all`, { method: 'POST' });
      setNotifications(prev => prev.map(item => ({ ...item, read: true })));
      toast.success('All notifications marked as read');
    } catch (_) {
      toast.error('Failed to mark all as read');
    }
  };

  const filtered = notifications.filter(n => filter === 'ALL' || !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (title: string) => {
    const text = title.toLowerCase();
    if (text.includes('kyc') || text.includes('identity')) return <ShieldCheck className="w-5 h-5 text-green-600" />;
    if (text.includes('aml') || text.includes('risk') || text.includes('exceeded') || text.includes('failed')) return <ShieldAlert className="w-5 h-5 text-red-600" />;
    return <Bell className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500 mt-1">Review system updates, verification stages, and order compliance alerts.</p>
        </div>
        {unreadCount > 0 && (
          <Button 
            onClick={handleMarkAllAsRead} 
            variant="outline"
            className="border-gray-200 hover:bg-gray-50 text-gray-700 font-bold h-11 px-5 rounded-xl shadow-sm transition-all duration-200"
          >
            <CheckCheck className="w-5 h-5 mr-2 text-gray-500" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl w-fit">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
          All Inbox ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'UNREAD' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white border border-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
          <CardContent className="p-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <MailOpen className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-900 font-bold text-lg mb-1">Your inbox is empty</p>
            <p className="text-gray-500 text-sm">All caught up! You have no new compliance or system alerts.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => handleMarkAsRead(n)}
              className={`group border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex items-start gap-4 ${!n.read ? 'bg-white border-l-4 border-l-blue-600' : 'bg-white/60 opacity-80 hover:opacity-100'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${!n.read ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                {getIcon(n.title)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className={`text-base font-bold text-gray-900 truncate ${!n.read ? 'text-gray-900' : 'text-gray-700 font-semibold'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1 mt-1">
                    <Clock className="w-3.5 h-3.5 text-gray-300" />
                    {formatDistanceToNow(new Date(n.createdAt))} ago
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                {n.actionUrl && (
                  <span className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 mt-3 group-hover:translate-x-0.5 transition-transform">
                    View Details
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
