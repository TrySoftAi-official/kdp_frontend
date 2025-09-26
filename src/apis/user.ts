import apiClient, { getErrorMessage, requireAuth } from './apiClient';

// Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  organization_id?: number;
  organization_name?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserUpdate {
  full_name?: string;
  organization_name?: string;
}

export interface PasswordUpdate {
  current_password: string;
  new_password: string;
}

export interface UserPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
}

export interface UserActivity {
  id: number;
  user_id: number;
  action: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface NotificationRequest {
  type: 'email' | 'sms' | 'push';
  message: string;
  title?: string;
}

export interface MaintenanceStatus {
  is_maintenance_mode: boolean;
  message?: string;
  estimated_duration?: string;
}

// API Functions
export async function getUserProfile(): Promise<User> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('👤 [getUserProfile] Fetching user profile');
    const { data } = await apiClient.get('/api/user/profile');
    console.log('✅ [getUserProfile] Profile fetched successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getUserProfile] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function updateUserProfile(request: UserUpdate): Promise<User> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('✏️ [updateUserProfile] Updating user profile');
    const { data } = await apiClient.put('/api/user/profile', request);
    console.log('✅ [updateUserProfile] Profile updated successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [updateUserProfile] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function changePassword(request: PasswordUpdate): Promise<{ message: string }> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('🔐 [changePassword] Changing password');
    const { data } = await apiClient.post('/api/user/update/password', request);
    console.log('✅ [changePassword] Password changed successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [changePassword] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteUserAccount(): Promise<{ message: string }> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('🗑️ [deleteUserAccount] Deleting user account');
    const { data } = await apiClient.delete('/api/user/delete-account');
    console.log('✅ [deleteUserAccount] Account deleted successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [deleteUserAccount] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('⚙️ [getUserPreferences] Fetching user preferences');
    const { data } = await apiClient.get('/api/user/preferences');
    console.log('✅ [getUserPreferences] Preferences fetched successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getUserPreferences] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function updateUserPreferences(request: Partial<UserPreferences>): Promise<UserPreferences> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('⚙️ [updateUserPreferences] Updating user preferences');
    const { data } = await apiClient.put('/api/user/preferences', request);
    console.log('✅ [updateUserPreferences] Preferences updated successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [updateUserPreferences] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getUserActivity(page: number = 1, limit: number = 10): Promise<{ activities: UserActivity[]; total: number; page: number; limit: number }> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('📋 [getUserActivity] Fetching user activity');
    const { data } = await apiClient.get(`/user/activity?page=${page}&limit=${limit}`);
    console.log('✅ [getUserActivity] Activity fetched successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getUserActivity] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function sendNotification(request: NotificationRequest): Promise<{ message: string }> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('📧 [sendNotification] Sending notification');
    const { data } = await apiClient.post('/api/user/send', request);
    console.log('✅ [sendNotification] Notification sent successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [sendNotification] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  try {
    requireAuth();
    console.log('🔧 [getMaintenanceStatus] Fetching maintenance status');
    const { data } = await apiClient.get('/api/user/maintenance/status');
    console.log('✅ [getMaintenanceStatus] Maintenance status fetched successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getMaintenanceStatus] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}
