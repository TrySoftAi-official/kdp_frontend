import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import CookieManager from "../utils/cookies";

// Base URLs
const API_BASE_URL = "http://localhost:8000/";
// const ADDITIONAL_SERVICE_BASE_URL = "http://127.0.0.1:8080";
const ADDITIONAL_SERVICE_BASE_URL = "http://127.0.0.1:8081";



// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json", 
  },
});

// Create additional service axios instance
const additionalServiceClient = axios.create({
  baseURL: ADDITIONAL_SERVICE_BASE_URL,
  timeout: 50000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json", 
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authentication token from universal cookies
    const token = CookieManager.getAccessToken();
    console.log('🔍 [API Client] Request interceptor - Token available:', !!token);
    console.log('🔍 [API Client] Request interceptor - Token preview:', token ? `${token.substring(0, 50)}...` : 'No token');
    console.log('🔍 [API Client] Request interceptor - URL:', config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔍 [API Client] Request interceptor - Authorization header set');
    } else {
      console.log('⚠️ [API Client] Request interceptor - No token available, request will be unauthenticated');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = CookieManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          CookieManager.updateAccessToken(access_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } else {
          handleAuthError();
        }
      } catch (refreshError) {
        handleAuthError();
        return Promise.reject(refreshError);
      }
    }

    // Handle 401 errors
    if (error.response?.status === 401) {
      handleAuthError();
    }

    return Promise.reject(error);
  }
);

// Request interceptor for additional service client
additionalServiceClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authentication token from universal cookies
    const token = CookieManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for additional service client
additionalServiceClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = CookieManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${ADDITIONAL_SERVICE_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          CookieManager.updateAccessToken(access_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return additionalServiceClient(originalRequest);
        } else {
          handleAuthError();
        }
      } catch (refreshError) {
        handleAuthError();
        return Promise.reject(refreshError);
      }
    }

    // Handle 401 errors
    if (error.response?.status === 401) {
      handleAuthError();
    }

    return Promise.reject(error);
  }
);

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return CookieManager.isAuthenticated();
};

// Helper function to require authentication
export const requireAuth = (): void => {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }
};

// Helper function to handle authentication errors
const handleAuthError = () => {
  CookieManager.clearAuthData();
  
  // Dispatch logout action if Redux store is available
  // This will be handled by the auth slice
  window.dispatchEvent(new CustomEvent('auth:logout'));
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

// API wrapper with error handling
export const apiRequest = async <T>(
  request: () => Promise<AxiosResponse<T>>
): Promise<T> => {
  try {
    const response = await request();
    return response.data;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export default apiClient;
export { additionalServiceClient };
