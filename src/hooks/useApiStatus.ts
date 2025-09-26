import { useState, useEffect, useCallback } from 'react';
import { getEnvironmentStatus, getBooks } from '@/services/additionalService';

export interface EnvStatusResponse {
  [key: string]: any;
}

export interface UseApiStatusReturn {
  // Connection State
  backendConnectionStatus: 'checking' | 'connected' | 'disconnected';
  envStatus: EnvStatusResponse | null;
  
  // API Books State
  apiBooks: any[];
  isLoadingApiBooks: boolean;
  apiBooksError: string | null;
  
  // Actions
  testBackendConnection: () => Promise<void>;
  fetchEnvStatus: (forceRefresh?: boolean) => Promise<void>;
  fetchApiBooks: () => Promise<void>;
  
  // Utilities
  setBackendConnectionStatus: (status: 'checking' | 'connected' | 'disconnected') => void;
  setApiBooksError: (error: string | null) => void;
}

export const useApiStatus = (): UseApiStatusReturn => {
  // Connection state
  const [backendConnectionStatus, setBackendConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [envStatus, setEnvStatus] = useState<EnvStatusResponse | null>(null);
  
  // API books state
  const [apiBooks, setApiBooks] = useState<any[]>([]);
  const [isLoadingApiBooks, setIsLoadingApiBooks] = useState(false);
  const [apiBooksError, setApiBooksError] = useState<string | null>(null);

  // Test backend connection
  const testBackendConnection = useCallback(async () => {
    setBackendConnectionStatus('checking');
    
    const endpoints = ['/env-status', '/books', '/health'];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing backend connection at ${endpoint}...`);
        const response = await fetch(`http://127.0.0.1:8081${endpoint}`, {
          method: 'GET',
          timeout: 5000
        } as any);
        
        if (response.ok) {
          setBackendConnectionStatus('connected');
          console.log(`✅ Backend connection successful at ${endpoint}`);
          return;
        } else {
          console.log(`❌ Backend responded with error at ${endpoint}:`, response.status);
        }
      } catch (error) {
        console.log(`❌ Failed to connect to ${endpoint}:`, error);
        continue;
      }
    }
    
    setBackendConnectionStatus('disconnected');
    console.error('❌ All backend connection attempts failed');
  }, []);

  // Fetch environment status
  const fetchEnvStatus = useCallback(async (forceRefresh = false) => {
    try {
      // Check session storage first
      const cachedEnvStatus = sessionStorage.getItem('env_status');
      const cacheTime = sessionStorage.getItem('env_status_time');
      const now = Date.now();
      const cacheAge = cacheTime ? now - parseInt(cacheTime) : Infinity;
      
      // Use cache if it's less than 5 minutes old and not forcing refresh
      if (!forceRefresh && cachedEnvStatus && cacheAge < 5 * 60 * 1000) {
        setEnvStatus(JSON.parse(cachedEnvStatus));
        return;
      }
      
      const response = await getEnvironmentStatus();
      if (response?.data) {
        setEnvStatus(response.data);
        // Cache the response
        sessionStorage.setItem('env_status', JSON.stringify(response.data));
        sessionStorage.setItem('env_status_time', now.toString());
      }
    } catch (error) {
      console.error('Error fetching environment status:', error);
    }
  }, []);

  // Fetch books from API
  const fetchApiBooks = useCallback(async () => {
    setIsLoadingApiBooks(true);
    setApiBooksError(null);
    
    try {
      const response = await getBooks();
      console.log('API Response:', response?.data);
      
      // The API returns an array directly, not wrapped in a books property
      if (response?.data) {
        // Handle both array response and wrapped response
        const booksData = Array.isArray(response.data) ? response.data : [];
        setApiBooks(booksData);
      }
    } catch (error: any) {
      console.error('Error fetching books:', error);
      setApiBooksError(error.response?.data?.message || error.message || 'Failed to fetch books');
    } finally {
      setIsLoadingApiBooks(false);
    }
  }, []);

  // Initialize API status on mount
  useEffect(() => {
    // Test backend connection first
    testBackendConnection();
    
    // Fetch environment status
    fetchEnvStatus();
    
    // Fetch API books
    fetchApiBooks();
    
    // Set up periodic checks
    const envStatusInterval = setInterval(() => {
      fetchEnvStatus();
    }, 60000); // 60 seconds for env status
    
    // Test backend connection every 2 minutes
    const connectionInterval = setInterval(() => {
      testBackendConnection();
    }, 120000);
    
    return () => {
      clearInterval(envStatusInterval);
      clearInterval(connectionInterval);
    };
  }, [testBackendConnection, fetchEnvStatus, fetchApiBooks]);

  return {
    // Connection State
    backendConnectionStatus,
    envStatus,
    
    // API Books State
    apiBooks,
    isLoadingApiBooks,
    apiBooksError,
    
    // Actions
    testBackendConnection,
    fetchEnvStatus,
    fetchApiBooks,
    
    // Utilities
    setBackendConnectionStatus,
    setApiBooksError
  };
};
