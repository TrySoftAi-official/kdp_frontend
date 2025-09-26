import { useState, useCallback } from 'react';
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  generateBook,
  getGenerationStatus,
  getBookSuggestions,
  getGenres,
  getNiches,
  getBookAnalytics,
  uploadBooksCSV,
  retryBookPublication,
  getBookPrompts,
  createBookPrompt,
  updateBookPrompt,
  deleteBookPrompt,
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
} from '@/apis/books';
import { getErrorMessage } from '@/apis/apiClient';
import { AxiosError } from 'axios';

interface UseBooksApiReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Books CRUD
  getBooksList: (filters?: BookFilter, sort?: BookSort, page?: number, limit?: number) => Promise<PaginatedBooksResponse | null>;
  getBookById: (bookId: string) => Promise<Book | null>;
  createNewBook: (data: Partial<Book>) => Promise<Book | null>;
  updateExistingBook: (bookId: string, data: BookUpdate) => Promise<Book | null>;
  deleteExistingBook: (bookId: string) => Promise<boolean>;
  
  // Book generation
  generateNewBook: (data: BookGenerationRequest) => Promise<BookGenerationResponse | null>;
  getGenerationStatusById: (bookId: string) => Promise<any>;
  
  // Book data
  getBookSuggestionsList: (limit?: number) => Promise<BookSuggestion[] | null>;
  getSuggestionsByGenre: (genre: string, limit?: number) => Promise<BookSuggestion[] | null>;
  getSuggestionsByNiche: (niche: string, limit?: number) => Promise<BookSuggestion[] | null>;
  
  // Genres and niches
  getGenresList: () => Promise<Genre[] | null>;
  getNichesList: (genre?: string) => Promise<Niche[] | null>;
  
  // Book analytics
  getBookAnalyticsById: (bookId: string, period?: string) => Promise<BookAnalytics[] | null>;
  
  // Book publishing
  publishBook: (bookId: string, platform?: string) => Promise<{ message: string; url?: string } | null>;
  unpublishBook: (bookId: string) => Promise<boolean>;
  
  // Book export
  exportBook: (bookId: string, format: 'pdf' | 'epub' | 'mobi' | 'docx') => Promise<Blob | null>;
  
  // Book templates
  getBookTemplates: () => Promise<any[] | null>;
  getBookTemplate: (templateId: string) => Promise<any | null>;
  
  // Book prompts
  getBookPromptsList: (page?: number, limit?: number) => Promise<{ prompts: BookPrompt[]; total: number; page: number; limit: number; totalPages: number } | null>;
  getBookPromptById: (promptId: string) => Promise<BookPrompt | null>;
  createNewBookPrompt: (data: any) => Promise<BookPrompt | null>;
  updateExistingBookPrompt: (promptId: string, data: any) => Promise<BookPrompt | null>;
  deleteExistingBookPrompt: (promptId: string) => Promise<boolean>;
  
  // Utilities
  clearError: () => void;
  getStatusLabel: (status: Book['status']) => string;
  getStatusColor: (status: Book['status']) => string;
  formatDate: (dateString: string) => string;
  formatFileSize: (bytes: number) => string;
  getBookTypeLabel: (type: string) => string;
  getBookTypeColor: (type: string) => string;
}

