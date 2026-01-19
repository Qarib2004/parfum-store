import { create } from 'zustand';
import { AppNotification} from '@/types';

interface AppNotificationState {
  AppNotifications: AppNotification[];
  unreadCount: number;
  setAppNotifications: (AppNotifications: AppNotification[]) => void;
  addAppNotification: (AppNotification: AppNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeAppNotification: (id: string) => void;
  setUnreadCount: (count: number) => void;
}

export const useAppNotificationStore = create<AppNotificationState>((set) => ({
  AppNotifications: [],
  unreadCount: 0,

  setAppNotifications: (AppNotifications) =>
    set({ AppNotifications }),

  addAppNotification: (AppNotification) =>
    set((state) => ({
      AppNotifications: [AppNotification, ...state.AppNotifications],
      unreadCount: state.unreadCount + 1,
    })),

  markAsRead: (id) =>
    set((state) => ({
      AppNotifications: state.AppNotifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      AppNotifications: state.AppNotifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  removeAppNotification: (id) =>
    set((state) => {
      const AppNotification = state.AppNotifications.find((n) => n.id === id);
      return {
        AppNotifications: state.AppNotifications.filter((n) => n.id !== id),
        unreadCount: AppNotification && !AppNotification.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    }),

  setUnreadCount: (count) =>
    set({ unreadCount: count }),
}));