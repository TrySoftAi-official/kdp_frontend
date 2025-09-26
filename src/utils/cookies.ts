import Cookies from 'universal-cookie';

const cookies = new Cookies();

// Cookie configuration
const COOKIE_CONFIG = {
  path: '/',
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  sameSite: 'lax' as const,
  httpOnly: false, // Allow client-side access
};

// Token cookie names
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'forgekdp_access_token',
  REFRESH_TOKEN: 'forgekdp_refresh_token',
  USER_DATA: 'forgekdp_user_data',
  AUTH_STATE: 'forgekdp_auth_state',
} as const;

// Token expiration times (in days)
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 1, // 1 day
  REFRESH_TOKEN: 7, // 7 days
  USER_DATA: 7, // 7 days
  AUTH_STATE: 1, // 1 day
} as const;

export class CookieManager {
  // Set access token
  static setAccessToken(token: string): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + TOKEN_EXPIRY.ACCESS_TOKEN);
    
    cookies.set(COOKIE_NAMES.ACCESS_TOKEN, token, {
      ...COOKIE_CONFIG,
      expires: expiryDate,
    });
  }

  // Get access token
  static getAccessToken(): string | null {
    return cookies.get(COOKIE_NAMES.ACCESS_TOKEN) || null;
  }

  // Set refresh token
  static setRefreshToken(token: string): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + TOKEN_EXPIRY.REFRESH_TOKEN);
    
    cookies.set(COOKIE_NAMES.REFRESH_TOKEN, token, {
      ...COOKIE_CONFIG,
      expires: expiryDate,
    });
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    return cookies.get(COOKIE_NAMES.REFRESH_TOKEN) || null;
  }

  // Set user data
  static setUserData(userData: any): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + TOKEN_EXPIRY.USER_DATA);
    
    cookies.set(COOKIE_NAMES.USER_DATA, JSON.stringify(userData), {
      ...COOKIE_CONFIG,
      expires: expiryDate,
    });
  }

  // Get user data
  static getUserData(): any | null {
    const userData = cookies.get(COOKIE_NAMES.USER_DATA);
    if (userData) {
      try {
        return typeof userData === 'string' ? JSON.parse(userData) : userData;
      } catch (error) {
        console.error('Error parsing user data from cookie:', error);
        return null;
      }
    }
    return null;
  }

  // Set authentication state
  static setAuthState(isAuthenticated: boolean): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + TOKEN_EXPIRY.AUTH_STATE);
    
    cookies.set(COOKIE_NAMES.AUTH_STATE, isAuthenticated.toString(), {
      ...COOKIE_CONFIG,
      expires: expiryDate,
    });
  }

  // Get authentication state
  static getAuthState(): boolean {
    const authState = cookies.get(COOKIE_NAMES.AUTH_STATE);
    return authState === 'true';
  }

  // Set all auth data at once
  static setAuthData(data: {
    accessToken: string;
    refreshToken: string;
    user: any;
  }): void {
    this.setAccessToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);
    this.setUserData(data.user);
    this.setAuthState(true);
  }

  // Get all auth data
  static getAuthData(): {
    accessToken: string | null;
    refreshToken: string | null;
    user: any | null;
    isAuthenticated: boolean;
  } {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
      user: this.getUserData(),
      isAuthenticated: this.isAuthenticated(),
    };
  }

  // Clear all auth cookies
  static clearAuthData(): void {
    cookies.remove(COOKIE_NAMES.ACCESS_TOKEN, { path: '/' });
    cookies.remove(COOKIE_NAMES.REFRESH_TOKEN, { path: '/' });
    cookies.remove(COOKIE_NAMES.USER_DATA, { path: '/' });
    cookies.remove(COOKIE_NAMES.AUTH_STATE, { path: '/' });
  }

  // Check if user is authenticated based on cookies
  static isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const user = this.getUserData();
    
    // If we have tokens and user data, consider authenticated
    // Don't rely solely on authState as it might not be set properly
    return !!(accessToken && refreshToken && user);
  }

  // Update access token (for token refresh)
  static updateAccessToken(newToken: string): void {
    this.setAccessToken(newToken);
  }

  // Check if tokens are expired (basic check)
  static areTokensExpired(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return true;

    try {
      // Basic JWT expiration check (without full JWT parsing)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}

export default CookieManager;
