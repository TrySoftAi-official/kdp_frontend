import { ApiResponse, PaginatedResponse, Book, Metric, Event, Campaign, Niche, ChartData, FilterOptions, SortOptions } from '@/types';
import { calculateROAS } from './utils';

// Mock data for development
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Digital Marketing Mastery',
    status: 'published',
    revenue: 2450.50,
    adSpend: 380.25,
    roas: 6.44,
    acos: 15.5,
    kenp: 12450,
    country: 'US',
    date: '2024-01-15',
    author: 'John Smith',
    genre: 'Business',
    publishedAt: '2024-01-15T10:30:00Z',
    lastUpdated: '2024-01-20T14:22:00Z'
  },
  {
    id: '2',
    title: 'Romance in Paris',
    status: 'processing',
    revenue: 1850.75,
    adSpend: 295.40,
    roas: 6.26,
    acos: 16.0,
    kenp: 8950,
    country: 'UK',
    date: '2024-01-18',
    author: 'Emma Wilson',
    genre: 'Romance',
    publishedAt: '2024-01-18T09:15:00Z',
    lastUpdated: '2024-01-22T11:45:00Z'
  },
  {
    id: '3',
    title: 'Cooking for Beginners',
    status: 'failed',
    revenue: 0,
    adSpend: 150.00,
    roas: 0,
    acos: 0,
    kenp: 0,
    country: 'CA',
    date: '2024-01-20',
    author: 'Chef Maria',
    genre: 'Cooking',
    publishedAt: undefined,
    lastUpdated: '2024-01-23T16:30:00Z'
  },
  {
    id: '4',
    title: 'Mystery of the Lost City',
    status: 'published',
    revenue: 3200.25,
    adSpend: 480.15,
    roas: 6.67,
    acos: 15.0,
    kenp: 15680,
    country: 'AU',
    date: '2024-01-12',
    author: 'Detective Jones',
    genre: 'Mystery',
    publishedAt: '2024-01-12T14:20:00Z',
    lastUpdated: '2024-01-25T09:10:00Z'
  },
  {
    id: '5',
    title: 'Science Fiction Adventures',
    status: 'published',
    revenue: 1950.80,
    adSpend: 320.50,
    roas: 6.08,
    acos: 16.4,
    kenp: 11250,
    country: 'US',
    date: '2024-01-25',
    author: 'Alex Future',
    genre: 'Sci-Fi',
    publishedAt: '2024-01-25T12:45:00Z',
    lastUpdated: '2024-01-26T08:30:00Z'
  }
];

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Book Published Successfully',
    description: 'Digital Marketing Mastery has been published to all platforms',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'success'
  },
  {
    id: '2',
    title: 'High Ad Spend Alert',
    description: 'Romance in Paris campaign exceeded daily budget by 20%',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    type: 'warning'
  },
  {
    id: '3',
    title: 'Publication Failed',
    description: 'Cooking for Beginners failed due to formatting issues',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    type: 'error'
  },
  {
    id: '4',
    title: 'New Order Received',
    description: 'Mystery of the Lost City received 15 new orders',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    type: 'info'
  },
  {
    id: '5',
    title: 'Campaign Optimization',
    description: 'Science Fiction Adventures campaign was automatically optimized',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    type: 'info'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication API
export const authApi = {
  login: async (_email: string, _password?: string): Promise<ApiResponse<{ token: string }>> => {
    await delay(1000);
    return {
      success: true,
      data: { token: 'mock-jwt-token' }
    };
  },

  logout: async (): Promise<ApiResponse<null>> => {
    await delay(500);
    return {
      success: true,
      data: null
    };
  }
};

// Books API
export const booksApi = {
  getBooks: async (filters?: FilterOptions, sort?: SortOptions): Promise<PaginatedResponse<Book>> => {
    await delay(800);
    
    let filteredBooks = [...mockBooks];
    
    // Apply filters
    if (filters?.status) {
      filteredBooks = filteredBooks.filter(book => book.status === filters.status);
    }
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters?.country) {
      filteredBooks = filteredBooks.filter(book => book.country === filters.country);
    }
    
    // Apply sorting
    if (sort) {
      filteredBooks.sort((a, b) => {
        const aValue = a[sort.field as keyof Book];
        const bValue = b[sort.field as keyof Book];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sort.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sort.direction === 'asc' 
            ? aValue - bValue 
            : bValue - aValue;
        }
        
        return 0;
      });
    }
    
    return {
      success: true,
      data: filteredBooks,
      pagination: {
        page: 1,
        limit: 50,
        total: filteredBooks.length,
        totalPages: 1
      }
    };
  },

  uploadCSV: async (_file: File): Promise<ApiResponse<{ processed: number; failed: number }>> => {
    await delay(2000);
    
    // Simulate processing
    const processed = Math.floor(Math.random() * 20) + 5;
    const failed = Math.floor(Math.random() * 3);
    
    return {
      success: true,
      data: { processed, failed }
    };
  },

  retryPublication: async (bookId: string): Promise<ApiResponse<Book>> => {
    await delay(1500);
    
    const book = mockBooks.find(b => b.id === bookId);
    if (book) {
      book.status = 'processing';
      return {
        success: true,
        data: book
      };
    }
    
    return {
      success: false,
      data: null as any,
      error: 'Book not found'
    };
  }
};

