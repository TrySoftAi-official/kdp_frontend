// src/api/authApi.ts
import axios from 'axios';

const API_BASE = (import.meta as any).env?.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false, // Set to false to avoid CORS issues
  timeout: 10000, // 10 second timeout
});

// Simple token storage wrapper (localStorage). For better security use httpOnly cookies.
const TokenStorage = {
  getAccess: () => localStorage.getItem('accessToken'),
  setAccess: (t?: string | null) => (t ? localStorage.setItem('accessToken', t) : localStorage.removeItem('accessToken')),
  getRefresh: () => localStorage.getItem('refreshToken'),
  setRefresh: (t?: string | null) => (t ? localStorage.setItem('refreshToken', t) : localStorage.removeItem('refreshToken')),
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  setUser: (u: any) => localStorage.setItem('user', JSON.stringify(u)),
  getUser: () => {
    const v = localStorage.getItem('user');
    return v ? JSON.parse(v) : null;
  },
};

// Attach access token automatically
api.interceptors.request.use((config) => {
  const token = TokenStorage.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: try refresh on 401
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const processQueue = (error: any, token: string | null = null) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // wait for refresh
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(err);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = TokenStorage.getRefresh();
        if (!refreshToken) throw new Error('No refresh token');

        const resp = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken }, { headers: { 'Content-Type': 'application/json' } });
        const { accessToken, refreshToken: newRefresh } = resp.data;
        TokenStorage.setAccess(accessToken);
        TokenStorage.setRefresh(newRefresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        TokenStorage.clear();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  passwordlessLoginRequest: async (email: string) => {
    try {
      const response = await api.post('/auth/passwordless-login/request', { email });
      console.log('Passwordless login request successful:', response);
      return response;
    } catch (error: any) {
      console.error('Passwordless login request failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // If it's a 200 response but still caught as error, it might be a parsing issue
      if (error.response?.status === 200) {
        console.log('Backend returned 200, treating as success');
        return { data: { success: true, message: 'Magic link sent successfully' } };
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.detail || 
        'Failed to send magic link. Please try again.'
      );
    }
  },

  passwordlessLogin: async (token: string) => {
    try {
      const response = await api.post('/auth/passwordless-login/login', { token });
      const { accessToken, refreshToken, user } = response.data;
      
      if (accessToken && refreshToken && user) {
        TokenStorage.setAccess(accessToken);
        TokenStorage.setRefresh(refreshToken);
        TokenStorage.setUser(user);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Passwordless login verification failed:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.detail || 
        'Magic link is invalid or expired. Please request a new one.'
      );
    }
  },

  googleCallback: async (code: string, state?: string) => {
    try {
      const response = await api.post('/auth/google/callback', { code, state });
      const { accessToken, refreshToken, user } = response.data;
      
      if (accessToken && refreshToken && user) {
        TokenStorage.setAccess(accessToken);
        TokenStorage.setRefresh(refreshToken);
        TokenStorage.setUser(user);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Google OAuth callback failed:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.detail || 
        'Google authentication failed. Please try again.'
      );
    }
  },

  logout: async () => {
    try {
      const refreshToken = TokenStorage.getRefresh();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (logoutError) {
      console.error('Logout API call failed:', logoutError);
      // Continue with logout even if API call fails
    } finally {
      TokenStorage.clear();
    }
  },

  getCurrentUser: () => TokenStorage.getUser(),
  
  setTokensDirectly: (access: string, refresh: string, user: any) => {
    TokenStorage.setAccess(access);
    TokenStorage.setRefresh(refresh);
    TokenStorage.setUser(user);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = TokenStorage.getAccess();
    const user = TokenStorage.getUser();
    return !!(token && user);
  },

  // Clear all authentication data
  clearAuth: () => {
    TokenStorage.clear();
  }
};

export default api;
