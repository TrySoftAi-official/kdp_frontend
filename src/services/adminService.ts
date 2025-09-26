import apiClient from './client';
import { AxiosResponse } from 'axios';

// Admin Types
export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  organization_name?: string;
  subscription_status: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

export interface AdminStats {
  total_users: number;
  active_subscriptions: number;
  total_revenue: number;
  books_created: number;
  api_calls_today: number;
  system_uptime: number;
}

export interface AdminAnalytics {
  user_growth: Array<{
    date: string;
    new_users: number;
    total_users: number;
  }>;
  revenue_analytics: Array<{
    date: string;
    revenue: number;
    subscriptions: number;
  }>;
  book_analytics: Array<{
    date: string;
    books_created: number;
    books_published: number;
  }>;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  database: {
    status: string;
    response_time: number;
    connections: number;
  };
  redis: {
    status: string;
    memory_usage: number;
    connected_clients: number;
  };
  stripe: {
    status: string;
    last_webhook: string;
    failed_webhooks: number;
  };
  aws: {
    status: string;
    s3_usage: number;
    lambda_invocations: number;
  };
}

// Admin Service Class
export class AdminService {
  static async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<AxiosResponse<{ users: AdminUser[]; total: number; page: number; limit: number }>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    return apiClient.get(`/admin/users?${params.toString()}`);
  }

  static async getUser(userId: number): Promise<AxiosResponse<AdminUser>> {
    return apiClient.get(`/admin/users/${userId}`);
  }

  static async updateUser(userId: number, data: Partial<AdminUser>): Promise<AxiosResponse<AdminUser>> {
    return apiClient.put(`/admin/users/${userId}`, data);
  }

  static async deactivateUser(userId: number): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post(`/admin/users/${userId}/deactivate`);
  }

  static async activateUser(userId: number): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post(`/admin/users/${userId}/activate`);
  }

  static async deleteUser(userId: number): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.delete(`/admin/users/${userId}`);
  }

  static async getStats(): Promise<AxiosResponse<AdminStats>> {
    return apiClient.get('/admin/stats');
  }

  static async getAnalytics(period: string = '30d'): Promise<AxiosResponse<AdminAnalytics>> {
    return apiClient.get(`/admin/analytics?period=${period}`);
  }

  static async getSystemHealth(): Promise<AxiosResponse<SystemHealth>> {
    return apiClient.get('/admin/system/health');
  }

  static async getErrorLogs(page: number = 1, limit: number = 50): Promise<AxiosResponse<{ logs: any[]; total: number; page: number; limit: number }>> {
    return apiClient.get(`/admin/system/error-logs?page=${page}&limit=${limit}`);
  }

  static async getWebhookLogs(page: number = 1, limit: number = 50): Promise<AxiosResponse<{ logs: any[]; total: number; page: number; limit: number }>> {
    return apiClient.get(`/admin/system/webhook-logs?page=${page}&limit=${limit}`);
  }

  static async retryFailedWebhooks(): Promise<AxiosResponse<{ message: string; retried_count: number }>> {
    return apiClient.post('/admin/system/retry-webhooks');
  }

  static async getDatabaseStats(): Promise<AxiosResponse<{ stats: Record<string, any> }>> {
    return apiClient.get('/admin/database/stats');
  }

  static async optimizeDatabase(): Promise<AxiosResponse<{ message: string; optimized_tables: string[] }>> {
    return apiClient.post('/admin/database/optimize');
  }

  static async backupDatabase(): Promise<AxiosResponse<{ backup_id: string; status: string }>> {
    return apiClient.post('/admin/database/backup');
  }

  static async getBackups(): Promise<AxiosResponse<{ backups: Array<{ id: string; created_at: string; size: number; status: string }> }>> {
    return apiClient.get('/admin/database/backups');
  }

  static async restoreDatabase(backupId: string): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post(`/admin/database/restore/${backupId}`);
  }

  static async getSubscriptionStats(): Promise<AxiosResponse<{ stats: Record<string, any> }>> {
    return apiClient.get('/admin/subscriptions/stats');
  }

  static async getPaymentStats(): Promise<AxiosResponse<{ stats: Record<string, any> }>> {
    return apiClient.get('/admin/payments/stats');
  }

  static async getBookStats(): Promise<AxiosResponse<{ stats: Record<string, any> }>> {
    return apiClient.get('/admin/books/stats');
  }

  static async getApiUsageStats(): Promise<AxiosResponse<{ stats: Record<string, any> }>> {
    return apiClient.get('/admin/api/usage-stats');
  }

  static async getPerformanceMetrics(): Promise<AxiosResponse<{ metrics: Record<string, any> }>> {
    return apiClient.get('/admin/system/performance');
  }

  static async clearCache(): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post('/admin/system/clear-cache');
  }

  static async restartServices(): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post('/admin/system/restart-services');
  }

  static async getMaintenanceMode(): Promise<AxiosResponse<{ enabled: boolean; message?: string }>> {
    return apiClient.get('/admin/system/maintenance-mode');
  }

  static async setMaintenanceMode(enabled: boolean, message?: string): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post('/admin/system/maintenance-mode', { enabled, message });
  }
}

export default AdminService;
