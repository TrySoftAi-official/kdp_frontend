/**
 * Authentication Helper Utilities
 * Provides functions to check and manage authentication state
 */

import CookieManager from './cookies';

export interface AuthStatus {
  isAuthenticated: boolean;
  hasValidToken: boolean;
  tokenExpiry: Date | null;
  userEmail: string | null;
}

/**
 * Check if user is properly authenticated
 */
export const checkAuthStatus = (): AuthStatus => {
  const token = CookieManager.getAccessToken();
  const userData = CookieManager.getUserData();
  
  if (!token) {
    return {
      isAuthenticated: false,
      hasValidToken: false,
      tokenExpiry: null,
      userEmail: null
    };
  }

  try {
    // Decode JWT token to check expiry
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = new Date(payload.exp * 1000);
    const now = new Date();
    
    return {
      isAuthenticated: true,
      hasValidToken: expiry > now,
      tokenExpiry: expiry,
      userEmail: userData?.email || payload.email || null
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return {
      isAuthenticated: false,
      hasValidToken: false,
      tokenExpiry: null,
      userEmail: null
    };
  }
};

/**
 * Get authentication status for debugging
 */
export const getAuthDebugInfo = () => {
  const authStatus = checkAuthStatus();
  const token = CookieManager.getAccessToken();
  const userData = CookieManager.getUserData();
  
  return {
    ...authStatus,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
    tokenLength: token?.length || 0,
    userData: userData ? {
      email: userData.email,
      username: userData.username,
      role: userData.role
    } : null
  };
};

/**
 * Require authentication - throws error if not authenticated
 */
export const requireAuth = (): void => {
  const authStatus = checkAuthStatus();
  console.log('🔍 [requireAuth] Auth status check:', authStatus);
  
  if (!authStatus.isAuthenticated) {
    console.error('❌ [requireAuth] User not authenticated');
    throw new Error('User must be logged in to perform this action');
  }
  
  if (!authStatus.hasValidToken) {
    console.error('❌ [requireAuth] Token expired or invalid');
    throw new Error('Authentication token has expired. Please log in again.');
  }
  
  // Double-check that we actually have a token in cookies
  const token = CookieManager.getAccessToken();
  if (!token) {
    console.error('❌ [requireAuth] No token found in cookies despite auth status being true');
    throw new Error('Authentication required');
  }
  
  console.log('✅ [requireAuth] Authentication check passed');
};

/**
 * Check if user needs to log in
 */
export const needsLogin = (): boolean => {
  const authStatus = checkAuthStatus();
  return !authStatus.isAuthenticated || !authStatus.hasValidToken;
};
