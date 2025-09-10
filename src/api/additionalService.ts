import { AxiosResponse } from 'axios';
import axios from 'axios';

// Create a separate axios instance for additional services running on port 8080
const additionalServiceClient = axios.create({
  baseURL: 'http://127.0.0.1:8080',
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
  prompt?: string;
  user_prompt?: string;
  niche?: string;
  targetAudience?: string;
  wordCount?: number;
  genre?: string;
  language?: string;
  tone?: string;
  style?: string;
  n?: number;
  metadata?: Record<string, any>;
}

export interface BookGenerationResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: number;
  book?: any;
  error?: string;
  message?: string;
}

// Bulk Operations Types
export interface BulkOperationResponse {
  message: string;
  success: boolean;
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
  bookId: string;
  file: File;
  format?: 'pdf' | 'epub' | 'mobi' | 'docx';
  metadata?: Record<string, any>;
}

export interface BulkUploadBooksRequest {
  books: Array<{
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

// Additional Service Class
export class AdditionalService {
  // Configuration Management
  static async updateConfiguration(config: ConfigurationUpdate): Promise<AxiosResponse<ConfigurationResponse>> {
    return additionalServiceClient.post('/config', config);
  }

  // Book Generation
  static async generateBook(data: BookGenerationRequest): Promise<AxiosResponse<BookGenerationResponse>> {
    return additionalServiceClient.post('/generate-book', data);
  }

  static async autoGenerateBooks(data: BookGenerationRequest): Promise<AxiosResponse<BookGenerationResponse>> {
    return additionalServiceClient.post('/auto-generate-books', data);
  }

  static async generatePendingBooks(data?: BookGenerationRequest): Promise<AxiosResponse<BookGenerationResponse>> {
    return additionalServiceClient.post('/generate-pending-books', data || {});
  }

  // Bulk Operations
  static async bulkClearAll(data: BulkClearAllRequest): Promise<AxiosResponse<BulkOperationResponse>> {
    return additionalServiceClient.post('/bulk/clear-all', data);
  }

  static async bulkResetPending(data: BulkResetPendingRequest): Promise<AxiosResponse<BulkOperationResponse>> {
    return additionalServiceClient.post('/bulk/reset-pending', data);
  }

  static async bulkGenerateKdpData(data: BulkGenerateKdpDataRequest): Promise<AxiosResponse<BulkOperationResponse>> {
    return additionalServiceClient.post('/bulk/generate-kdp-data', data);
  }

  static async getBulkUploadStatus(): Promise<AxiosResponse<UploadProgressResponse>> {
    return additionalServiceClient.get('/bulk/upload-status');
  }

  // Book Upload
  static async uploadBook(data: UploadBookRequest): Promise<AxiosResponse<BookGenerationResponse>> {
    const formData = new FormData();
    formData.append('bookId', data.bookId);
    formData.append('file', data.file);
    if (data.format) formData.append('format', data.format);
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));

    return additionalServiceClient.post('/upload-book', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  static async bulkUploadBooks(data: BulkUploadBooksRequest): Promise<AxiosResponse<BookGenerationResponse>> {
    const formData = new FormData();
    data.books.forEach((book, index) => {
      formData.append(`books[${index}][bookId]`, book.bookId);
      formData.append(`books[${index}][file]`, book.file);
      if (book.format) formData.append(`books[${index}][format]`, book.format);
      if (book.metadata) formData.append(`books[${index}][metadata]`, JSON.stringify(book.metadata));
    });

    return additionalServiceClient.post('/bulk-upload-books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  static async getUploadProgress(): Promise<AxiosResponse<UploadProgressResponse>> {
    return additionalServiceClient.get('/upload-progress');
  }

  static async retryFailedUploads(data: RetryFailedUploadsRequest): Promise<AxiosResponse<BulkOperationResponse>> {
    return additionalServiceClient.post('/retry-failed-uploads', data);
  }

  // Debug & Monitoring
  static async debugBookStatus(bookId: string): Promise<AxiosResponse<BookStatusDebugResponse>> {
    return additionalServiceClient.get(`/debug/book-status?bookId=${bookId}`);
  }

  static async getBookQueue(): Promise<AxiosResponse<BookQueueResponse>> {
    return additionalServiceClient.get('/book-queue');
  }

  static async getEnvStatus(): Promise<AxiosResponse<EnvStatusResponse>> {
    return additionalServiceClient.get('/env-status');
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
  getEnvStatus,
  formatUploadProgress,
  getUploadStatusColor,
  getQueueStatusColor,
  getQueueTypeIcon,
  formatQueueTime,
  formatSystemUptime,
  formatMemoryUsage,
  getServiceStatusColor,
  getDatabaseStatusColor,
  validateConfigurationUpdate,
  validateBulkClearAll,
  validateUploadBook,
} = AdditionalService;

export default AdditionalService;
