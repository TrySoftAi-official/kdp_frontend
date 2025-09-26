import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: string;
  read?: boolean;
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Notification[];
}

const initialState: UIState = {
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
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false
      };
      state.notifications = [newNotification, ...state.notifications].slice(0, 50); // Keep only last 50
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  setSidebarCollapsed,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;