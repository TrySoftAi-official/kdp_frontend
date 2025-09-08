import apiClient from './client';
import { AxiosResponse } from 'axios';

// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'assistant' | 'marketer' | 'guest';
  status: boolean;
  created_at: string;
  updated_at?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  subscription?: UserSubscription;
}

export interface UserSubscription {
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled';
  expires_at?: string;
  features: string[];
}

export interface PasswordUpdate {
  password: string;
  new_password: string;
}

export interface UserUpdate {
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

export interface NotificationRequest {
  message: string;
}

export interface NotificationResponse {
  status: string;
}

export interface MaintenanceStatus {
  maintenance_mode: boolean;
  message?: string;
  estimated_duration?: string;
}

export interface UserStats {
  total_books: number;
  published_books: number;
  total_revenue: number;
  total_ad_spend: number;
  average_roas: number;
  last_login?: string;
  account_age_days: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  analytics_sharing: boolean;
}

export interface UserActivity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

// User Service Class
export class UserService {
  // User Profile
  static async getCurrentUser(): Promise<AxiosResponse<User>> {
    return apiClient.get('/user/me');
  }

  static async updateProfile(data: UserUpdate): Promise<AxiosResponse<User>> {
    return apiClient.put('/user/profile', data);
  }

  static async updatePassword(data: PasswordUpdate): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post('/user/update/password', data);
  }

  static async deleteAccount(): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.delete('/user/account');
  }

  // User Stats
  static async getUserStats(): Promise<AxiosResponse<UserStats>> {
    return apiClient.get('/user/stats');
  }

  // User Preferences
  static async getUserPreferences(): Promise<AxiosResponse<UserPreferences>> {
    return apiClient.get('/user/preferences');
  }

  static async updateUserPreferences(data: Partial<UserPreferences>): Promise<AxiosResponse<UserPreferences>> {
    return apiClient.put('/user/preferences', data);
  }

  // User Activity
  static async getUserActivity(limit: number = 50, offset: number = 0): Promise<AxiosResponse<UserActivity[]>> {
    return apiClient.get(`/user/activity?limit=${limit}&offset=${offset}`);
  }

  // Notifications
  static async sendNotification(data: NotificationRequest): Promise<AxiosResponse<NotificationResponse>> {
    return apiClient.post('/user/send', data);
  }

  // System Status
  static async getMaintenanceStatus(): Promise<AxiosResponse<MaintenanceStatus>> {
    return apiClient.get('/user/maintenance/status');
  }

  // Avatar Management
  static async uploadAvatar(file: File): Promise<AxiosResponse<{ avatar_url: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiClient.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  static async deleteAvatar(): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.delete('/user/avatar');
  }

  // Subscription Management
  static async getSubscription(): Promise<AxiosResponse<UserSubscription>> {
    return apiClient.get('/user/subscription');
  }

  static async updateSubscription(plan: string): Promise<AxiosResponse<UserSubscription>> {
    return apiClient.put('/user/subscription', { plan });
  }

  static async cancelSubscription(): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post('/user/subscription/cancel');
  }

  static async reactivateSubscription(): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post('/user/subscription/reactivate');
  }

  // Helper methods
  static getRoleLabel(role: string): string {
    const roleLabels: Record<string, string> = {
      admin: 'Administrator',
      assistant: 'Assistant',
      marketer: 'Marketer',
      guest: 'Guest',
    };
    return roleLabels[role] || role;
  }

  static getRoleColor(role: string): string {
    const roleColors: Record<string, string> = {
      admin: 'text-red-600 bg-red-100',
      assistant: 'text-blue-600 bg-blue-100',
      marketer: 'text-green-600 bg-green-100',
      guest: 'text-gray-600 bg-gray-100',
    };
    return roleColors[role] || 'text-gray-600 bg-gray-100';
  }

  static getStatusLabel(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }

  static getStatusColor(status: boolean): string {
    return status ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  }

  static getSubscriptionLabel(plan: string): string {
    const planLabels: Record<string, string> = {
      free: 'Free',
      basic: 'Basic',
      pro: 'Pro',
      enterprise: 'Enterprise',
    };
    return planLabels[plan] || plan;
  }

  static getSubscriptionColor(plan: string): string {
    const planColors: Record<string, string> = {
      free: 'text-gray-600 bg-gray-100',
      basic: 'text-blue-600 bg-blue-100',
      pro: 'text-purple-600 bg-purple-100',
      enterprise: 'text-gold-600 bg-gold-100',
    };
    return planColors[plan] || 'text-gray-600 bg-gray-100';
  }

  static getSubscriptionStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      active: 'Active',
      expired: 'Expired',
      cancelled: 'Cancelled',
    };
    return statusLabels[status] || status;
  }

  static getSubscriptionStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      active: 'text-green-600 bg-green-100',
      expired: 'text-yellow-600 bg-yellow-100',
      cancelled: 'text-red-600 bg-red-100',
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  static formatNumber(number: number): string {
    return new Intl.NumberFormat('en-US').format(number);
  }

  static formatPercentage(value: number, decimals: number = 2): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  static calculateAccountAge(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static isSubscriptionActive(subscription?: UserSubscription): boolean {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    if (subscription.expires_at) {
      return new Date(subscription.expires_at) > new Date();
    }
    return true;
  }

  static canAccessFeature(user: User, feature: string): boolean {
    // Basic role-based access
    const rolePermissions: Record<string, string[]> = {
      admin: ['all'],
      assistant: ['books', 'analytics', 'basic_features'],
      marketer: ['books', 'analytics', 'campaigns'],
      guest: ['basic_features'],
    };

    const userPermissions = rolePermissions[user.role] || [];
    
    // Check if user has 'all' permissions or specific feature
    if (userPermissions.includes('all') || userPermissions.includes(feature)) {
      return true;
    }

    // Check subscription-based features
    if (user.subscription && this.isSubscriptionActive(user.subscription)) {
      return user.subscription.features.includes(feature);
    }

    return false;
  }

  static getDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      email_notifications: true,
      push_notifications: true,
      marketing_emails: false,
      analytics_sharing: false,
    };
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateUsername(username: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username.length > 20) {
      errors.push('Username must be no more than 20 characters long');
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export individual functions for convenience
export const {
  getCurrentUser,
  updateProfile,
  updatePassword,
  deleteAccount,
  getUserStats,
  getUserPreferences,
  updateUserPreferences,
  getUserActivity,
  sendNotification,
  getMaintenanceStatus,
  uploadAvatar,
  deleteAvatar,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  getRoleLabel,
  getRoleColor,
  getStatusLabel,
  getStatusColor,
  getSubscriptionLabel,
  getSubscriptionColor,
  getSubscriptionStatusLabel,
  getSubscriptionStatusColor,
  formatDate,
  formatCurrency,
  formatNumber,
  formatPercentage,
  calculateAccountAge,
  isSubscriptionActive,
  canAccessFeature,
  getDefaultPreferences,
  validatePassword,
  validateEmail,
  validateUsername,
} = UserService;

export default UserService;
