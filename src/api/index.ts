// Export all API modules
export { default as apiClient, getErrorMessage, isNetworkError, isTimeoutError } from './client';

// Legacy API exports (for backward compatibility)
export { authApi } from './auth';
export { adminApi } from './admin';
export { userApi } from './user';
export { paymentApi } from './payment';
export { mediaApi } from './media';

// New service exports
export { default as AuthService } from './authService';
export { default as PaymentService } from './paymentService';
export { default as UserService } from './userService';
export { default as BookService } from './bookService';

// Export types from legacy APIs
export type {
  LoginCredentials,
  RegisterData,
  TwoFactorSetup,
  TwoFactorVerify,
  PasswordReset,
  NewPassword,
} from './auth';

export type {
  AdminLoginCredentials,
} from './admin';

// Export types from new services
export type {
  LoginCredentials as AuthLoginCredentials,
  RegisterData as AuthRegisterData,
  UserResponse as AuthUserResponse,
  AuthResponse,
  GoogleOAuthRequest,
  PasswordResetRequest,
  PasswordResetData,
  TwoFactorSetup as AuthTwoFactorSetup,
  TwoFactorVerify as AuthTwoFactorVerify,
  TwoFactorLogin,
  PasswordlessLoginRequest,
  PasswordlessLoginData,
  RefreshTokenRequest,
  LogoutRequest,
  SecurityStatus,
  AuditLogEntry,
} from './authService';

export type {
  PaymentLineItem,
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
  CreatePaymentIntentRequest,
  PaymentIntentResponse,
  PaymentStatusResponse,
  TaxCalculationRequest,
  TaxCalculationResponse,
  PaymentRefundRequest,
  PaymentRefundResponse,
  WebhookRetryResponse,
} from './paymentService';

export type {
  User,
  UserSubscription,
  UserUpdate,
  PasswordUpdate,
  UserStats,
  UserPreferences,
  UserActivity,
  NotificationRequest,
  MaintenanceStatus,
} from './userService';

export type {
  Book,
  BookPrompt,
  BookGenerationRequest,
  BookGenerationResponse,
  GenerationStep,
  BookSuggestion,
  Genre,
  Niche,
  BookAnalytics,
  BookUpdate,
  BookFilter,
  BookSort,
  PaginatedBooksResponse,
} from './bookService';
