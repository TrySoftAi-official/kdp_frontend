import { useAppDispatch, useAppSelector } from '../hooks';
import {
  toggleTheme,
  toggleSidebar,
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  setSidebarCollapsed,
  setTheme,
  Notification
} from '../slices/uiSlice';

export const useUI = () => {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector((state) => state.ui);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleAddNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    dispatch(addNotification(notification));
  };

  const handleRemoveNotification = (id: string) => {
    dispatch(removeNotification(id));
  };

  const handleClearNotifications = () => {
    dispatch(clearNotifications());
  };

  const handleMarkNotificationAsRead = (id: string) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleSetSidebarCollapsed = (collapsed: boolean) => {
    dispatch(setSidebarCollapsed(collapsed));
  };

  const handleSetTheme = (theme: 'light' | 'dark') => {
    dispatch(setTheme(theme));
  };

  return {
    // State
    theme: uiState.theme,
    sidebarCollapsed: uiState.sidebarCollapsed,
    notifications: uiState.notifications,
    
    // Actions
    toggleTheme: handleToggleTheme,
    toggleSidebar: handleToggleSidebar,
    addNotification: handleAddNotification,
    removeNotification: handleRemoveNotification,
    clearNotifications: handleClearNotifications,
    markNotificationAsRead: handleMarkNotificationAsRead,
    setSidebarCollapsed: handleSetSidebarCollapsed,
    setTheme: handleSetTheme,
  };
};