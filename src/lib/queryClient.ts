import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that data remains fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Time in milliseconds that data remains in cache
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry failed requests
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth queries
  auth: {
    currentUser: ['auth', 'currentUser'] as const,
    securityStatus: ['auth', 'securityStatus'] as const,
    auditLog: (limit?: number, offset?: number) => ['auth', 'auditLog', limit, offset] as const,
  },
  
  // User queries
  user: {
    profile: ['user', 'profile'] as const,
    stats: ['user', 'stats'] as const,
    preferences: ['user', 'preferences'] as const,
    activity: (limit?: number, offset?: number) => ['user', 'activity', limit, offset] as const,
    subscription: ['user', 'subscription'] as const,
    maintenanceStatus: ['user', 'maintenanceStatus'] as const,
  },
  
  // Books queries
  books: {
    all: (page?: number, limit?: number, filters?: any, sort?: any) => 
      ['books', 'list', page, limit, filters, sort] as const,
    detail: (id: string) => ['books', 'detail', id] as const,
    genres: ['books', 'genres'] as const,
    hotSellingGenres: (limit?: number) => ['books', 'genres', 'hotSelling', limit] as const,
    niches: ['books', 'niches'] as const,
    popularNiches: (limit?: number) => ['books', 'niches', 'popular', limit] as const,
    suggestions: (limit?: number) => ['books', 'suggestions', limit] as const,
    suggestionsByGenre: (genre: string, limit?: number) => 
      ['books', 'suggestions', 'genre', genre, limit] as const,
    suggestionsByNiche: (niche: string, limit?: number) => 
      ['books', 'suggestions', 'niche', niche, limit] as const,
    analytics: (bookId?: string, period?: string) => 
      ['books', 'analytics', bookId, period] as const,
    templates: ['books', 'templates'] as const,
    template: (id: string) => ['books', 'templates', id] as const,
    generationStatus: (id: string) => ['books', 'generation', id] as const,
  },
  
  // Payment queries
  payments: {
    status: (id: number) => ['payments', 'status', id] as const,
    taxCalculation: (amount: number, currency: string, country: string) => 
      ['payments', 'tax', amount, currency, country] as const,
  },
} as const;
