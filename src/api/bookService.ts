import apiClient from './client';
import { AxiosResponse } from 'axios';

// Book Types
export interface Book {
  id: string;
  title: string;
  status: 'published' | 'processing' | 'failed' | 'saved' | 'generated' | 'draft';
  revenue: number;
  adSpend: number;
  roas: number;
  acos: number;
  kenp: number;
  country: string;
  date: string;
  author?: string;
  genre?: string;
  publishedAt?: string;
  lastUpdated?: string;
  description?: string;
  coverImage?: string;
  wordCount?: number;
  pages?: number;
  isbn?: string;
  price?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface BookPrompt {
  id: string;
  prompt: string;
  niche?: string;
  targetAudience?: string;
  wordCount: number;
  genre?: string;
  language: string;
  tone?: string;
  style?: string;
  temperature: number;
  maxTokens?: number;
  model: string;
  userId: string;
  bookId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookPromptCreate {
  prompt: string;
  niche?: string;
  targetAudience?: string;
  wordCount?: number;
  genre?: string;
  language?: string;
  tone?: string;
  style?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface BookPromptUpdate {
  prompt?: string;
  niche?: string;
  targetAudience?: string;
  wordCount?: number;
  genre?: string;
  language?: string;
  tone?: string;
  style?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface BookGenerationRequest {
  prompt: string;
  niche?: string;
  targetAudience?: string;
  wordCount?: number;
  genre?: string;
  language?: string;
  tone?: string;
  style?: string;
  metadata?: Record<string, any>;
}

export interface BookGenerationResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: number;
  book?: Book;
  error?: string;
  steps: GenerationStep[];
}

export interface GenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface BookSuggestion {
  title: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  prompt: string;
  description: string;
  popularity?: number;
  revenue?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Genre {
  id: string;
  name: string;
  description: string;
  popularity: number;
  avgRevenue: number;
  bookCount: number;
  trendDirection: 'up' | 'down' | 'stable';
  keywords: string[];
  subgenres?: string[];
}

export interface Niche {
  id: string;
  name: string;
  category: string;
  competitionLevel: 'low' | 'medium' | 'high';
  avgRevenue: number;
  bookCount: number;
  trendDirection: 'up' | 'down' | 'stable';
  keywords: string[];
  description?: string;
  targetAudience?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface BookAnalytics {
  id: string;
  bookId: string;
  views: number;
  downloads: number;
  sales: number;
  revenue: number;
  adSpend: number;
  roas: number;
  acos: number;
  kenp: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversionRate: number;
  period: string;
  date: string;
}

export interface BookUpdate {
  title?: string;
  description?: string;
  genre?: string;
  price?: number;
  status?: Book['status'];
  metadata?: Record<string, any>;
}

export interface BookFilter {
  status?: Book['status'];
  genre?: string;
  niche?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  country?: string;
  search?: string;
  minRevenue?: number;
  maxRevenue?: number;
  minRoas?: number;
  maxRoas?: number;
}

export interface BookSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginatedBooksResponse {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Book Service Class
export class BookService {
  // Book CRUD Operations
  static async getBooks(
    page: number = 1,
    limit: number = 10,
    filters?: BookFilter,
    sort?: BookSort
  ): Promise<AxiosResponse<PaginatedBooksResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'dateRange' && typeof value === 'object') {
            params.append('start_date', value.start);
            params.append('end_date', value.end);
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    if (sort) {
      params.append('sort_by', sort.field);
      params.append('sort_direction', sort.direction);
    }

    return apiClient.get(`/books?${params.toString()}`);
  }

  static async getBook(bookId: string): Promise<AxiosResponse<Book>> {
    return apiClient.get(`/books/${bookId}`);
  }

  static async createBook(data: BookGenerationRequest): Promise<AxiosResponse<BookGenerationResponse>> {
    return apiClient.post('/books', data);
  }

  static async updateBook(bookId: string, data: BookUpdate): Promise<AxiosResponse<Book>> {
    return apiClient.put(`/books/${bookId}`, data);
  }

  static async deleteBook(bookId: string): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.delete(`/books/${bookId}`);
  }

  // Book Generation
  static async generateBook(data: BookGenerationRequest): Promise<AxiosResponse<BookGenerationResponse>> {
    return apiClient.post('/books/generate', data);
  }

  static async getGenerationStatus(generationId: string): Promise<AxiosResponse<BookGenerationResponse>> {
    return apiClient.get(`/books/generation/${generationId}/status`);
  }

  static async cancelGeneration(generationId: string): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post(`/books/generation/${generationId}/cancel`);
  }

  // Genres and Niches
  static async getGenres(): Promise<AxiosResponse<Genre[]>> {
    return apiClient.get('/books/genres');
  }

  static async getHotSellingGenres(limit: number = 10): Promise<AxiosResponse<Genre[]>> {
    return apiClient.get(`/books/genres/hot-selling?limit=${limit}`);
  }

  static async getNiches(): Promise<AxiosResponse<Niche[]>> {
    return apiClient.get('/books/niches');
  }

  static async getPopularNiches(limit: number = 10): Promise<AxiosResponse<Niche[]>> {
    return apiClient.get(`/books/niches/popular?limit=${limit}`);
  }

  // Book Suggestions
  static async getBookSuggestions(limit: number = 10): Promise<AxiosResponse<BookSuggestion[]>> {
    return apiClient.get(`/books/suggestions?limit=${limit}`);
  }

  static async getSuggestionsByGenre(genre: string, limit: number = 10): Promise<AxiosResponse<BookSuggestion[]>> {
    return apiClient.get(`/books/suggestions/genre/${genre}?limit=${limit}`);
  }

  static async getSuggestionsByNiche(niche: string, limit: number = 10): Promise<AxiosResponse<BookSuggestion[]>> {
    return apiClient.get(`/books/suggestions/niche/${niche}?limit=${limit}`);
  }

  // Book Analytics
  static async getBookAnalytics(bookId: string, period: string = '30d'): Promise<AxiosResponse<BookAnalytics[]>> {
    return apiClient.get(`/books/${bookId}/analytics?period=${period}`);
  }

  static async getBooksAnalytics(period: string = '30d'): Promise<AxiosResponse<BookAnalytics[]>> {
    return apiClient.get(`/books/analytics?period=${period}`);
  }

  // Book Publishing
  static async publishBook(bookId: string, platform: string = 'kdp'): Promise<AxiosResponse<{ message: string; url?: string }>> {
    return apiClient.post(`/books/${bookId}/publish`, { platform });
  }

  static async unpublishBook(bookId: string): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.post(`/books/${bookId}/unpublish`);
  }

  // Book Export
  static async exportBook(bookId: string, format: 'pdf' | 'epub' | 'mobi' | 'docx'): Promise<AxiosResponse<Blob>> {
    return apiClient.get(`/books/${bookId}/export?format=${format}`, {
      responseType: 'blob',
    });
  }

  // Book Templates
  static async getBookTemplates(): Promise<AxiosResponse<any[]>> {
    return apiClient.get('/books/templates');
  }

  static async getBookTemplate(templateId: string): Promise<AxiosResponse<any>> {
    return apiClient.get(`/books/templates/${templateId}`);
  }

  // Book Prompts
  static async getBookPrompts(page: number = 1, limit: number = 10): Promise<AxiosResponse<{ prompts: BookPrompt[]; total: number; page: number; limit: number; totalPages: number }>> {
    return apiClient.get(`/books/prompts?page=${page}&limit=${limit}`);
  }

  static async getBookPrompt(promptId: string): Promise<AxiosResponse<BookPrompt>> {
    return apiClient.get(`/books/prompts/${promptId}`);
  }

  static async createBookPrompt(data: BookPromptCreate): Promise<AxiosResponse<BookPrompt>> {
    return apiClient.post('/books/prompts', data);
  }

  static async updateBookPrompt(promptId: string, data: BookPromptUpdate): Promise<AxiosResponse<BookPrompt>> {
    return apiClient.put(`/books/prompts/${promptId}`, data);
  }

  static async deleteBookPrompt(promptId: string): Promise<AxiosResponse<{ message: string }>> {
    return apiClient.delete(`/books/prompts/${promptId}`);
  }

  // Helper methods
  static getStatusLabel(status: Book['status']): string {
    const statusLabels: Record<Book['status'], string> = {
      published: 'Published',
      processing: 'Processing',
      failed: 'Failed',
      saved: 'Saved',
      generated: 'Generated',
      draft: 'Draft',
    };
    return statusLabels[status] || status;
  }

  static getStatusColor(status: Book['status']): string {
    const statusColors: Record<Book['status'], string> = {
      published: 'text-green-600 bg-green-100',
      processing: 'text-yellow-600 bg-yellow-100',
      failed: 'text-red-600 bg-red-100',
      saved: 'text-blue-600 bg-blue-100',
      generated: 'text-purple-600 bg-purple-100',
      draft: 'text-gray-600 bg-gray-100',
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  }

  static getDifficultyLabel(difficulty: string): string {
    const difficultyLabels: Record<string, string> = {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    };
    return difficultyLabels[difficulty] || difficulty;
  }

  static getDifficultyColor(difficulty: string): string {
    const difficultyColors: Record<string, string> = {
      easy: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      hard: 'text-red-600 bg-red-100',
    };
    return difficultyColors[difficulty] || 'text-gray-600 bg-gray-100';
  }

  static getCompetitionLevelLabel(level: string): string {
    const levelLabels: Record<string, string> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    };
    return levelLabels[level] || level;
  }

  static getCompetitionLevelColor(level: string): string {
    const levelColors: Record<string, string> = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-red-600 bg-red-100',
    };
    return levelColors[level] || 'text-gray-600 bg-gray-100';
  }

  static getTrendDirectionIcon(direction: string): string {
    const trendIcons: Record<string, string> = {
      up: '↗️',
      down: '↘️',
      stable: '→',
    };
    return trendIcons[direction] || '→';
  }

  static getTrendDirectionColor(direction: string): string {
    const trendColors: Record<string, string> = {
      up: 'text-green-600',
      down: 'text-red-600',
      stable: 'text-gray-600',
    };
    return trendColors[direction] || 'text-gray-600';
  }

  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  static formatNumber(number: number): string {
    return new Intl.NumberFormat('en-US').format(number);
  }

  static formatPercentage(value: number, decimals: number = 2): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  static formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static calculateROAS(revenue: number, adSpend: number): number {
    if (adSpend === 0) return 0;
    return revenue / adSpend;
  }

  static calculateACOS(adSpend: number, revenue: number): number {
    if (revenue === 0) return 0;
    return adSpend / revenue;
  }

  static calculateCTR(clicks: number, impressions: number): number {
    if (impressions === 0) return 0;
    return clicks / impressions;
  }

  static calculateConversionRate(conversions: number, clicks: number): number {
    if (clicks === 0) return 0;
    return conversions / clicks;
  }

  static isBookPublished(book: Book): boolean {
    return book.status === 'published';
  }

  static isBookProcessing(book: Book): boolean {
    return book.status === 'processing';
  }

  static isBookFailed(book: Book): boolean {
    return book.status === 'failed';
  }

  static canEditBook(book: Book): boolean {
    return ['draft', 'saved', 'generated'].includes(book.status);
  }

  static canPublishBook(book: Book): boolean {
    return ['saved', 'generated'].includes(book.status);
  }

  static canDeleteBook(book: Book): boolean {
    return !['published'].includes(book.status);
  }

  static getDefaultBookPrompt(): BookPrompt {
    return {
      id: '',
      prompt: '',
      niche: '',
      targetAudience: '',
      wordCount: 5000,
      language: 'en',
      temperature: 0.7,
      model: 'gpt-4',
      userId: '',
      createdAt: new Date().toISOString(),
    };
  }

  static validateBookPrompt(prompt: BookPrompt): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!prompt.prompt || prompt.prompt.trim().length < 10) {
      errors.push('Prompt must be at least 10 characters long');
    }

