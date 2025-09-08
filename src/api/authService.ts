import apiClient from './client';
import { AxiosResponse } from 'axios';

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'assistant' | 'marketer' | 'guest';
  status: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
}

export interface GoogleOAuthRequest {
  code: string;
  state?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  token: string;
  password: string;
}

export interface TwoFactorSetup {
  secret: string;
  provisioning_uri: string;
}

export interface TwoFactorVerify {
  code: string;
}

export interface TwoFactorLogin {
  temp_token: string;
  code: string;
}

export interface PasswordlessLoginRequest {
  email: string;
}

export interface PasswordlessLoginData {
  token: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token?: string;
  all_devices?: boolean;
}

export interface SecurityStatus {
  locked: boolean;
  locked_until?: string;
  failed_attempts: number;
  remaining_attempts: number;
  '2fa_enabled': boolean;
}

export interface AuditLogEntry {
  id: string;
  user_id?: string;
  email?: string;
  event_type: string;
  success: boolean;
  ip_address?: string;
  user_agent?: string;
  details?: any;
  created_at: string;
}

// Auth Service Class
export class AuthService {
  // Google Authentication
  static async getGoogleAuthUrl(): Promise<AxiosResponse<{ auth_url: string; state: string }>> {
    return apiClient.get('/auth/google/login');
  }

  static async googleLogin(data: GoogleOAuthRequest): Promise<AxiosResponse<AuthResponse>> {
    return apiClient.post('/auth/google/login', data);
  }

  static async googleCallback(code: string, state?: string): Promise<AxiosResponse<AuthResponse>> {
    return apiClient.get(`/auth/google/callback?code=${code}${state ? `&state=${state}` : ''}`);
  }

  // Standard Authentication
  static async register(data: RegisterData): Promise<AxiosResponse<AuthResponse>> {
    return apiClient.post('/auth/register', data);
  }

  static async login(credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse | { requires_2fa: boolean; temp_token: string }>> {
    return apiClient.post('/auth/login', credentials);
  }

  static async refresh(data: RefreshTokenRequest): Promise<AxiosResponse<{ access_token: string; token_type: string; expires_in: number }>> {
    return apiClient.post('/auth/refresh', data);
  }

  static async logout(data: LogoutRequest = {}): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post('/auth/logout', data);
  }

  // Password Management
  static async forgotPassword(data: PasswordResetRequest): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post('/auth/forgot-password', data);
  }

  static async resetPassword(data: PasswordResetData): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post('/auth/reset-password', data);
  }

  // Passwordless Login
  static async requestPasswordlessLogin(data: PasswordlessLoginRequest): Promise<AxiosResponse<{ message: string; user_created?: boolean; username?: string }>> {
    return apiClient.post('/auth/passwordless-login/request', data);
  }

  static async passwordlessLogin(data: PasswordlessLoginData): Promise<AxiosResponse<AuthResponse>> {
    return apiClient.post('/auth/passwordless-login/login', data);
  }

  // Two-Factor Authentication
  static async setup2FA(): Promise<AxiosResponse<TwoFactorSetup>> {
    return apiClient.post('/auth/2fa/setup');
  }

  static async verify2FA(data: TwoFactorVerify): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post('/auth/2fa/verify', data);
  }

  static async login2FA(data: TwoFactorLogin): Promise<AxiosResponse<AuthResponse>> {
    return apiClient.post('/auth/2fa/login', data);
  }

  static async disable2FA(data: TwoFactorVerify): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post('/auth/2fa/disable', data);
  }

  // Security
  static async getAccountSecurityStatus(): Promise<AxiosResponse<SecurityStatus>> {
    return apiClient.get('/auth/security/account-status');
  }

  static async getAuditLog(limit: number = 100, offset: number = 0): Promise<AxiosResponse<AuditLogEntry[]>> {
    return apiClient.get(`/auth/security/audit-log?limit=${limit}&offset=${offset}`);
  }

  // Helper methods
  static async getCurrentUser(): Promise<AxiosResponse<UserResponse>> {
    return apiClient.get('/user/me');
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    return !!token;
  }

  static getStoredTokens(): { accessToken?: string; refreshToken?: string } {
    return {
      accessToken: localStorage.getItem('access_token') || localStorage.getItem('accessToken') || undefined,
      refreshToken: localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken') || undefined,
    };
  }

  static storeTokens(tokens: { access_token: string; refresh_token: string }): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  static clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  static storeUser(user: UserResponse): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  static getStoredUser(): UserResponse | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
      }
    }
    return null;
  }
}

// Export individual functions for convenience
export const {
  getGoogleAuthUrl,
  googleLogin,
  googleCallback,
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  requestPasswordlessLogin,
  passwordlessLogin,
  setup2FA,
  verify2FA,
  login2FA,
  disable2FA,
  getAccountSecurityStatus,
  getAuditLog,
  getCurrentUser,
  isAuthenticated,
  getStoredTokens,
  storeTokens,
  clearTokens,
  storeUser,
  getStoredUser,
} = AuthService;

export default AuthService;
