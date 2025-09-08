import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import { ROLES } from '@/lib/constants';
import { useAuthApi } from './useAuthApi';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithGoogle,
    logout,
    setUser,
    setLoading,
    setError,
    clearError,
    initializeAuth
  } = useAuthStore();

  // Use the new API hook
  const authApi = useAuthApi();

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

  const sendPasswordlessLink = async (email: string): Promise<void> => {
    const success = await authApi.requestPasswordlessLogin({ email });
    if (!success) {
      throw new Error('Failed to send magic link');
    }
  };

  const verifyPasswordlessToken = async (token: string): Promise<void> => {
    const authData = await authApi.passwordlessLogin({ token });
    if (!authData) {
      throw new Error('Magic link verification failed');
    }
  };

  const handleGoogleCallback = async (code: string, state?: string): Promise<void> => {
    const authData = await authApi.googleLogin({ code, state });
    if (!authData) {
      throw new Error('Google authentication failed');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithGoogle,
    logout,
    setUser,
    setLoading,
    setError,
    clearError,
    initializeAuth,
    sendPasswordlessLink,
    verifyPasswordlessToken,
    handleGoogleCallback,
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
