import { useState, useCallback } from 'react';
import { ApiResponse, PaginatedResponse } from '@/types';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction(...args);
      
      if (response.success) {
        setData(response.data);
        options.onSuccess?.(response.data);
        return response.data;
      } else {
        const errorMessage = response.error || 'An error occurred';
        setError(errorMessage);
        options.onError?.(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, options]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}

export function usePaginatedApi<T>(
  apiFunction: (...args: any[]) => Promise<PaginatedResponse<T>>,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction(...args);
      
      if (response.success) {
        setData(response.data);
        setPagination(response.pagination);
        options.onSuccess?.(response.data);
        return response.data;
      } else {
        const errorMessage = response.error || 'An error occurred';
        setError(errorMessage);
        options.onError?.(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, options]);

  const reset = useCallback(() => {
    setData([]);
    setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    execute,
    reset
  };
}
