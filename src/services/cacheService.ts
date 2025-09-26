import { AxiosResponse } from 'axios';

// Cache configuration interface
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  key: string; // Cache key
  skipCache?: boolean; // Force skip cache
  invalidateOn?: string[]; // Events that should invalidate this cache
}

// Cache entry interface
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

// Cache invalidation event types
export type CacheInvalidationEvent = 
  | 'user_login'
  | 'user_logout'
  | 'subscription_change'
  | 'profile_update'
  | 'payment_success'
  | 'manual_refresh';

// Cache service class
export class CacheService {
  private static cache = new Map<string, CacheEntry>();
  private static eventListeners = new Map<CacheInvalidationEvent, Set<string>>();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly SUBSCRIPTION_TTL = 2 * 60 * 1000; // 2 minutes for subscription data
  private static readonly USER_DATA_TTL = 10 * 60 * 1000; // 10 minutes for user data
  private static readonly STATIC_DATA_TTL = 30 * 60 * 1000; // 30 minutes for static data

  // Generate cache key from URL and params
  static generateKey(url: string, params?: any): string {
    const baseKey = url.replace(/[^a-zA-Z0-9]/g, '_');
    if (params) {
      const paramString = JSON.stringify(params);
      return `${baseKey}_${btoa(paramString)}`;
    }
    return baseKey;
  }

  // Get cached data
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Set cached data
  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key
    };

    this.cache.set(key, entry);
  }

  // Remove specific cache entry
  static delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  static clear(): void {
    this.cache.clear();
  }

  // Clear cache by pattern
  static clearByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // Register cache key for invalidation events
  static registerForInvalidation(key: string, events: CacheInvalidationEvent[]): void {
    events.forEach(event => {
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, new Set());
      }
      this.eventListeners.get(event)!.add(key);
    });
  }

  // Invalidate cache by event
  static invalidateByEvent(event: CacheInvalidationEvent): void {
    const keys = this.eventListeners.get(event);
    if (keys) {
      keys.forEach(key => {
        this.cache.delete(key);
      });
    }
  }

  // Get TTL for specific endpoint types
  static getTTLForEndpoint(url: string): number {
    // Subscription-related endpoints - shorter TTL
    if (url.includes('/subscription/') || url.includes('/my-subscription')) {
      return this.SUBSCRIPTION_TTL;
    }
    
    // User profile data - medium TTL
    if (url.includes('/user/') || url.includes('/profile')) {
      return this.USER_DATA_TTL;
    }
    
    // Static data like plans - longer TTL
    if (url.includes('/plans') || url.includes('/features')) {
      return this.STATIC_DATA_TTL;
    }
    
    // Default TTL
    return this.DEFAULT_TTL;
  }

  // Cache axios response
  static cacheResponse<T>(response: AxiosResponse<T>, url: string, params?: any): T {
    const key = this.generateKey(url, params);
    const ttl = this.getTTLForEndpoint(url);
    
    this.set(key, response.data, ttl);
    
    // Register for invalidation based on endpoint type
    if (url.includes('/subscription/')) {
      this.registerForInvalidation(key, ['subscription_change', 'user_logout']);
    } else if (url.includes('/user/') || url.includes('/profile')) {
      this.registerForInvalidation(key, ['profile_update', 'user_logout']);
    }
    
    return response.data;
  }

  // Get cache statistics
  static getStats(): {
    totalEntries: number;
    expiredEntries: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    let expiredEntries = 0;
    
    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      }
    }
    
    return {
      totalEntries: this.cache.size,
      expiredEntries,
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }

  // Clean expired entries
  static cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  // Predefined cache configurations for common endpoints
  static readonly CACHE_CONFIGS: Record<string, CacheConfig> = {
    // Subscription endpoints
    'subscription_status': {
      ttl: this.SUBSCRIPTION_TTL,
      key: 'subscription_status',
      invalidateOn: ['subscription_change', 'user_logout']
    },
    'subscription_plans': {
      ttl: this.STATIC_DATA_TTL,
      key: 'subscription_plans',
      invalidateOn: ['manual_refresh']
    },
    'user_subscription': {
      ttl: this.SUBSCRIPTION_TTL,
      key: 'user_subscription',
      invalidateOn: ['subscription_change', 'user_logout']
    },
    
    // User endpoints
    'user_profile': {
      ttl: this.USER_DATA_TTL,
      key: 'user_profile',
      invalidateOn: ['profile_update', 'user_logout']
    },
    'user_preferences': {
      ttl: this.USER_DATA_TTL,
      key: 'user_preferences',
      invalidateOn: ['profile_update', 'user_logout']
    },
    
    // Payment endpoints
    'payment_history': {
      ttl: this.DEFAULT_TTL,
      key: 'payment_history',
      invalidateOn: ['payment_success', 'user_logout']
    },
    
    // Account status (from additional service - port 8080)
    'account_status': {
      ttl: this.SUBSCRIPTION_TTL,
      key: 'account_status',
      invalidateOn: ['subscription_change', 'user_logout']
    }
  };
}

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  const cleaned = CacheService.cleanExpired();
  if (cleaned > 0) {
    console.log(`CacheService: Cleaned ${cleaned} expired entries`);
  }
}, 5 * 60 * 1000);

export default CacheService;