export const useBooksApi = (): UseBooksApiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Books CRUD functions
  const getBooksList = useCallback(async (filters?: BookFilter, sort?: BookSort, page: number = 1, limit: number = 10): Promise<PaginatedBooksResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getBooks(filters, sort, page, limit);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBookById = useCallback(async (bookId: string): Promise<Book | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getBook(bookId);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewBook = useCallback(async (data: Partial<Book>): Promise<Book | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await createBook(data);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateExistingBook = useCallback(async (bookId: string, data: BookUpdate): Promise<Book | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await updateBook(bookId, data);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteExistingBook = useCallback(async (bookId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteBook(bookId);
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Book generation functions
  const generateNewBook = useCallback(async (data: BookGenerationRequest): Promise<BookGenerationResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await generateBook(data);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGenerationStatusById = useCallback(async (bookId: string): Promise<any> => {
    try {
      const response = await getGenerationStatus(bookId);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  // Book data functions
  const getBookSuggestionsList = useCallback(async (limit: number = 10): Promise<BookSuggestion[] | null> => {
    try {
      const response = await getBookSuggestions(limit);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  const getSuggestionsByGenre = useCallback(async (genre: string, limit: number = 10): Promise<BookSuggestion[] | null> => {
    try {
      const response = await getBookSuggestions(limit, genre);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  const getSuggestionsByNiche = useCallback(async (niche: string, limit: number = 10): Promise<BookSuggestion[] | null> => {
    try {
      const response = await getBookSuggestions(limit, undefined, niche);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  // Genres and niches functions
  const getGenresList = useCallback(async (): Promise<Genre[] | null> => {
    try {
      const response = await getGenres();
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  const getNichesList = useCallback(async (genre?: string): Promise<Niche[] | null> => {
    try {
      const response = await getNiches(genre);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  // Book analytics functions
  const getBookAnalyticsById = useCallback(async (bookId: string, period: string = '30d'): Promise<BookAnalytics[] | null> => {
    try {
      const response = await getBookAnalytics(bookId, period);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  // Book publishing functions (placeholder implementations)
  const publishBook = useCallback(async (bookId: string, platform: string = 'kdp'): Promise<{ message: string; url?: string } | null> => {
    try {
      // TODO: Implement book publishing API
      return { message: 'Book published successfully' };
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  const unpublishBook = useCallback(async (bookId: string): Promise<boolean> => {
    try {
      // TODO: Implement book unpublishing API
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return false;
    }
  }, []);

  // Book export functions (placeholder implementations)
  const exportBook = useCallback(async (bookId: string, format: 'pdf' | 'epub' | 'mobi' | 'docx'): Promise<Blob | null> => {
    try {
      // TODO: Implement book export API
      return null;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  // Book templates functions (placeholder implementations)
  const getBookTemplates = useCallback(async (): Promise<any[] | null> => {
    try {
      // TODO: Implement book templates API
      return [];
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  const getBookTemplate = useCallback(async (templateId: string): Promise<any | null> => {
    try {
      // TODO: Implement book template API
      return null;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  // Book prompts functions
  const getBookPromptsList = useCallback(async (page: number = 1, limit: number = 10): Promise<{ prompts: BookPrompt[]; total: number; page: number; limit: number; totalPages: number } | null> => {
    try {
      const response = await getBookPrompts(page, limit);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  const getBookPromptById = useCallback(async (promptId: string): Promise<BookPrompt | null> => {
    try {
      // TODO: Implement get single book prompt API
      return null;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  const createNewBookPrompt = useCallback(async (data: any): Promise<BookPrompt | null> => {
    try {
      const response = await createBookPrompt(data);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  const updateExistingBookPrompt = useCallback(async (promptId: string, data: any): Promise<BookPrompt | null> => {
    try {
      const response = await updateBookPrompt(promptId, data);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  const deleteExistingBookPrompt = useCallback(async (promptId: string): Promise<boolean> => {
    try {
      await deleteBookPrompt(promptId);
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return false;
    }
  }, []);

  // Utility functions
  const getStatusLabel = useCallback((status: Book['status']): string => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'generating': return 'Generating';
      case 'completed': return 'Completed';
      case 'published': return 'Published';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  }, []);

  const getStatusColor = useCallback((status: Book['status']): string => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'generating': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'published': return 'text-purple-600 bg-purple-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getBookTypeLabel = useCallback((type: string): string => {
    switch (type) {
      case 'fiction': return 'Fiction';
      case 'non-fiction': return 'Non-Fiction';
      case 'children': return 'Children\'s Book';
      case 'textbook': return 'Textbook';
      default: return type;
    }
  }, []);

  const getBookTypeColor = useCallback((type: string): string => {
    switch (type) {
      case 'fiction': return 'text-blue-600 bg-blue-100';
      case 'non-fiction': return 'text-green-600 bg-green-100';
      case 'children': return 'text-yellow-600 bg-yellow-100';
      case 'textbook': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // Books CRUD
    getBooksList,
    getBookById,
    createNewBook,
    updateExistingBook,
    deleteExistingBook,
    
    // Book generation
    generateNewBook,
    getGenerationStatusById,
    
    // Book data
    getBookSuggestionsList,
    getSuggestionsByGenre,
    getSuggestionsByNiche,
    
    // Genres and niches
    getGenresList,
    getNichesList,
    
    // Book analytics
    getBookAnalyticsById,
    
    // Book publishing
    publishBook,
    unpublishBook,
    
    // Book export
    exportBook,
    
    // Book templates
    getBookTemplates,
    getBookTemplate,
    
    // Book prompts
    getBookPromptsList,
    getBookPromptById,
    createNewBookPrompt,
    updateExistingBookPrompt,
    deleteExistingBookPrompt,
    
    // Utilities
    clearError,
    getStatusLabel,
    getStatusColor,
    formatDate,
    formatFileSize,
    getBookTypeLabel,
    getBookTypeColor,
  };
};