// Analytics API
export const analyticsApi = {
  getMetrics: async (): Promise<ApiResponse<Metric[]>> => {
    await delay(600);
    
    const totalBooks = mockBooks.filter(b => b.status === 'published').length;
    const totalRevenue = mockBooks.reduce((sum, book) => sum + book.revenue, 0);
    const totalAdSpend = mockBooks.reduce((sum, book) => sum + book.adSpend, 0);
    const warnings = mockBooks.filter(b => b.status === 'failed').length;
    
    return {
      success: true,
      data: [
        {
          title: 'Total Books',
          value: totalBooks,
          change: '+12%',
          isPositive: true,
          icon: null as any, // Will be set in component
          color: 'bg-blue-500'
        },
        {
          title: 'Revenue',
          value: `$${totalRevenue.toLocaleString()}`,
          change: '+8.5%',
          isPositive: true,
          icon: null as any,
          color: 'bg-green-500'
        },
        {
          title: 'Ad Spend',
          value: `$${totalAdSpend.toLocaleString()}`,
          change: '+5.2%',
          isPositive: false,
          icon: null as any,
          color: 'bg-orange-500'
        },
        {
          title: 'Warnings',
          value: warnings,
          change: '-2',
          isPositive: true,
          icon: null as any,
          color: 'bg-red-500'
        }
      ]
    };
  },

  getChartData: async (dateRange: string): Promise<ApiResponse<ChartData[]>> => {
    await delay(800);
    
    // Generate mock chart data
    const data: ChartData[] = [];
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const revenue = Math.floor(Math.random() * 1000) + 500;
      const adSpend = Math.floor(Math.random() * 200) + 50;
      
      data.push({
        date: date.toISOString().split('T')[0],
        revenue,
        adSpend,
        roas: calculateROAS(revenue, adSpend)
      });
    }
    
    return {
      success: true,
      data
    };
  },

  getTopBooks: async (): Promise<ApiResponse<Book[]>> => {
    await delay(500);
    
    const topBooks = [...mockBooks]
      .filter(book => book.status === 'published')
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    return {
      success: true,
      data: topBooks
    };
  }
};

// Events API
export const eventsApi = {
  getRecentEvents: async (): Promise<ApiResponse<Event[]>> => {
    await delay(400);
    
    return {
      success: true,
      data: mockEvents
    };
  }
};

// Campaigns API
export const campaignsApi = {
  getCampaigns: async (): Promise<PaginatedResponse<Campaign>> => {
    await delay(600);
    
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'Romance Series Promotion',
        status: 'active',
        budget: 1000,
        spent: 750,
        impressions: 45000,
        clicks: 1200,
        conversions: 85,
        roas: 4.2,
        startDate: '2024-01-01',
        endDate: '2024-02-01'
      },
      {
        id: '2',
        name: 'Business Books Campaign',
        status: 'paused',
        budget: 1500,
        spent: 890,
        impressions: 32000,
        clicks: 980,
        conversions: 62,
        roas: 3.8,
        startDate: '2024-01-15'
      }
    ];
    
    return {
      success: true,
      data: mockCampaigns,
      pagination: {
        page: 1,
        limit: 10,
        total: mockCampaigns.length,
        totalPages: 1
      }
    };
  }
};

// Niches API
export const nichesApi = {
  getNiches: async (): Promise<PaginatedResponse<Niche>> => {
    await delay(500);
    
    const mockNiches: Niche[] = [
      {
        id: '1',
        name: 'Digital Marketing',
        category: 'Business',
        competitionLevel: 'high',
        avgRevenue: 2500,
        bookCount: 15,
        trendDirection: 'up',
        keywords: ['marketing', 'digital', 'online', 'advertising']
      },
      {
        id: '2',
        name: 'Romance Fiction',
        category: 'Fiction',
        competitionLevel: 'medium',
        avgRevenue: 1800,
        bookCount: 25,
        trendDirection: 'stable',
        keywords: ['romance', 'love', 'relationships', 'fiction']
      }
    ];
    
    return {
      success: true,
      data: mockNiches,
      pagination: {
        page: 1,
        limit: 10,
        total: mockNiches.length,
        totalPages: 1
      }
    };
  }
};
