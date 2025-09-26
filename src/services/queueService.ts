import { 
  fetchBookQueueThunk
} from '@/redux/slices/kdpFlowSlice';

export interface QueueBook {
  id: string;
  title: string;
  status: 'Pending' | 'Review' | 'Uploaded' | 'Failed';
  genre?: string;
  niche?: string;
  target_audience?: string;
  word_count?: number;
  author_name?: string;
  price?: number;
  manuscript_filename?: string;
  cover_filename?: string;
  cover_image_url?: string;
  proofread_report?: string;
  stats?: Record<string, any>;
  kdp_form_data?: Record<string, any>;
  kdp_form_data_exists?: boolean;
  description?: string;
  created_at?: string;
}

export interface QueueResponse {
  book_queue: QueueBook[];
  total: number;
  page: number;
  per_page: number;
}

export interface QueueStats {
  total: number;
  pending: number;
  review: number;
  uploaded: number;
  failed: number;
}

export class QueueService {
  private static instance: QueueService;
  private readonly CACHE_KEY = 'book_queue_cache';
  private readonly CACHE_TIME_KEY = 'book_queue_cache_time';
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds

  private constructor() {}

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  /**
   * Get cached queue data
   */
  public getCachedQueue(): QueueResponse | null {
    try {
      const cachedData = sessionStorage.getItem(this.CACHE_KEY);
      const cacheTime = sessionStorage.getItem(this.CACHE_TIME_KEY);
      
      if (!cachedData || !cacheTime) return null;
      
      const now = Date.now();
      const cacheAge = now - parseInt(cacheTime);
      
      if (cacheAge < this.CACHE_DURATION) {
        return JSON.parse(cachedData);
      } else {
        // Cache expired, clear it
        this.clearCache();
        return null;
      }
    } catch (error) {
      console.error('Error reading cached queue data:', error);
      this.clearCache();
      return null;
    }
  }

  /**
   * Cache queue data
   */
  public cacheQueue(queueData: QueueResponse): void {
    try {
      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(queueData));
      sessionStorage.setItem(this.CACHE_TIME_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error caching queue data:', error);
    }
  }

  /**
   * Clear queue cache
   */
  public clearCache(): void {
    try {
      sessionStorage.removeItem(this.CACHE_KEY);
      sessionStorage.removeItem(this.CACHE_TIME_KEY);
    } catch (error) {
      console.error('Error clearing queue cache:', error);
    }
  }

  /**
   * Fetch book queue from backend
   */
  public async fetchQueue(dispatch: any, useCache = true): Promise<QueueResponse | null> {
    try {
      // Check cache first if enabled
      if (useCache) {
        const cachedData = this.getCachedQueue();
        if (cachedData) {
          console.log('📚 Using cached queue data');
          return cachedData;
        }
      }

      console.log('🔄 Fetching book queue from backend...');
      const result = await dispatch(fetchBookQueueThunk()).unwrap();
      
      if (result) {
        // Cache the result
        this.cacheQueue(result);
        console.log('✅ Book queue fetched and cached successfully');
        return result;
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ Error fetching book queue:', error);
      
      // Try to return cached data as fallback
      const cachedData = this.getCachedQueue();
      if (cachedData) {
        console.log('📚 Returning cached data as fallback');
        return cachedData;
      }
      
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  public getQueueStats(queueData: QueueResponse | null): QueueStats {
    if (!queueData?.book_queue) {
      return {
        total: 0,
        pending: 0,
        review: 0,
        uploaded: 0,
        failed: 0
      };
    }

    const queue = queueData.book_queue;
    return {
      total: queueData.total || queue.length,
      pending: queue.filter(book => book.status?.toLowerCase() === 'pending').length,
      review: queue.filter(book => book.status?.toLowerCase() === 'review').length,
      uploaded: queue.filter(book => book.status?.toLowerCase() === 'uploaded').length,
      failed: queue.filter(book => book.status?.toLowerCase() === 'failed').length
    };
  }

  /**
   * Find book in queue by ID or title
   */
  public findBookInQueue(queueData: QueueResponse | null, identifier: string | number): QueueBook | null {
    if (!queueData?.book_queue) return null;

    return queueData.book_queue.find(book => 
      book.id === identifier || 
      book.title === identifier ||
      book.id?.toString() === identifier?.toString()
    ) || null;
  }

  /**
   * Get books by status
   */
  public getBooksByStatus(queueData: QueueResponse | null, status: string): QueueBook[] {
    if (!queueData?.book_queue) return [];

    return queueData.book_queue.filter(book => 
      book.status?.toLowerCase() === status.toLowerCase()
    );
  }

  /**
   * Check if queue has pending books
   */
  public hasPendingBooks(queueData: QueueResponse | null): boolean {
    if (!queueData?.book_queue) return false;
    return queueData.book_queue.some(book => book.status?.toLowerCase() === 'pending');
  }

  /**
   * Check if queue has review books
   */
  public hasReviewBooks(queueData: QueueResponse | null): boolean {
    if (!queueData?.book_queue) return false;
    return queueData.book_queue.some(book => book.status?.toLowerCase() === 'review');
  }

  /**
   * Get queue health status
   */
  public getQueueHealth(queueData: QueueResponse | null): {
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!queueData) {
      issues.push('No queue data available');
      recommendations.push('Check backend connection and try refreshing');
      return { isHealthy: false, issues, recommendations };
    }

    if (!queueData.book_queue || queueData.book_queue.length === 0) {
      issues.push('Empty queue');
      recommendations.push('Generate some books to populate the queue');
    }

    const stats = this.getQueueStats(queueData);
    
    if (stats.failed > 0) {
      issues.push(`${stats.failed} failed books in queue`);
      recommendations.push('Review failed books and retry generation');
    }

    if (stats.pending > 10) {
      issues.push('High number of pending books');
      recommendations.push('Consider processing books in smaller batches');
    }

    const isHealthy = issues.length === 0;

    return {
      isHealthy,
      issues,
      recommendations
    };
  }

  /**
   * Format queue book for display
   */
  public formatBookForDisplay(book: QueueBook): {
    id: string;
    title: string;
    status: string;
    genre: string;
    targetAudience: string;
    wordCount: number;
    hasCover: boolean;
    createdAt: string;
    hasKdpData: boolean;
  } {
    return {
      id: book.id || 'unknown',
      title: book.title || 'Untitled',
      status: book.status || 'Unknown',
      genre: book.genre || book.niche || 'General',
      targetAudience: book.target_audience || 'General Audience',
      wordCount: book.word_count || 0,
      hasCover: !!book.cover_image_url,
      createdAt: book.created_at ? new Date(book.created_at).toLocaleDateString() : 'Unknown',
      hasKdpData: !!book.kdp_form_data_exists
    };
  }

  /**
   * Validate queue response
   */
  public validateQueueResponse(data: any): data is QueueResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray(data.book_queue) &&
      typeof data.total === 'number'
    );
  }
}

// Export singleton instance
export const queueService = QueueService.getInstance();
