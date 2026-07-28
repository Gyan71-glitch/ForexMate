"use client";

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import API_URL, { authFetch, apiJson } from '@/lib/api';
import { useNotificationStore, InAppNotification } from '@/stores/notificationStore';
import { toast } from 'sonner';
import { Bell, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function InAppNotificationListener() {
  const { user } = useAuth();
  const router = useRouter();
  const { notifications, setNotifications, markAsRead } = useNotificationStore();
  
  // Track known notification IDs to prevent duplicate toasts
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);
  const consecutiveErrorsRef = useRef(0);

  useEffect(() => {
    if (!user) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const pollNotifications = async () => {
      // Back off for 30 s if we hit 3+ consecutive errors to avoid flooding logs
      if (consecutiveErrorsRef.current >= 3) {
        return;
      }
      try {
        const res = await authFetch(`${API_URL}/notifications`);
        if (!res.ok) {
          consecutiveErrorsRef.current += 1;
          return;
        }
        consecutiveErrorsRef.current = 0; // reset on success
        const data = await apiJson(res);
        
        const fetchedList: InAppNotification[] = Array.isArray(data) ? data : [];
        
        // Find new unread notifications not seen before
        const newUnread = fetchedList.filter(
          (n) => !n.read && !knownIdsRef.current.has(n.id)
        );

        // Update known IDs
        fetchedList.forEach((n) => knownIdsRef.current.add(n.id));

        // Update store
        setNotifications(fetchedList);

        // Show toasts only after the very first load
        if (!initialLoadRef.current && newUnread.length > 0) {
          newUnread.forEach((notification) => {
            triggerCustomToast(notification);
          });
        }

        if (initialLoadRef.current) {
          initialLoadRef.current = false;
        }
      } catch (_err) {
        // Silently absorb network errors; no console spam
        consecutiveErrorsRef.current += 1;
        if (consecutiveErrorsRef.current === 3) {
          // Reset after 30 s so it auto-recovers
          setTimeout(() => { consecutiveErrorsRef.current = 0; }, 30000);
        }
      }
    };

    pollNotifications();
    // Poll every 15 s — aggressive enough to feel live, gentle on the backend
    intervalId = setInterval(pollNotifications, 15000);

    return () => { if (intervalId) clearInterval(intervalId); };
  }, [user, setNotifications]);

  const triggerCustomToast = (n: InAppNotification) => {
    const isManagerPortal = window.location.pathname.startsWith('/manager') || user?.role === 'BRANCH_MANAGER';
    const duration = isManagerPortal ? 10000 : 5000;

    const handleActionClick = async () => {
      try {
        await authFetch(`${API_URL}/notifications/${n.id}/read`, { method: 'POST' });
        markAsRead(n.id);
      } catch (err) {
        console.error('Failed to mark notification read:', err);
      }
      toast.dismiss(n.id);
      if (n.actionUrl) {
        router.push(n.actionUrl);
      }
    };

    toast.custom(
      (t) => (
        <div
          onClick={handleActionClick}
          className="flex w-full max-w-md bg-white border border-gray-150 shadow-2xl rounded-2xl p-4 cursor-pointer hover:bg-slate-50 transition-all select-none animate-in fade-in slide-in-from-top duration-300"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Bell size={20} className="animate-bounce" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 leading-none mb-1">{n.title}</p>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
          </div>
          <div className="flex-shrink-0 flex items-center ml-4 pl-3 border-l border-slate-100">
            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
              View <ArrowRight size={12} />
            </span>
          </div>
        </div>
      ),
      { id: n.id, duration }
    );
  };

  return null; // Invisible polling listener
}
