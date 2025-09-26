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
  googleLogin: () => apiClient.get("/api/auth/google/login"),
  googleLoginApi: (data: any) => apiClient.post("/api/auth/google/login", data),
  googleCallback: () => apiClient.get("/api/auth/google/callback"),

  // Standard Authentication
  register: (data: RegisterData) => apiClient.post("/api/auth/register", data),
  login: (credentials: LoginCredentials) => apiClient.post("/api/auth/login", credentials),
  refresh: () => apiClient.post("/api/auth/refresh"),
  logout: () => apiClient.post("/api/auth/logout"),

  // Password Management
  forgotPassword: (data: PasswordReset) => apiClient.post("/api/auth/forgot-password", data),
  passwordlessLoginRequest: (email: string) => 
    apiClient.post("/api/auth/passwordless-login/request", { email }),
  passwordlessLogin: (token: string) => 
    apiClient.post("/api/auth/passwordless-login/login", { token }),
  resetPassword: (data: NewPassword) => apiClient.post("/auth/reset-password", data),

  // Two-Factor Authentication
  setup2FA: (data: TwoFactorSetup) => apiClient.post("/api/auth/2fa/setup", data),
  verify2FA: (data: TwoFactorVerify) => apiClient.post("/api/auth/2fa/verify", data),
  login2FA: (data: TwoFactorVerify) => apiClient.post("/api/auth/2fa/login", data),
  disable2FA: (data: TwoFactorVerify) => apiClient.post("/api/auth/2fa/disable", data),

  // Security
  getAccountSecurityStatus: () => apiClient.get("/api/auth/security/account-status"),
  getAuditLog: () => apiClient.get("/api/auth/security/audit-log"),

  // Organization Management
  getOrganizationInfo: () => apiClient.get("/api/auth/organization/info"),
  getOrganizationUsers: () => apiClient.get("/apiauth/organization/users"),
  createSubUser: (data: any) => apiClient.post("/api/auth/organization/users", data),
  updateUserRole: (userId: number, data: any) => apiClient.put(`/api/auth/organization/users/${userId}/role`, data),
  removeSubUser: (userId: number) => apiClient.delete(`/api/auth/organization/users/${userId}`),
  activateSubUser: (userId: number) => apiClient.post(`/api/auth/organization/users/${userId}/activate`),
};
