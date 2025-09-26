import CookieManager from './cookies';

/**
 * Utility to synchronize authentication state between cookies and Redux
 */
export class AuthSync {
  /**
   * Force refresh authentication state from cookies
   * This can be called after login to ensure Redux state is in sync
   */
  static async forceRefreshAuthState(): Promise<void> {
    const authData = CookieManager.getAuthData();
    
    console.log('AuthSync: Force refreshing auth state from cookies:', {
      hasAccessToken: !!authData.accessToken,
      hasRefreshToken: !!authData.refreshToken,
      hasUser: !!authData.user,
      isAuthenticated: authData.isAuthenticated
    });
    
    // Dispatch a custom event to notify Redux store to refresh
    window.dispatchEvent(new CustomEvent('auth:force-refresh', {
      detail: authData
    }));
  }
  
  /**
   * Check if authentication state is consistent between cookies and Redux
   */
  static isAuthStateConsistent(reduxAuthState: {
    isAuthenticated: boolean;
    user: any;
    tokens: { access_token: string | null; refresh_token: string | null };
  }): boolean {
    const cookieAuthData = CookieManager.getAuthData();
    
    const isConsistent = 
      reduxAuthState.isAuthenticated === cookieAuthData.isAuthenticated &&
      reduxAuthState.tokens.access_token === cookieAuthData.accessToken &&
      reduxAuthState.tokens.refresh_token === cookieAuthData.refreshToken &&
      JSON.stringify(reduxAuthState.user) === JSON.stringify(cookieAuthData.user);
    
    if (!isConsistent) {
      console.warn('AuthSync: Authentication state inconsistency detected:', {
        redux: {
          isAuthenticated: reduxAuthState.isAuthenticated,
          hasAccessToken: !!reduxAuthState.tokens.access_token,
          hasRefreshToken: !!reduxAuthState.tokens.refresh_token,
          hasUser: !!reduxAuthState.user
        },
        cookies: {
          isAuthenticated: cookieAuthData.isAuthenticated,
          hasAccessToken: !!cookieAuthData.accessToken,
          hasRefreshToken: !!cookieAuthData.refreshToken,
          hasUser: !!cookieAuthData.user
        }
      });
    }
    
    return isConsistent;
  }
  
  /**
   * Get authentication status from cookies (fallback method)
   */
  static getAuthStatusFromCookies(): {
    isAuthenticated: boolean;
    user: any;
    tokens: { access_token: string | null; refresh_token: string | null };
  } {
    const authData = CookieManager.getAuthData();
    
    return {
      isAuthenticated: authData.isAuthenticated,
      user: authData.user,
      tokens: {
        access_token: authData.accessToken,
        refresh_token: authData.refreshToken
      }
    };
  }
}

export default AuthSync;
