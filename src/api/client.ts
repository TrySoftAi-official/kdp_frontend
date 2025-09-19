import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";

// Base URL for backend - can be overridden by environment variables
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";

// Create axios instance with enhanced configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  withCredentials: false, // Changed to false to avoid CORS issues
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json", 
  },
});

// Request interceptor for authentication and request tracking
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authentication token
    const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken");
    if (token) {
      // Validate token format before sending
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Sending request with valid token:', token.substring(0, 50) + '...');
      } else {
        console.warn('Invalid token format detected, clearing tokens. Token parts:', tokenParts.length, 'Token:', token.substring(0, 50) + '...');
        localStorage.removeItem("access_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("refreshToken");
      }
    } else {
      console.log('No token found for request to:', config.url);
    }

    // Add request ID for tracking
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    config.headers["X-Request-ID"] = requestId;

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    }


    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token") || localStorage.getItem("refreshToken");
        if (refreshToken) {
          console.log("Attempting token refresh...");
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("accessToken", access_token); // Keep both for compatibility
          console.log("Token refresh successful");
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } else {
          console.log("No refresh token available");
          handleAuthError();
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.error("Token refresh failed:", refreshError);
        handleAuthError();
        return Promise.reject(refreshError);
      }
    }

    // Handle other HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          handleAuthError();
          break;
        case 403:
          // Handle forbidden access
          if (typeof window !== 'undefined') {
            // You can dispatch a toast notification here
            console.warn("Access forbidden");
          }
          break;
        case 404:
          // Handle not found
          console.warn("Resource not found");
          break;
        case 429:
          // Handle rate limiting
          console.warn("Rate limit exceeded");
          break;
        case 500:
          // Handle server errors
          if (typeof window !== 'undefined') {
            // You can dispatch a toast notification here
            console.error("Server error occurred");
          }
          break;
        default:
          console.error(`HTTP Error ${status}:`, data);
      }
    } else if (error.request) {
      // Network error
      console.error("Network error:", error.message);
      if (typeof window !== 'undefined') {
        // You can dispatch a toast notification here
        console.error("Network connection failed");
      }
    } else {
      // Other error
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function to handle authentication errors
const handleAuthError = () => {
  // Clear stored tokens
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // Don't automatically redirect - let the app handle the authentication state
  // The auth store will handle setting isAuthenticated to false
  console.log('Authentication error - tokens cleared');
};

// Helper function to get error message from API response
export const getErrorMessage = (error: AxiosError): string => {
  if (error.response?.data) {
    const data = error.response.data as any;
    
    // Handle different error response formats
    if (typeof data === 'string') {
      return data;
    }
    
    if (data.detail) {
      return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    }
    
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    }
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Helper function to check if error is network related
export const isNetworkError = (error: AxiosError): boolean => {
  return !error.response && error.request;
};

// Helper function to check if error is timeout
export const isTimeoutError = (error: AxiosError): boolean => {
  return error.code === 'ECONNABORTED' || error.message.includes('timeout');
};

export default apiClient;
