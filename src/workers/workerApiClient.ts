import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";

// Base URLs
const ADDITIONAL_SERVICE_BASE_URL = "http://127.0.0.1:8081";

// Create axios instance for web worker (no localStorage access)
const workerApiClient = axios.create({
  baseURL: ADDITIONAL_SERVICE_BASE_URL,
  timeout: 120000, // Increased timeout to 2 minutes for long-running operations
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json", 
  },
});

// Request interceptor for worker client (no localStorage)
workerApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Note: We can't access localStorage in web worker
    // Authentication tokens should be passed from main thread if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for worker client
workerApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Simple error handling without localStorage access
    return Promise.reject(error);
  }
);

// Helper function to get error message from API response
export const getWorkerErrorMessage = (error: AxiosError): string => {
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

export default workerApiClient;
