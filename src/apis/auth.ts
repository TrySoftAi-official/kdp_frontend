import apiClient, { getErrorMessage } from './apiClient';

// Types
export interface LoginRequest { 
  email: string; 
  password: string; 
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  organization_name?: string;
}

export interface AuthTokens { 
  access_token: string; 
  refresh_token: string; 
}

export interface UserResponse { 
  id: number; 
  email: string; 
  full_name?: string; 
  role?: string; 
  organization_id?: number;
  organization_name?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse extends AuthTokens {
  token_type?: string;
  user: UserResponse;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  token: string;
  new_password: string;
}

export interface GoogleOAuthRequest {
  token: string;
}

export interface TwoFactorSetup {
  secret: string;
  qr_code: string;
}

export interface TwoFactorVerify {
  code: string;
}

export interface TwoFactorLogin {
  email: string;
  password: string;
  two_factor_code: string;
}

export interface PasswordlessLoginRequest {
  email: string;
}

export interface PasswordlessLoginData {
  token: string;
}

export interface SecurityStatus {
  two_factor_enabled: boolean;
  last_login: string;
  login_attempts: number;
}

export interface AuditLogEntry {
  id: number;
  user_id: number;
  action: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// API Functions
export async function login(request: LoginRequest): Promise<AuthResponse> {
  try {
    console.log('🔐 [login] Attempting user login');
    const { data } = await apiClient.post('/api/auth/login', request);
    console.log('✅ [login] Login successful');
    return data;
  } catch (error: any) {
    console.error('❌ [login] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  try {
    console.log('📝 [register] Attempting user registration');
    const { data } = await apiClient.post('/api/auth/register', request);
    console.log('✅ [register] Registration successful');
    return data;
  } catch (error: any) {
    console.error('❌ [register] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function refreshToken(request: RefreshTokenRequest): Promise<{ access_token: string }> {
  try {
    console.log('🔄 [refreshToken] Refreshing access token');
    const { data } = await apiClient.post('/api/auth/refresh', request);
    console.log('✅ [refreshToken] Token refreshed successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [refreshToken] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function logout(): Promise<{ message: string }> {
  try {
    console.log('🚪 [logout] Attempting user logout');
    const { data } = await apiClient.post('/api/auth/logout');
    console.log('✅ [logout] Logout successful');
    return data;
  } catch (error: any) {
    console.error('❌ [logout] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getCurrentUser(): Promise<UserResponse> {
  try {
    console.log('👤 [getCurrentUser] Fetching current user');
    const { data } = await apiClient.get('/api/user/me');
    console.log('✅ [getCurrentUser] User data fetched successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getCurrentUser] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function forgotPassword(request: PasswordResetRequest): Promise<{ message: string }> {
  try {
    console.log('🔑 [forgotPassword] Requesting password reset');
    const { data } = await apiClient.post('/api/auth/forgot-password', request);
    console.log('✅ [forgotPassword] Password reset email sent');
    return data;
  } catch (error: any) {
    console.error('❌ [forgotPassword] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function resetPassword(request: PasswordResetData): Promise<{ message: string }> {
  try {
    console.log('🔐 [resetPassword] Resetting password');
    const { data } = await apiClient.post('/api/auth/reset-password', request);
    console.log('✅ [resetPassword] Password reset successful');
    return data;
  } catch (error: any) {
    console.error('❌ [resetPassword] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  try {
    console.log('📧 [verifyEmail] Verifying email');
    const { data } = await apiClient.post('/api/auth/verify-email', { token });
    console.log('✅ [verifyEmail] Email verified successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [verifyEmail] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getGoogleAuthUrl(): Promise<{ auth_url: string; state: string }> {
  try {
    console.log('🔗 [getGoogleAuthUrl] Getting Google OAuth URL');
    const { data } = await apiClient.get('/api/auth/google/login');
    console.log('✅ [getGoogleAuthUrl] Google OAuth URL retrieved:', data);
    return data;
  } catch (error: any) {
    console.error('❌ [getGoogleAuthUrl] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function googleOAuth(request: GoogleOAuthRequest): Promise<AuthResponse> {
  try {
    console.log('🔗 [googleOAuth] Attempting Google OAuth');
    const { data } = await apiClient.post('/api/auth/google/login', request);
    console.log('✅ [googleOAuth] Google OAuth successful');
    return data;
  } catch (error: any) {
    console.error('❌ [googleOAuth] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function googleCallback(request: GoogleOAuthRequest): Promise<AuthResponse> {
  try {
    console.log('🔗 [googleCallback] Processing Google OAuth callback');
    const { data } = await apiClient.post('/api/auth/google/callback', request);
    console.log('✅ [googleCallback] Google OAuth callback successful');
    return data;
  } catch (error: any) {
    console.error('❌ [googleCallback] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function setupTwoFactor(): Promise<TwoFactorSetup> {
  try {
    console.log('🔐 [setupTwoFactor] Setting up 2FA');
    const { data } = await apiClient.post('/api/auth/2fa/setup');
    console.log('✅ [setupTwoFactor] 2FA setup successful');
    return data;
  } catch (error: any) {
    console.error('❌ [setupTwoFactor] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function verifyTwoFactor(request: TwoFactorVerify): Promise<{ message: string }> {
  try {
    console.log('🔐 [verifyTwoFactor] Verifying 2FA code');
    const { data } = await apiClient.post('/api/auth/2fa/verify', request);
    console.log('✅ [verifyTwoFactor] 2FA verification successful');
    return data;
  } catch (error: any) {
    console.error('❌ [verifyTwoFactor] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function disableTwoFactor(request: TwoFactorVerify): Promise<{ message: string }> {
  try {
    console.log('🔐 [disableTwoFactor] Disabling 2FA');
    const { data } = await apiClient.post('/api/auth/2fa/disable', request);
    console.log('✅ [disableTwoFactor] 2FA disabled successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [disableTwoFactor] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function twoFactorLogin(request: TwoFactorLogin): Promise<AuthResponse> {
  try {
    console.log('🔐 [twoFactorLogin] Attempting 2FA login');
    const { data } = await apiClient.post('/api/auth/2fa/login', request);
    console.log('✅ [twoFactorLogin] 2FA login successful');
    return data;
  } catch (error: any) {
    console.error('❌ [twoFactorLogin] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function passwordlessLogin(request: PasswordlessLoginRequest): Promise<{ message: string }> {
  try {
    console.log('🔗 [passwordlessLogin] Requesting passwordless login');
    const { data } = await apiClient.post('/api/auth/passwordless-login/request', request);
    console.log('✅ [passwordlessLogin] Passwordless login email sent');
    return data;
  } catch (error: any) {
    console.error('❌ [passwordlessLogin] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function passwordlessVerify(request: PasswordlessLoginData): Promise<AuthResponse> {
  try {
    console.log('🔗 [passwordlessVerify] Verifying passwordless login');
    const { data } = await apiClient.post('/api/auth/passwordless-login/login', request);
    console.log('✅ [passwordlessVerify] Passwordless login successful');
    return data;
  } catch (error: any) {
    console.error('❌ [passwordlessVerify] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getSecurityStatus(): Promise<SecurityStatus> {
  try {
    console.log('🛡️ [getSecurityStatus] Fetching security status');
    const { data } = await apiClient.get('/api/auth/security/account-status');
    console.log('✅ [getSecurityStatus] Security status fetched successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getSecurityStatus] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getAuditLogs(page: number = 1, limit: number = 10): Promise<{ logs: AuditLogEntry[]; total: number; page: number; limit: number }> {
  try {
    console.log('📋 [getAuditLogs] Fetching audit logs');
    const { data } = await apiClient.get(`/api/auth/security/audit-log?page=${page}&limit=${limit}`);
    console.log('✅ [getAuditLogs] Audit logs fetched successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getAuditLogs] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

// Alias functions for better naming consistency
export const requestMagicLink = passwordlessLogin;
export const loginWithGoogle = getGoogleAuthUrl;


