import { useState, useCallback } from 'react';
import BookService, {
  Book,
  BookGenerationRequest,
  BookGenerationResponse,
  BookUpdate,
  BookFilter,
  BookSort,
  PaginatedBooksResponse,
  Genre,
  Niche,
  BookSuggestion,
  BookAnalytics,
  BookPrompt,
  BookPromptCreate,
  BookPromptUpdate,
} from '@/api/bookService';
import { getErrorMessage } from '@/api/client';
import { AxiosError } from 'axios';

interface UseBooksApiReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Book CRUD
  getBooks: (page?: number, limit?: number, filters?: BookFilter, sort?: BookSort) => Promise<PaginatedBooksResponse | null>;
  getBook: (bookId: string) => Promise<Book | null>;
  createBook: (data: BookGenerationRequest) => Promise<BookGenerationResponse | null>;
  updateBook: (bookId: string, data: BookUpdate) => Promise<Book | null>;
  deleteBook: (bookId: string) => Promise<boolean>;
  
  // Book generation
  generateBook: (data: BookGenerationRequest) => Promise<BookGenerationResponse | null>;
  getGenerationStatus: (generationId: string) => Promise<BookGenerationResponse | null>;
  cancelGeneration: (generationId: string) => Promise<boolean>;
  
  // Genres and niches
  getGenres: () => Promise<Genre[] | null>;
  getHotSellingGenres: (limit?: number) => Promise<Genre[] | null>;
  getNiches: () => Promise<Niche[] | null>;
  getPopularNiches: (limit?: number) => Promise<Niche[] | null>;
  
  // Book suggestions
  getBookSuggestions: (limit?: number) => Promise<BookSuggestion[] | null>;
  getSuggestionsByGenre: (genre: string, limit?: number) => Promise<BookSuggestion[] | null>;
  getSuggestionsByNiche: (niche: string, limit?: number) => Promise<BookSuggestion[] | null>;
  
  // Book analytics
  getBookAnalytics: (bookId: string, period?: string) => Promise<BookAnalytics[] | null>;
  getBooksAnalytics: (period?: string) => Promise<BookAnalytics[] | null>;
  
  // Book publishing
  publishBook: (bookId: string, platform?: string) => Promise<{ message: string; url?: string } | null>;
  unpublishBook: (bookId: string) => Promise<boolean>;
  
  // Book export
  exportBook: (bookId: string, format: 'pdf' | 'epub' | 'mobi' | 'docx') => Promise<Blob | null>;
  
  // Book templates
  getBookTemplates: () => Promise<any[] | null>;
  getBookTemplate: (templateId: string) => Promise<any | null>;
  
  // Book prompts
  getBookPrompts: (page?: number, limit?: number) => Promise<{ prompts: BookPrompt[]; total: number; page: number; limit: number; totalPages: number } | null>;
  getBookPrompt: (promptId: string) => Promise<BookPrompt | null>;
  createBookPrompt: (data: BookPromptCreate) => Promise<BookPrompt | null>;
  updateBookPrompt: (promptId: string, data: BookPromptUpdate) => Promise<BookPrompt | null>;
  deleteBookPrompt: (promptId: string) => Promise<boolean>;
  
  // Utilities
  clearError: () => void;
  getStatusLabel: (status: Book['status']) => string;
  getStatusColor: (status: Book['status']) => string;
  getDifficultyLabel: (difficulty: string) => string;
  getDifficultyColor: (difficulty: string) => string;
  getCompetitionLevelLabel: (level: string) => string;
  getCompetitionLevelColor: (level: string) => string;
  getTrendDirectionIcon: (direction: string) => string;
  getTrendDirectionColor: (direction: string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (number: number) => string;
  formatPercentage: (value: number, decimals?: number) => string;
  formatDate: (dateString: string) => string;
  formatDateTime: (dateString: string) => string;
  calculateROAS: (revenue: number, adSpend: number) => number;
  calculateACOS: (adSpend: number, revenue: number) => number;
  calculateCTR: (clicks: number, impressions: number) => number;
  calculateConversionRate: (conversions: number, clicks: number) => number;
  isBookPublished: (book: Book) => boolean;
  isBookProcessing: (book: Book) => boolean;
  isBookFailed: (book: Book) => boolean;
  canEditBook: (book: Book) => boolean;
  canPublishBook: (book: Book) => boolean;
  canDeleteBook: (book: Book) => boolean;
  getDefaultBookPrompt: () => any;
  validateBookPrompt: (prompt: any) => { isValid: boolean; errors: string[] };
  getPopularGenres: () => string[];
  getPopularNicheNames: () => string[];
  getTargetAudiences: () => string[];
}

