import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import { ROLES } from '@/lib/constants';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    setUser,
    setLoading
  } = useAuthStore();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return ROLES[user.role].permissions.includes(permission);
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const canAccess = (requiredRole: UserRole | UserRole[]): boolean => {
    return hasRole(requiredRole);
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const canWrite = (): boolean => {
    return hasPermission('write');
  };

  const canDelete = (): boolean => {
    return hasPermission('delete');
  };

  const canManageUsers = (): boolean => {
    return hasPermission('manage_users');
  };

  const canViewAnalytics = (): boolean => {
    return hasPermission('view_analytics');
  };

  const canManageCampaigns = (): boolean => {
    return hasPermission('manage_campaigns');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    setUser,
    setLoading,
    hasPermission,
    hasRole,
    canAccess,
    isAdmin,
    canWrite,
    canDelete,
    canManageUsers,
    canViewAnalytics,
    canManageCampaigns
  };
};
