import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from '@/utils/toast';
import { 
  fetchBookQueueThunk,
  selectKdpQueue
} from '@/redux/slices/kdpFlowSlice';

export interface UseBookQueueReturn {
  // Queue State
  bookQueue: any;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: Date | null;
  
  // Actions
  syncBookQueueWithBackend: () => Promise<void>;
  refreshQueue: () => Promise<void>;
  
  // Queue Statistics
  getQueueStats: () => {
    total: number;
    pending: number;
    review: number;
    uploaded: number;
  };
  
  // Utilities
  setError: (error: string | null) => void;
}

export const useBookQueue = (): UseBookQueueReturn => {
  const dispatch = useDispatch();
  const reduxBookQueue = useSelector(selectKdpQueue);
  
  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Sync book queue with real backend data
  const syncBookQueueWithBackend = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Syncing book queue with backend...');
      
      const result = await dispatch(fetchBookQueueThunk() as any).unwrap();
      console.log('✅ Book queue synced successfully:', result);
      
      setLastSyncTime(new Date());
    } catch (error: any) {
      console.error('❌ Error syncing book queue:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to refresh book queue.';
      
      if (error.message?.includes('timeout')) {
        console.log('⏱️ Book queue sync timed out (expected during generation)');
        return; // Don't show error for timeouts
      } else if (error.message?.includes('Network Error') || error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Book queue endpoint not found.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Refresh queue (alias for sync)
  const refreshQueue = useCallback(async () => {
    await syncBookQueueWithBackend();
  }, [syncBookQueueWithBackend]);

  // Get queue statistics
  const getQueueStats = useCallback(() => {
    if (!reduxBookQueue?.book_queue) {
      return {
        total: 0,
        pending: 0,
        review: 0,
        uploaded: 0
      };
    }

    const queue = reduxBookQueue.book_queue;
    return {
      total: reduxBookQueue.total || queue.length,
      pending: queue.filter((book: any) => book.status?.toLowerCase() === 'pending').length,
      review: queue.filter((book: any) => book.status?.toLowerCase() === 'review').length,
      uploaded: queue.filter((book: any) => book.status?.toLowerCase() === 'uploaded').length
    };
  }, [reduxBookQueue]);

  // Auto-sync queue on mount if no data exists
  useEffect(() => {
    if (!reduxBookQueue?.book_queue) {
      console.log('No book queue data found, fetching from backend...');
      syncBookQueueWithBackend();
    }
  }, [reduxBookQueue, syncBookQueueWithBackend]);

  return {
    // Queue State
    bookQueue: reduxBookQueue,
    isLoading,
    error,
    lastSyncTime,
    
    // Actions
    syncBookQueueWithBackend,
    refreshQueue,
    
    // Queue Statistics
    getQueueStats,
    
    // Utilities
    setError
  };
};
