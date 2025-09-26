import apiClient from "./client";

// Types for admin authentication
export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface TwoFactorSetup {
  secret: string;
  code: string;
}

export interface TwoFactorVerify {
  code: string;
}

export const adminApi = {
  // Admin Authentication
  login: (credentials: AdminLoginCredentials) => apiClient.post("/admin/login", credentials),
  me: () => apiClient.get("/admin/me"),

  // Passwordless Login
  passwordlessLoginRequest: (email: string) => 
    apiClient.post("/admin/passwordless-login/request", { email }),
  passwordlessLogin: (token: string) => 
    apiClient.post("/admin/passwordless-login/login", { token }),

  // Two-Factor Authentication
  setup2FA: (data: TwoFactorSetup) => apiClient.post("/admin/2fa/setup", data),
  verify2FA: (data: TwoFactorVerify) => apiClient.post("/admin/2fa/verify", data),
  login2FA: (data: TwoFactorVerify) => apiClient.post("/admin/2fa/login", data),
  disable2FA: (data: TwoFactorVerify) => apiClient.post("/admin/2fa/disable", data),
};
