import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  skills: string[];
  interests: string[];
}

export interface GlobalState {
  // 사용자 정보
  user: User | null;
  setUser: (user: User | null) => void;

  // 테마
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // 알림
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // 사이드바 상태
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // 모바일 메뉴 상태
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      // 사용자 정보
      user: null,
      setUser: (user) => set({ user }),

      // 테마
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // 알림
      notifications: [],
      addNotification: (notification) => {
        const id = crypto.randomUUID();
        const newNotification: Notification = {
          ...notification,
          id,
          duration: notification.duration ?? 5000,
        };
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // 자동 제거
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),

      // 사이드바 상태
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // 모바일 메뉴 상태
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    {
      name: 'dom-vlog-global-store',
      partialize: (state) => ({
        theme: state.theme,
        user: state.user,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
