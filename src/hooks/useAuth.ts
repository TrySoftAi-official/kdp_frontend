import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import { ROLES } from '@/lib/constants';
import { authApi } from '@/api/authApi';

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
    setLoading(true);
    clearError();
    
    try {
      const response = await authApi.passwordlessLoginRequest(email);
      console.log('Passwordless link request successful:', response);
      // Don't throw error if the request was successful
    } catch (error: any) {
      console.error('Passwordless link request failed:', error);
      const errorMessage = error.message || 'Failed to send magic link';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPasswordlessToken = async (token: string): Promise<void> => {
    setLoading(true);
    clearError();
    
    try {
      const data = await authApi.passwordlessLogin(token);
      setUser(data.user);
    } catch (error: any) {
      const errorMessage = error.message || 'Magic link verification failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCallback = async (code: string, state?: string): Promise<void> => {
    setLoading(true);
    clearError();
    
    try {
      const data = await authApi.googleCallback(code, state);
      setUser(data.user);
    } catch (error: any) {
      const errorMessage = error.message || 'Google authentication failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
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