export const useBooksApi = (): UseBooksApiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get books
  const getBooks = useCallback(async (
    page: number = 1,
    limit: number = 10,
    filters?: BookFilter,
    sort?: BookSort
  ): Promise<PaginatedBooksResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getBooks(page, limit, filters, sort);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get book
  const getBook = useCallback(async (bookId: string): Promise<Book | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getBook(bookId);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create book
  const createBook = useCallback(async (data: BookGenerationRequest): Promise<BookGenerationResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.createBook(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update book
  const updateBook = useCallback(async (bookId: string, data: BookUpdate): Promise<Book | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.updateBook(bookId, data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete book
  const deleteBook = useCallback(async (bookId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await BookService.deleteBook(bookId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate book
  const generateBook = useCallback(async (data: BookGenerationRequest): Promise<BookGenerationResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.generateBook(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get generation status
  const getGenerationStatus = useCallback(async (generationId: string): Promise<BookGenerationResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getGenerationStatus(generationId);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel generation
  const cancelGeneration = useCallback(async (generationId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await BookService.cancelGeneration(generationId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get genres
  const getGenres = useCallback(async (): Promise<Genre[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getGenres();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get hot selling genres
  const getHotSellingGenres = useCallback(async (limit: number = 10): Promise<Genre[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getHotSellingGenres(limit);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get niches
  const getNiches = useCallback(async (): Promise<Niche[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getNiches();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get popular niches
  const getPopularNiches = useCallback(async (limit: number = 10): Promise<Niche[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getPopularNiches(limit);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get book suggestions
  const getBookSuggestions = useCallback(async (limit: number = 10): Promise<BookSuggestion[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getBookSuggestions(limit);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get suggestions by genre
  const getSuggestionsByGenre = useCallback(async (genre: string, limit: number = 10): Promise<BookSuggestion[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getSuggestionsByGenre(genre, limit);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get suggestions by niche
  const getSuggestionsByNiche = useCallback(async (niche: string, limit: number = 10): Promise<BookSuggestion[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getSuggestionsByNiche(niche, limit);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get book analytics
  const getBookAnalytics = useCallback(async (bookId: string, period: string = '30d'): Promise<BookAnalytics[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getBookAnalytics(bookId, period);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get books analytics
  const getBooksAnalytics = useCallback(async (period: string = '30d'): Promise<BookAnalytics[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getBooksAnalytics(period);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Publish book
  const publishBook = useCallback(async (bookId: string, platform: string = 'kdp'): Promise<{ message: string; url?: string } | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.publishBook(bookId, platform);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Unpublish book
  const unpublishBook = useCallback(async (bookId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await BookService.unpublishBook(bookId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Export book
  const exportBook = useCallback(async (bookId: string, format: 'pdf' | 'epub' | 'mobi' | 'docx'): Promise<Blob | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.exportBook(bookId, format);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get book templates
  const getBookTemplates = useCallback(async (): Promise<any[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getBookTemplates();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get book template
  const getBookTemplate = useCallback(async (templateId: string): Promise<any | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getBookTemplate(templateId);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get book prompts
  const getBookPrompts = useCallback(async (page: number = 1, limit: number = 10): Promise<{ prompts: BookPrompt[]; total: number; page: number; limit: number; totalPages: number } | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getBookPrompts(page, limit);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get book prompt
  const getBookPrompt = useCallback(async (promptId: string): Promise<BookPrompt | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.getBookPrompt(promptId);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create book prompt
  const createBookPrompt = useCallback(async (data: BookPromptCreate): Promise<BookPrompt | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.createBookPrompt(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update book prompt
  const updateBookPrompt = useCallback(async (promptId: string, data: BookPromptUpdate): Promise<BookPrompt | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BookService.updateBookPrompt(promptId, data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete book prompt
  const deleteBookPrompt = useCallback(async (promptId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await BookService.deleteBookPrompt(promptId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // Book CRUD
    getBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook,
    
    // Book generation
    generateBook,
    getGenerationStatus,
    cancelGeneration,
    
    // Genres and niches
    getGenres,
    getHotSellingGenres,
    getNiches,
    getPopularNiches,
    
    // Book suggestions
    getBookSuggestions,
    getSuggestionsByGenre,
    getSuggestionsByNiche,
    
    // Book analytics
    getBookAnalytics,
    getBooksAnalytics,
    
    // Book publishing
    publishBook,
    unpublishBook,
    
    // Book export
    exportBook,
    
    // Book templates
    getBookTemplates,
    getBookTemplate,
    
    // Book prompts
    getBookPrompts,
    getBookPrompt,
    createBookPrompt,
    updateBookPrompt,
    deleteBookPrompt,
    
    // Utilities
    clearError,
    getStatusLabel: BookService.getStatusLabel,
    getStatusColor: BookService.getStatusColor,
    getDifficultyLabel: BookService.getDifficultyLabel,
    getDifficultyColor: BookService.getDifficultyColor,
    getCompetitionLevelLabel: BookService.getCompetitionLevelLabel,
    getCompetitionLevelColor: BookService.getCompetitionLevelColor,
    getTrendDirectionIcon: BookService.getTrendDirectionIcon,
    getTrendDirectionColor: BookService.getTrendDirectionColor,
    formatCurrency: BookService.formatCurrency,
    formatNumber: BookService.formatNumber,
    formatPercentage: BookService.formatPercentage,
    formatDate: BookService.formatDate,
    formatDateTime: BookService.formatDateTime,
    calculateROAS: BookService.calculateROAS,
    calculateACOS: BookService.calculateACOS,
    calculateCTR: BookService.calculateCTR,
    calculateConversionRate: BookService.calculateConversionRate,
    isBookPublished: BookService.isBookPublished,
    isBookProcessing: BookService.isBookProcessing,
    isBookFailed: BookService.isBookFailed,
    canEditBook: BookService.canEditBook,
    canPublishBook: BookService.canPublishBook,
    canDeleteBook: BookService.canDeleteBook,
    getDefaultBookPrompt: BookService.getDefaultBookPrompt,
    validateBookPrompt: BookService.validateBookPrompt,
    getPopularGenres: BookService.getPopularGenres,
    getPopularNicheNames: BookService.getPopularNicheNames,
    getTargetAudiences: BookService.getTargetAudiences,
  };
};
