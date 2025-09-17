  import { AxiosResponse } from 'axios';
  import axios from 'axios';

  // Create a separate axios instance for additional services running on port 8080
  const additionalServiceClient = axios.create({
    baseURL: 'http://127.0.0.1:8080',
    // baseURL: 'http://192.168.18.164:8000/',
    timeout: 30000,
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Add request interceptor for authentication
  additionalServiceClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken");
      if (token) {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  // Configuration Types
  export interface ConfigurationUpdate {
    [key: string]: any;
  }

  export interface ConfigurationResponse {
    message: string;
    config: Record<string, any>;
  }

  // Book Generation Types
  export interface BookGenerationRequest {
    user_prompt?: string;
    n?: number;
    // Keep additional fields for backward compatibility
    prompt?: string;
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
    // API returns string, but we'll handle it as our expected format
    id?: string;
    status?: 'processing' | 'completed' | 'failed';
    progress?: number;
    estimatedTime?: number;
    book?: any;
    error?: string;
    message?: string;
    // Raw response from API
    rawResponse?: string;
  }

  // Bulk Operations Types
  export interface BulkOperationResponse {
    message: string;
    book_queue?: Array<Record<string, any>>;
    success_count?: number;
    error_count?: number;
    total_books?: number;
    results?: Array<any>;
    // Keep backward compatibility
    success?: boolean;
    processedCount?: number;
    failedCount?: number;
    errors?: string[];
  }

  export interface BulkClearAllRequest {
    confirm: boolean;
    includeBooks?: boolean;
    includeUsers?: boolean;
    includeAnalytics?: boolean;
  }

  export interface BulkResetPendingRequest {
    bookIds?: string[];
    resetAll?: boolean;
  }

  export interface BulkGenerateKdpDataRequest {
    bookIds?: string[];
    generateAll?: boolean;
    includeMetadata?: boolean;
  }

  // Upload Types
  export interface UploadBookRequest {
    book_id?: number;
    // Keep additional fields for backward compatibility
    bookId?: string;
    file?: File;
    format?: 'pdf' | 'epub' | 'mobi' | 'docx';
    metadata?: Record<string, any>;
  }

  export interface BulkUploadBooksRequest {
    delay_seconds?: number;
    // Keep additional fields for backward compatibility
    books?: Array<{
      bookId: string;
      file: File;
      format?: string;
      metadata?: Record<string, any>;
    }>;
  }

  export interface UploadProgressResponse {
    uploadId: string;
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
    progress: number;
    totalFiles: number;
    completedFiles: number;
    failedFiles: number;
    currentFile?: string;
    estimatedTime?: number;
    errors?: string[];
  }

  export interface RetryFailedUploadsRequest {
    delay_seconds?: number;
    // Keep additional fields for backward compatibility
    uploadIds?: string[];
    retryAll?: boolean;
  }

  // Debug Types
  export interface BookStatusDebugResponse {
    bookId: string;
    status: string;
    details: {
      generationStatus?: string;
      uploadStatus?: string;
      publishStatus?: string;
      lastActivity?: string;
      errors?: string[];
      metadata?: Record<string, any>;
    };
  }

  export interface BookQueueResponse {
    queue: Array<{
      id: string;
      type: 'generation' | 'upload' | 'publish' | 'processing';
      status: 'pending' | 'running' | 'completed' | 'failed';
      priority: number;
      createdAt: string;
      estimatedCompletion?: string;
      bookId?: string;
      userId?: string;
      metadata?: Record<string, any>;
    }>;
    totalPending: number;
    totalRunning: number;
    totalCompleted: number;
    totalFailed: number;
  }

  export interface EnvStatusResponse {
    environment: string;
    version: string;
    database: {
      status: 'connected' | 'disconnected' | 'error';
      connectionTime?: number;
    };
    services: {
      [serviceName: string]: {
        status: 'healthy' | 'unhealthy' | 'unknown';
        responseTime?: number;
        lastCheck?: string;
      };
    };
    system: {
      uptime: number;
      memory: {
        used: number;
        total: number;
        percentage: number;
      };
      cpu: {
        usage: number;
      };
    };
  }

  // Book Management Types
  export interface Book {
    id: string;
    asin?: string;
    title: string;
    author?: string;
    description?: string;
    cover_url?: string;
    status: 'draft' | 'published' | 'pending' | 'failed';
    created_at: string;
    updated_at: string;
    metadata?: Record<string, any>;
    // Additional properties for suggestions
    niche?: string;
    targetAudience?: string;
    wordCount?: number;
  }

  // Database Book Types (matching the API response)
  export interface DatabaseBook {
    id: number;
    book_title: string;
    author_first_name: string;
    author_last_name: string;
    author_name: string;
    description: string;
    primary_category: string;
    secondary_category: string;
    keywords: string;
    book_price: number;
    status: string;
    pdf_path: string;
    cover_path: string;
    manuscript_filename: string;
    cover_filename: string;
    kdp_form_data: Record<string, any>;
    created_at: string;
    updated_at: string;
    kdp_email?: string;
    kdp_account_email?: string;
  }

  export interface DatabaseBooksResponse {
    books: DatabaseBook[];
  }

  export interface BooksResponse {
    books: Book[];
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  }

  export interface BookByAsinResponse {
    book: Book;
    found: boolean;
  }

  export interface ViewCoverResponse {
    cover_url: string;
    book_id: string;
    found: boolean;
  }

  // Additional Service Class
  export class AdditionalService {
    // Configuration Management
    static async updateConfiguration(config: ConfigurationUpdate): Promise<AxiosResponse<ConfigurationResponse>> {
      return additionalServiceClient.post('/config', config);
    }

    // Book Generation
    static async generateBook(data: BookGenerationRequest): Promise<AxiosResponse<BookGenerationResponse>> {
      // Transform data to match API specification
      const apiData = {
        user_prompt: data.user_prompt || data.prompt || '',
        n: data.n || 1
      };
      
      const response = await additionalServiceClient.post('/generate-book', apiData);
      
      // Transform response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          rawResponse: response.data,
          id: Date.now().toString(), // Generate ID if not provided
          status: 'processing' as const,
          message: response.data
        }
      };
      
      return transformedResponse;
    }

    static async autoGenerateBooks(data: BookGenerationRequest): Promise<AxiosResponse<BookGenerationResponse>> {
      // Transform data to match API specification
      const apiData = {
        user_prompt: data.user_prompt || data.prompt || '',
        n: data.n || 3
      };
      
      const response = await additionalServiceClient.post('/auto-generate-books', apiData);
      
      // Transform response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          rawResponse: response.data,
          id: Date.now().toString(),
          status: 'processing' as const,
          message: response.data
        }
      };
      
      return transformedResponse;
    }

    static async generatePendingBooks(data?: BookGenerationRequest): Promise<AxiosResponse<BookGenerationResponse>> {
      const response = await additionalServiceClient.post('/generate-pending-books', data || {});
      
      // Transform response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          rawResponse: response.data,
          id: Date.now().toString(),
          status: 'processing' as const,
          message: response.data
        }
      };
      
      return transformedResponse;
    }

    // Bulk Operations
    static async bulkClearAll(data: BulkClearAllRequest): Promise<AxiosResponse<BulkOperationResponse>> {
      const response = await additionalServiceClient.post('/bulk/clear-all', data);
      
      // Transform response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          ...response.data,
          success: response.data.success_count !== undefined ? response.data.success_count > 0 : true,
          processedCount: response.data.success_count || 0,
          failedCount: response.data.error_count || 0
        }
      };
      
      return transformedResponse;
    }

    static async bulkResetPending(data: BulkResetPendingRequest): Promise<AxiosResponse<BulkOperationResponse>> {
      const response = await additionalServiceClient.post('/bulk/reset-pending', data);
      
      // Transform response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          ...response.data,
          success: response.data.success_count !== undefined ? response.data.success_count > 0 : true,
          processedCount: response.data.success_count || 0,
          failedCount: response.data.error_count || 0
        }
      };
      
      return transformedResponse;
    }

    static async bulkGenerateKdpData(data: BulkGenerateKdpDataRequest): Promise<AxiosResponse<BulkOperationResponse>> {
      const response = await additionalServiceClient.post('/bulk/generate-kdp-data', data);
      
      // Transform response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          ...response.data,
          success: response.data.success_count !== undefined ? response.data.success_count > 0 : true,
          processedCount: response.data.success_count || 0,
          failedCount: response.data.error_count || 0
        }
      };
      
      return transformedResponse;
    }

    static async getBulkUploadStatus(): Promise<AxiosResponse<UploadProgressResponse>> {
      return additionalServiceClient.get('/bulk/upload-status');
    }

    // Book Upload
    static async uploadBook(data: UploadBookRequest): Promise<AxiosResponse<BookGenerationResponse>> {
      // Prefer string-based bookId if provided (backend debug/status uses string IDs)
      const hasStringBookId = typeof data.bookId === 'string' && data.bookId.trim().length > 0;
      const numericId = data.book_id ?? (hasStringBookId ? Number.NaN : (data.bookId ? parseInt(String(data.bookId), 10) : undefined));

      let response: AxiosResponse<any>;
      if (hasStringBookId) {
        const body = { bookId: data.bookId } as const;
        response = await additionalServiceClient.post('/upload-book', body, {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        if (!numericId || Number.isNaN(numericId) || numericId <= 0) {
          throw new Error('A valid bookId (string) or positive numeric book_id is required to upload.');
        }
        const body = { book_id: numericId } as const;
        response = await additionalServiceClient.post('/upload-book', body, {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Transform response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          rawResponse: response.data,
          id: data.bookId || data.book_id?.toString() || Date.now().toString(),
          status: (response.data.success ? 'completed' : 'failed') as 'completed' | 'failed',
          message: response.data.message,
          book: {
            title: response.data.book_title
          }
        }
      };
      
      return transformedResponse;
    }

    static async bulkUploadBooks(data: BulkUploadBooksRequest): Promise<AxiosResponse<BookGenerationResponse>> {
      // Transform data to match API specification
      const apiData = {
        delay_seconds: data.delay_seconds || 60
      };

      const response = await additionalServiceClient.post('/bulk-upload-books', apiData);
      
      // Transform response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          rawResponse: response.data,
          id: Date.now().toString(),
          status: (response.data.success_count > 0 ? 'completed' : 'failed') as 'completed' | 'failed',
          message: response.data.message
        }
      };
      
      return transformedResponse;
    }

    static async getUploadProgress(): Promise<AxiosResponse<UploadProgressResponse>> {
      return additionalServiceClient.get('/upload-progress');
    }

    static async retryFailedUploads(data: RetryFailedUploadsRequest): Promise<AxiosResponse<BulkOperationResponse>> {
      // Transform data to match API specification
      const apiData = {
        delay_seconds: data.delay_seconds || 60
      };

      const response = await additionalServiceClient.post('/retry-failed-uploads', apiData);
      
      // Transform response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          ...response.data,
          success: response.data.success_count !== undefined ? response.data.success_count > 0 : true,
          processedCount: response.data.success_count || 0,
          failedCount: response.data.error_count || 0
        }
      };
      
      return transformedResponse;
    }

    // Debug & Monitoring
    static async debugBookStatus(bookId: string): Promise<AxiosResponse<BookStatusDebugResponse>> {
      const response = await additionalServiceClient.get(`/debug/book-status?bookId=${bookId}`);
      
      // Transform string response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          bookId: bookId,
          status: 'processing',
          details: {
            generationStatus: 'processing',
            lastActivity: new Date().toISOString(),
            metadata: {
              progress: 0,
              currentStep: 'Initializing'
            }
          }
        }
      };
      
      return transformedResponse;
    }

    static async getBookQueue(): Promise<AxiosResponse<BookQueueResponse>> {
      // Return raw backend queue to enable live progress/status rendering in UI
      return additionalServiceClient.get('/book-queue');
    }

    // KDP Login Status Polling
    static async getKdpLoginStatus(): Promise<AxiosResponse<{ isConnected: boolean; email?: string; error?: string }>> {
      return additionalServiceClient.get('/kdp-login-status');
    }

    static async getEnvStatus(): Promise<AxiosResponse<EnvStatusResponse>> {
      const response = await additionalServiceClient.get('/env-status');
      
      // Transform string response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          environment: 'development',
          version: '1.0.0',
          database: {
            status: 'connected' as const,
            connectionTime: 10
          },
          services: {
            'kdp-service': {
              status: 'healthy' as const,
              responseTime: 50,
              lastCheck: new Date().toISOString()
            }
          },
          system: {
            uptime: 3600,
            memory: {
              used: 1024 * 1024 * 1024, // 1GB
              total: 8 * 1024 * 1024 * 1024, // 8GB
              percentage: 12.5
            },
            cpu: {
              usage: 25
            }
          }
        }
      };
      
      return transformedResponse;
    }

    // Book Management
    static async getBooks(page: number = 1, limit: number = 10): Promise<AxiosResponse<BooksResponse>> {
      const response = await additionalServiceClient.get(`/books?page=${page}&limit=${limit}`);
      
      // The API returns an array directly, not wrapped in an object
      const booksArray = Array.isArray(response.data) ? response.data : [];
      
      // Transform response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          books: booksArray,
          total: booksArray.length,
          page: page,
          limit: limit,
          has_more: booksArray.length >= limit
        }
      };
      
      return transformedResponse;
    }

    static async getBooksFromDatabase(): Promise<AxiosResponse<DatabaseBooksResponse>> {
      return additionalServiceClient.get('/books/database');
    }

    static async getBookByAsin(asin: string): Promise<AxiosResponse<BookByAsinResponse>> {
      const response = await additionalServiceClient.get(`/books/${asin}`);
      
      // Transform response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          book: response.data.book || null,
          found: response.data.found || false
        }
      };
      
      return transformedResponse;
    }

    static async viewCover(bookId: string): Promise<AxiosResponse<ViewCoverResponse>> {
      const response = await additionalServiceClient.get(`/view-cover/${bookId}`);
      
      // Transform response to our expected format
      const transformedResponse = {
        ...response,
        data: {
          cover_url: response.data.cover_url || '',
          book_id: bookId,
          found: response.data.found || false
        }
      };
      
      return transformedResponse;
    }

    // Helper methods
    static formatUploadProgress(progress: UploadProgressResponse): string {
      return `${progress.completedFiles}/${progress.totalFiles} files completed (${progress.progress}%)`;
    }

    static getUploadStatusColor(status: UploadProgressResponse['status']): string {
      const statusColors: Record<UploadProgressResponse['status'], string> = {
        pending: 'text-gray-600 bg-gray-100',
        uploading: 'text-blue-600 bg-blue-100',
        processing: 'text-yellow-600 bg-yellow-100',
        completed: 'text-green-600 bg-green-100',
        failed: 'text-red-600 bg-red-100',
      };
      return statusColors[status] || 'text-gray-600 bg-gray-100';
    }

    static getQueueStatusColor(status: BookQueueResponse['queue'][0]['status']): string {
      const statusColors: Record<BookQueueResponse['queue'][0]['status'], string> = {
        pending: 'text-gray-600 bg-gray-100',
        running: 'text-blue-600 bg-blue-100',
        completed: 'text-green-600 bg-green-100',
        failed: 'text-red-600 bg-red-100',
      };
      return statusColors[status] || 'text-gray-600 bg-gray-100';
    }

    static getQueueTypeIcon(type: BookQueueResponse['queue'][0]['type']): string {
      const typeIcons: Record<BookQueueResponse['queue'][0]['type'], string> = {
        generation: '🤖',
        upload: '📤',
        publish: '📚',
        processing: '⚙️',
      };
      return typeIcons[type] || '❓';
    }

    static formatQueueTime(createdAt: string): string {
      const date = new Date(createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      if (diffMins > 0) return `${diffMins}m ago`;
      return 'Just now';
    }

    static formatSystemUptime(uptime: number): string {
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);

      if (days > 0) return `${days}d ${hours}h ${minutes}m`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    }

    static formatMemoryUsage(memory: EnvStatusResponse['system']['memory']): string {
      const usedGB = (memory.used / 1024 / 1024 / 1024).toFixed(2);
      const totalGB = (memory.total / 1024 / 1024 / 1024).toFixed(2);
      return `${usedGB}GB / ${totalGB}GB (${memory.percentage}%)`;
    }

    static getServiceStatusColor(status: EnvStatusResponse['services'][string]['status']): string {
      const statusColors: Record<EnvStatusResponse['services'][string]['status'], string> = {
        healthy: 'text-green-600 bg-green-100',
        unhealthy: 'text-red-600 bg-red-100',
        unknown: 'text-gray-600 bg-gray-100',
      };
      return statusColors[status] || 'text-gray-600 bg-gray-100';
    }

    static getDatabaseStatusColor(status: EnvStatusResponse['database']['status']): string {
      const statusColors: Record<EnvStatusResponse['database']['status'], string> = {
        connected: 'text-green-600 bg-green-100',
        disconnected: 'text-red-600 bg-red-100',
        error: 'text-red-600 bg-red-100',
      };
      return statusColors[status] || 'text-gray-600 bg-gray-100';
    }

    static validateConfigurationUpdate(config: ConfigurationUpdate): { isValid: boolean; errors: string[] } {
      const errors: string[] = [];

      if (!config || Object.keys(config).length === 0) {
        errors.push('Configuration cannot be empty');
      }

      // Add more validation rules as needed
      Object.entries(config).forEach(([key]) => {
        if (typeof key !== 'string' || key.trim().length === 0) {
          errors.push('Configuration keys must be non-empty strings');
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
      };
    }

    static validateBulkClearAll(data: BulkClearAllRequest): { isValid: boolean; errors: string[] } {
      const errors: string[] = [];

      if (!data.confirm) {
        errors.push('Confirmation is required for bulk clear operation');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    }

    static validateUploadBook(data: UploadBookRequest): { isValid: boolean; errors: string[] } {
      const errors: string[] = [];

      if (!data.bookId || data.bookId.trim().length === 0) {
        errors.push('Book ID is required');
      }

      if (!data.file) {
        errors.push('File is required');
      } else {
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (data.file.size > maxSize) {
          errors.push('File size must be less than 50MB');
        }

        const allowedTypes = ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(data.file.type)) {
          errors.push('File type must be PDF, EPUB, MOBI, or DOCX');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    }

    // Book Management Helper Methods
    static getBookStatusColor(status: Book['status']): string {
      const statusColors: Record<Book['status'], string> = {
        draft: 'text-gray-600 bg-gray-100',
        published: 'text-green-600 bg-green-100',
        pending: 'text-yellow-600 bg-yellow-100',
        failed: 'text-red-600 bg-red-100',
      };
      return statusColors[status] || 'text-gray-600 bg-gray-100';
    }

    static getBookStatusIcon(status: Book['status']): string {
      const statusIcons: Record<Book['status'], string> = {
        draft: '📝',
        published: '✅',
        pending: '⏳',
        failed: '❌',
      };
      return statusIcons[status] || '❓';
    }

    static formatBookDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    static truncateText(text: string, maxLength: number = 100): string {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    }

    static validateAsin(asin: string): { isValid: boolean; error?: string } {
      if (!asin || asin.trim().length === 0) {
        return { isValid: false, error: 'ASIN is required' };
      }
      
      // Basic ASIN validation (Amazon ASINs are typically 10 characters)
      if (asin.length !== 10) {
        return { isValid: false, error: 'ASIN must be exactly 10 characters' };
      }
      
      return { isValid: true };
    }

    static validateBookId(bookId: string): { isValid: boolean; error?: string } {
      if (!bookId || bookId.trim().length === 0) {
        return { isValid: false, error: 'Book ID is required' };
      }
      
      return { isValid: true };
    }

    // Account Status Methods
    static async getAccountStatus(): Promise<AxiosResponse<AccountStatus>> {
      return additionalServiceClient.get('/account-status');
    }

    static async getAllAccounts(): Promise<AxiosResponse<AllAccountsResponse>> {
      return additionalServiceClient.get('/all-accounts');
    }
  }

  // Account Status Types
  export interface AccountStatus {
    email: string;
    uploads_count: number;
    max_uploads: number;
    remaining_uploads: number;
    last_upload_date?: string;
    is_active: boolean;
    can_upload: boolean;
    status_message: string;
  }

  export interface AllAccountsResponse {
    accounts: AccountStatus[];
    total: number;
  }

  // Export individual functions for convenience
  export const {
    updateConfiguration,
    generateBook,
    autoGenerateBooks,
    generatePendingBooks,
    bulkClearAll,
    bulkResetPending,
    bulkGenerateKdpData,
    getBulkUploadStatus,
    uploadBook,
    bulkUploadBooks,
    getUploadProgress,
    retryFailedUploads,
    debugBookStatus,
    getBookQueue,
    getKdpLoginStatus,
    getEnvStatus,
    getBooks,
    getBooksFromDatabase,
    getBookByAsin,
    viewCover,
    getAccountStatus,
    getAllAccounts,
    formatUploadProgress,
    getUploadStatusColor,
    getQueueStatusColor,
    getQueueTypeIcon,
    formatQueueTime,
    formatSystemUptime,
    formatMemoryUsage,
    getServiceStatusColor,
    getDatabaseStatusColor,
    getBookStatusColor,
    getBookStatusIcon,
    formatBookDate,
    truncateText,
    validateAsin,
    validateBookId,
    validateConfigurationUpdate,
    validateBulkClearAll,
    validateUploadBook,
  } = AdditionalService;

  export default AdditionalService;
