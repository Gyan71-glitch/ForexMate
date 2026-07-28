import { create } from 'zustand';

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  orderId: string | null;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: InAppNotification[];
  unreadCount: number;
  setNotifications: (notifications: InAppNotification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter(n => !n.read).length
  }),
  markAsRead: (id) => set((state) => {
    const updated = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    return {
      notifications: updated,
      unreadCount: updated.filter(n => !n.read).length
    };
  }),
  markAllAsRead: () => set((state) => {
    const updated = state.notifications.map(n => ({ ...n, read: true }));
    return {
      notifications: updated,
      unreadCount: 0
    };
  })
}));