    if (prompt.wordCount < 1000) {
      errors.push('Word count must be at least 1,000 words');
    }

    if (prompt.wordCount > 100000) {
      errors.push('Word count must be no more than 100,000 words');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static getPopularGenres(): string[] {
    return [
      'Health & Fitness',
      'Business & Entrepreneurship',
      'Self-Help',
      'Technology',
      'Finance',
      'Marketing',
      'Education',
      'Cooking',
      'Travel',
      'Fiction',
    ];
  }

  static getPopularNicheNames(): string[] {
    return [
      'Weight Loss',
      'Business Startup',
      'Digital Marketing',
      'Personal Finance',
      'Productivity',
      'Cooking',
      'Travel',
      'Technology',
      'Health',
      'Education',
    ];
  }

  static getTargetAudiences(): string[] {
    return [
      'Beginners',
      'Professionals',
      'Entrepreneurs',
      'Students',
      'Young Adults',
      'Seniors',
      'Parents',
      'Business Owners',
      'General Audience',
    ];
  }
}

// Export individual functions for convenience
export const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  generateBook,
  getGenerationStatus,
  cancelGeneration,
  getGenres,
  getHotSellingGenres,
  getNiches,
  getPopularNiches,
  getBookSuggestions,
  getSuggestionsByGenre,
  getSuggestionsByNiche,
  getBookAnalytics,
  getBooksAnalytics,
  publishBook,
  unpublishBook,
  exportBook,
  getBookTemplates,
  getBookTemplate,
  getBookPrompts,
  getBookPrompt,
  createBookPrompt,
  updateBookPrompt,
  deleteBookPrompt,
  getStatusLabel,
  getStatusColor,
  getDifficultyLabel,
  getDifficultyColor,
  getCompetitionLevelLabel,
  getCompetitionLevelColor,
  getTrendDirectionIcon,
  getTrendDirectionColor,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  calculateROAS,
  calculateACOS,
  calculateCTR,
  calculateConversionRate,
  isBookPublished,
  isBookProcessing,
  isBookFailed,
  canEditBook,
  canPublishBook,
  canDeleteBook,
  getDefaultBookPrompt,
  validateBookPrompt,
  getPopularGenres,
  getPopularNicheNames,
  getTargetAudiences,
} = BookService;

export default BookService;
