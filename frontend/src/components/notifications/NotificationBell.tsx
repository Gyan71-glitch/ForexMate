"use client";

import React, { useState } from 'react';
import { useNotificationStore, InAppNotification } from '@/stores/notificationStore';
import API_URL, { authFetch } from '@/lib/api';
import { Bell, CheckCircle, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = async (n: InAppNotification) => {
    setIsOpen(false);
    if (!n.read) {
      try {
        await authFetch(`${API_URL}/notifications/${n.id}/read`, { method: 'POST' });
        markAsRead(n.id);
      } catch (err) {
        console.error('Failed to mark notification read:', err);
      }
    }
    if (n.actionUrl) {
      router.push(n.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await authFetch(`${API_URL}/notifications/read-all`, { method: 'POST' });
      markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-slate-800 hover:bg-slate-700 text-white hover:text-indigo-400 rounded-xl transition-all shadow-sm border border-slate-700 flex items-center justify-center focus:outline-none"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-150 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 bg-slate-50 border-b border-gray-150 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-indigo-600 hover:text-indigo-850 font-bold transition-all flex items-center gap-1"
                >
                  <CheckCircle size={13} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-all flex items-start gap-3 relative ${
                      !n.read ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    {!n.read && (
                      <span className="absolute top-4 right-4 w-2 h-2 bg-indigo-600 rounded-full" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-normal ${!n.read ? 'font-bold text-gray-950' : 'text-gray-600'}`}>
                        {n.message}
                      </p>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {n.actionUrl && (
                      <ExternalLink size={12} className="text-gray-300 self-center shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
