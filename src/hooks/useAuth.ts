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
      // Since we've made the API more robust, this should rarely happen
      const errorMessage = error.message || 'Failed to send magic link';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPasswordlessToken = async (token: string): Promise<void> => {
    console.log('useAuth: verifyPasswordlessToken called with token:', token);
    setLoading(true);
    clearError();
    
    try {
      console.log('useAuth: Calling authApi.passwordlessLogin');
      const data = await authApi.passwordlessLogin(token);
      console.log('useAuth: API response data:', data);
      setUser(data.user);
      console.log('useAuth: User set successfully');
    } catch (error: any) {
      console.error('useAuth: Error in verifyPasswordlessToken:', error);
      
      // Try fallback with direct fetch if axios fails
      if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
        console.log('useAuth: Axios failed, trying direct fetch...');
        try {
          const response = await fetch('http://127.0.0.1:8000/auth/passwordless-login/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('useAuth: Fetch response data:', data);
          
          if (data.access_token && data.refresh_token && data.user) {
            // Store tokens manually
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            console.log('useAuth: User set successfully via fetch');
            return;
          }
        } catch (fetchError: any) {
          console.error('useAuth: Fetch fallback also failed:', fetchError);
        }
      }
      
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
