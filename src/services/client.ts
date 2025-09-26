import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";

// Base URLs
const API_BASE_URL = "http://localhost:8000/";
const ADDITIONAL_SERVICE_BASE_URL = "http://127.0.0.1:8081";
// const ADDITIONAL_SERVICE_BASE_URL = "http://127.0.0.1:8080";

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
    // Add authentication token
    const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
        const refreshToken = localStorage.getItem("refresh_token") || localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("accessToken", access_token);
          
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
    // Add authentication token
    const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken");
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
        const refreshToken = localStorage.getItem("refresh_token") || localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${ADDITIONAL_SERVICE_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("accessToken", access_token);
          
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

// Helper function to handle authentication errors
const handleAuthError = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
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
export { additionalServiceClient };
