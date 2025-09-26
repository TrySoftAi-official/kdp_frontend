import apiClient, { getErrorMessage, requireAuth } from './apiClient';

// Types
export interface Book {
  id: string;
  title: string;
  status: 'published' | 'processing' | 'failed';
  revenue: number;
  adSpend: number;
  roas: number;
  acos: number;
  kenp: number;
  country: string;
  date: string;
  author: string;
  genre: string;
  publishedAt?: string;
  lastUpdated: string;
}

export interface BookPrompt {
  id: string;
  title: string;
  description: string;
  genre: string;
  target_audience: string;
  word_count: number;
  created_at: string;
}

export interface BookGenerationRequest {
  title: string;
  genre: string;
  target_audience: string;
  word_count: number;
  style: string;
  tone: string;
  additional_requirements?: string;
}

export interface BookGenerationResponse {
  book_id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  estimated_completion?: string;
  generated_content?: string;
  error_message?: string;
}

export interface GenerationStep {
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface BookSuggestion {
  id: string;
  title: string;
  genre: string;
  description: string;
  market_demand: number;
  competition_level: 'low' | 'medium' | 'high';
  estimated_revenue: number;
  keywords: string[];
}

export interface Genre {
  id: string;
  name: string;
  description: string;
  popularity_score: number;
  average_revenue: number;
  book_count: number;
}

export interface Niche {
  id: string;
  name: string;
  genre: string;
  description: string;
  market_size: number;
  competition_level: 'low' | 'medium' | 'high';
  growth_potential: number;
  keywords: string[];
}

export interface BookAnalytics {
  book_id: string;
  views: number;
  downloads: number;
  revenue: number;
  ad_spend: number;
  roas: number;
  acos: number;
  kenp: number;
  period_start: string;
  period_end: string;
}

export interface BookUpdate {
  title?: string;
  description?: string;
  genre?: string;
  target_audience?: string;
  word_count?: number;
  style?: string;
  tone?: string;
}

export interface BookFilter {
  status?: string;
  genre?: string;
  author?: string;
  date_from?: string;
  date_to?: string;
  revenue_min?: number;
  revenue_max?: number;
  search?: string;
}

export interface BookSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginatedBooksResponse {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// API Functions
export async function getBooks(filters?: BookFilter, sort?: BookSort, page: number = 1, limit: number = 10): Promise<PaginatedBooksResponse> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('📚 [getBooks] Fetching books');
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    if (sort) {
      params.append('sort_field', sort.field);
      params.append('sort_direction', sort.direction);
    }
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const { data } = await apiClient.get(`/books?${params.toString()}`);
    console.log('✅ [getBooks] Books fetched successfully:', data.books?.length || 0);
    return data;
  } catch (error: any) {
    console.error('❌ [getBooks] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getBook(bookId: string): Promise<Book> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('📖 [getBook] Fetching book:', bookId);
    const { data } = await apiClient.get(`/books/${bookId}`);
    console.log('✅ [getBook] Book fetched successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getBook] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function createBook(request: Partial<Book>): Promise<Book> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('📝 [createBook] Creating book');
    const { data } = await apiClient.post('/books', request);
    console.log('✅ [createBook] Book created successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [createBook] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function updateBook(bookId: string, request: BookUpdate): Promise<Book> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('✏️ [updateBook] Updating book:', bookId);
    const { data } = await apiClient.put(`/books/${bookId}`, request);
    console.log('✅ [updateBook] Book updated successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [updateBook] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteBook(bookId: string): Promise<{ message: string }> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('🗑️ [deleteBook] Deleting book:', bookId);
    const { data } = await apiClient.delete(`/books/${bookId}`);
    console.log('✅ [deleteBook] Book deleted successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [deleteBook] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function generateBook(request: BookGenerationRequest): Promise<BookGenerationResponse> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('🤖 [generateBook] Generating book');
    const { data } = await apiClient.post('/books/generate', request);
    console.log('✅ [generateBook] Book generation started successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [generateBook] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getGenerationStatus(bookId: string): Promise<{ status: string; progress: number; steps: GenerationStep[] }> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('📊 [getGenerationStatus] Fetching generation status:', bookId);
    const { data } = await apiClient.get(`/books/${bookId}/generation-status`);
    console.log('✅ [getGenerationStatus] Generation status fetched successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getGenerationStatus] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getBookSuggestions(genre?: string, limit: number = 10): Promise<BookSuggestion[]> {
  try {
    console.log('💡 [getBookSuggestions] Fetching book suggestions');
    const params = new URLSearchParams();
    if (genre) params.append('genre', genre);
    params.append('limit', limit.toString());
    
    const { data } = await apiClient.get(`/books/suggestions?${params.toString()}`);
    console.log('✅ [getBookSuggestions] Suggestions fetched successfully:', data.length);
    return data;
  } catch (error: any) {
    console.error('❌ [getBookSuggestions] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getGenres(): Promise<Genre[]> {
  try {
    console.log('📚 [getGenres] Fetching genres');
    const { data } = await apiClient.get('/books/genres');
    console.log('✅ [getGenres] Genres fetched successfully:', data.length);
    return data;
  } catch (error: any) {
    console.error('❌ [getGenres] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getNiches(genre?: string): Promise<Niche[]> {
  try {
    console.log('🎯 [getNiches] Fetching niches');
    const params = new URLSearchParams();
    if (genre) params.append('genre', genre);
    
    const { data } = await apiClient.get(`/books/niches?${params.toString()}`);
    console.log('✅ [getNiches] Niches fetched successfully:', data.length);
    return data;
  } catch (error: any) {
    console.error('❌ [getNiches] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getBookAnalytics(bookId: string, period: string = '30d'): Promise<BookAnalytics> {
  try {
    console.log('📈 [getBookAnalytics] Fetching book analytics:', bookId);
    const { data } = await apiClient.get(`/books/${bookId}/analytics?period=${period}`);
    console.log('✅ [getBookAnalytics] Analytics fetched successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getBookAnalytics] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function uploadBooksCSV(file: File): Promise<{ processed: number; failed: number; errors: string[] }> {
  try {
    console.log('📤 [uploadBooksCSV] Uploading books CSV');
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await apiClient.post('/books/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('✅ [uploadBooksCSV] CSV uploaded successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [uploadBooksCSV] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function retryBookPublication(bookId: string): Promise<Book> {
  try {
    console.log('🔄 [retryBookPublication] Retrying book publication:', bookId);
    const { data } = await apiClient.post(`/books/${bookId}/retry-publication`);
    console.log('✅ [retryBookPublication] Publication retry initiated successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [retryBookPublication] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getBookPrompts(): Promise<BookPrompt[]> {
  try {
    console.log('📝 [getBookPrompts] Fetching book prompts');
    const { data } = await apiClient.get('/books/prompts');
    console.log('✅ [getBookPrompts] Prompts fetched successfully:', data.length);
    return data;
  } catch (error: any) {
    console.error('❌ [getBookPrompts] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function createBookPrompt(request: Partial<BookPrompt>): Promise<BookPrompt> {
  try {
    console.log('📝 [createBookPrompt] Creating book prompt');
    const { data } = await apiClient.post('/books/prompts', request);
    console.log('✅ [createBookPrompt] Prompt created successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [createBookPrompt] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function updateBookPrompt(promptId: string, request: Partial<BookPrompt>): Promise<BookPrompt> {
  try {
    console.log('✏️ [updateBookPrompt] Updating book prompt:', promptId);
    const { data } = await apiClient.put(`/books/prompts/${promptId}`, request);
    console.log('✅ [updateBookPrompt] Prompt updated successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [updateBookPrompt] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteBookPrompt(promptId: string): Promise<{ message: string }> {
  try {
    console.log('🗑️ [deleteBookPrompt] Deleting book prompt:', promptId);
    const { data } = await apiClient.delete(`/books/prompts/${promptId}`);
    console.log('✅ [deleteBookPrompt] Prompt deleted successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [deleteBookPrompt] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}
