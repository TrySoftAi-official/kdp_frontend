import apiClient from "./client";

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface TwoFactorSetup {
  secret: string;
  code: string;
}

export interface TwoFactorVerify {
  code: string;
}

export interface PasswordReset {
  email: string;
}

export interface NewPassword {
  token: string;
  newPassword: string;
}

export const authApi = {
  // Google Authentication
  googleLogin: () => apiClient.get("/auth/google/login"),
  googleLoginApi: (data: any) => apiClient.post("/auth/google/login", data),
  googleCallback: () => apiClient.get("/auth/google/callback"),

  // Standard Authentication
  register: (data: RegisterData) => apiClient.post("/auth/register", data),
  login: (credentials: LoginCredentials) => apiClient.post("/auth/login", credentials),
  refresh: () => apiClient.post("/auth/refresh"),
  logout: () => apiClient.post("/auth/logout"),

  // Password Management
  forgotPassword: (data: PasswordReset) => apiClient.post("/auth/forgot-password", data),
  passwordlessLoginRequest: (email: string) => 
    apiClient.post("/auth/passwordless-login/request", { email }),
  passwordlessLogin: (token: string) => 
    apiClient.post("/auth/passwordless-login/login", { token }),
  resetPassword: (data: NewPassword) => apiClient.post("/auth/reset-password", data),

  // Two-Factor Authentication
  setup2FA: (data: TwoFactorSetup) => apiClient.post("/auth/2fa/setup", data),
  verify2FA: (data: TwoFactorVerify) => apiClient.post("/auth/2fa/verify", data),
  login2FA: (data: TwoFactorVerify) => apiClient.post("/auth/2fa/login", data),
  disable2FA: (data: TwoFactorVerify) => apiClient.post("/auth/2fa/disable", data),

  // Security
  getAccountSecurityStatus: () => apiClient.get("/auth/security/account-status"),
  getAuditLog: () => apiClient.get("/auth/security/audit-log"),
};
