import axios from "axios";

// Base URL for backend
const API_BASE_URL = "http://127.0.0.1:8000";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Changed to false to avoid CORS issues
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add interceptors for auth tokens
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle refresh token here if needed
      console.error("Unauthorized - maybe refresh token?");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
