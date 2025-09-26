import { useCallback, useRef } from 'react';
import { useSubscription } from './useSubscription';

/**
 * Custom hook that provides debounced subscription data fetching
 * to prevent rapid successive API calls
 */
export const useDebouncedSubscription = (delay: number = 1000) => {
  const { fetchAll, cacheValid, plans } = useSubscription();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  const debouncedFetchAll = useCallback(async () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if we recently fetched (within the last 2 seconds)
    const now = Date.now();
    if (now - lastFetchRef.current < 2000) {
      console.log('🚫 [useDebouncedSubscription] Skipping fetch - too recent');
      return;
    }

    // Check if cache is valid
    if (cacheValid && plans.length > 0) {
      console.log('✅ [useDebouncedSubscription] Cache is valid, skipping fetch');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          console.log('🔄 [useDebouncedSubscription] Executing debounced fetch');
          lastFetchRef.current = Date.now();
          await fetchAll();
          resolve();
        } catch (error) {
          console.error('❌ [useDebouncedSubscription] Fetch failed:', error);
          reject(error);
        }
      }, delay);
    });
  }, [fetchAll, cacheValid, plans.length, delay]);

  const cancelDebouncedFetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      console.log('🚫 [useDebouncedSubscription] Cancelled debounced fetch');
    }
  }, []);

  return {
    debouncedFetchAll,
    cancelDebouncedFetch,
  };
};
