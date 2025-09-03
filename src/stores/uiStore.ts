import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Notification[];
  toggleTheme: () => void;
  toggleSidebar: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: string;
  read?: boolean;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarCollapsed: true, // Start collapsed on mobile
      notifications: [
        {
          id: '1',
          title: 'Book Published',
          message: 'Your book "Digital Marketing Guide" has been successfully published',
          type: 'success',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: '2',
          title: 'Campaign Alert',
          message: 'Ad spend for "Romance Series" campaign is above budget',
          type: 'warning',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: '3',
          title: 'New Order',
          message: 'Received new order for "Cooking Basics"',
          type: 'info',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          read: true
        }
      ],

      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        }));
      },

      toggleSidebar: () => {
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed
        }));
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          read: false
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50) // Keep only last 50
        }));
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      }
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
);
