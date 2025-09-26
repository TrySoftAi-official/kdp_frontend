import { additionalServiceClient } from './client';
import { AxiosResponse } from 'axios';

// Additional Service Types
export interface ConfigurationUpdate {
  key: string;
  value: any;
  description?: string;
}

// Book Generation Types
export interface BookDataPreview {
  title: string;
  word_count: number;
  chapters: number;
  genre: string;
  book_content: string;
}

export interface BookQueueItem {
  title: string;
  word_count: number;
  chapters: number;
  genre: string;
  main_topic: string;
  writing_style: string;
  tone: string;
  target_audience: string;
  special_instructions: string;
  status: string;
  content: string;
  cover_url: string;
  cover_path: string;
  txt_path: string;
  pdf_path: string;
  proofread_report: string;
  kdp_form_data: object;
  stats: object;
  author_name: string | null;
  price: number | null;
  pricing_explanation: string | null;
  preview_cover_path: string | null;
}

export type BookData = BookDataPreview | BookQueueItem;

export interface GenerateBookResponse {
  message: string;
  rows: number;
  columns: string[];
  data_preview: BookDataPreview[];
  book_queue: BookQueueItem[];
}

// Dashboard-related types
export interface AccountStatus {
  id?: string;
  name?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'suspended';
  lastSync?: string;
  lastConnected?: string;
  booksCount?: number;
  totalRevenue?: number;
  isConnected?: boolean;
  is_active?: boolean;
  can_upload?: boolean;
  uploads_count?: number;
  max_uploads?: number;
  remaining_uploads?: number;
  status_message?: string;
}

export interface RoyaltyData {
  id: number;
  bookId?: string;
  book_title: string;
  accountId?: string;
  accountName?: string;
  total_royalties_usd: number;
  ebook_royalties: number;
  print_royalties: number;
  kenp_royalties: number;
  currency?: string;
  period?: string;
  timestamp: string;
}

export interface RoyaltySummaryData {
  totalRevenue?: number;
  totalBooks?: number;
  totalAccounts?: number;
  period?: string;
  topBooks?: Array<{
    id: string;
    title: string;
    revenue: number;
  }>;
  // API response properties
  number_of_books?: string;
  total_orders?: string;
  revenue?: string;
}

export interface AllAccountsRoyaltiesResponse {
  accounts: Array<{
    email: string;
    total_books: number;
    total_royalties: number;
    last_updated: string;
  }>;
}

export interface ConfigurationResponse {
  key: string;
  value: any;
  description?: string;
  updated_at: string;
}

export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  message: string;
}

export interface BulkClearAllRequest {
  confirm: boolean;
  backup?: boolean;
}

export interface BulkResetPendingRequest {
  confirm: boolean;
  reason?: string;
}

export interface BulkGenerateKdpDataRequest {
  book_ids: string[];
  force_regenerate?: boolean;
}

export interface UploadBookRequest {
  title: string;
  author: string;
  genre: string;
  description: string;
  content: string;
  cover_image?: File;
  metadata?: Record<string, any>;
}

export interface BulkUploadBooksRequest {
  books: UploadBookRequest[];
  batch_size?: number;
}

export interface UploadProgressResponse {
  total: number;
  completed: number;
  failed: number;
  in_progress: number;
  progress_percentage: number;
  current_book?: string;
  estimated_completion?: string;
}

export interface RetryFailedUploadsRequest {
  book_ids: string[];
  max_retries?: number;
}

export interface BookStatusDebugResponse {
  book_id: string;
  status: string;
  last_updated: string;
  error_message?: string;
  retry_count: number;
  next_retry_at?: string;
  processing_steps: Array<{
    step: string;
    status: string;
    started_at: string;
    completed_at?: string;
    error?: string;
  }>;
}

export interface BookQueueResponse {
  status_counts: {
    [key: string]: number;
  };
  book_queue: Array<{
    id: number;
    title: string;
    status: string; // Backend returns string statuses
    author_name: string | null;
    price: number | null;
    genre: string;
    niche?: string;
    target_audience?: string;
    chapters: number;
    word_count: number;
    kdp_form_data_exists: boolean;
    cover_url: string;
    cover_image_url?: string;
    proofread_report: string;
    content_preview: string | null;
    description?: string;
    created_at?: string;
    stats: Record<string, any>;
    manuscript_filename: string;
    cover_filename: string;
  }>;
  current_account: {
    email: string;
    daily_uploads_count: number;
    max_daily_uploads: number;
    remaining_uploads: number;
    can_upload: boolean;
    status_message: string;
    next_reset_time: string;
  };
  total?: number;
  page?: number;
  total_pages?: number;
  limit?: number;
}

// Types aligned with new flow (non-breaking; parallel to existing ones)
export type FlowBookStatus = 'Pending' | 'Review' | 'Uploaded';

export interface FlowBook {
  id: string;
  title: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  status: FlowBookStatus;
  kdpData?: { title: string; description: string; keywords: string[] };
}

export interface FlowGenerateBookRequest { user_prompt: string; n?: number }
export interface FlowGenerateBookResponse { success: boolean; books: FlowBook[]; errors?: string[] }
export interface FlowBookQueueResponse { book_queue: FlowBook[]; processed: number; total: number }

export interface EnvStatusResponse {
  environment: string;
  database_status: string;
  redis_status: string;
  stripe_status: string;
  aws_status: string;
  last_health_check: string;
  uptime: number;
  version: string;
}

// Additional missing types from API schema
export interface BookInsightsResponse {
  total_books_analyzed: number;
  recent_books_count: number;
  historical_books_count: number;
  category_insights: {
    primary_category_distribution: Record<string, number>;
    secondary_category_distribution: Record<string, number>;
    popular_category_combinations: Record<string, number>;
    total_unique_primary_categories: number;
    total_unique_secondary_categories: number;
    most_popular_primary: [string, number];
    most_popular_secondary: [string, number];
  };
  pricing_insights: {
    total_books_with_price: number;
    average_price: number;
    median_price: number;
    min_price: number;
    max_price: number;
    price_ranges: Record<string, number>;
    category_avg_prices: Record<string, number>;
  };
  author_insights: {
    total_unique_authors: number;
    author_distribution: Record<string, number>;
    popular_first_names: Record<string, number>;
    popular_last_names: Record<string, number>;
    most_prolific_author: [string, number];
  };
  keyword_insights: {
    total_keywords_used: number;
    unique_keywords: number;
    most_popular_keywords: Record<string, number>;
    avg_keywords_per_book: number;
    keyword_count_distribution: Record<string, number>;
  };
  temporal_insights: {
    recent_books_count: number;
    historical_books_count: number;
    recent_vs_historical_ratio: number;
    generation_trend: string;
  };
  quality_insights: {
    books_with_complete_kdp_data: number;
    completion_rate: number;
    avg_title_length: number;
    avg_description_length: number;
    title_length_range: {
      min: number;
      max: number;
    };
    description_length_range: {
      min: number;
      max: number;
    };
  };
  recommendations: string[];
}

export interface BookUploadRequest {
  book_id: number;
}

export interface BulkActionResponse {
  message: string;
  book_queue: object[];
  success_count: number;
  error_count: number;
}

export interface BulkUploadRequest {
  book_ids: number[] | null;
  delay_seconds: number;
}

export interface BulkUploadResponse {
  message: string;
  total_books: number;
  success_count: number;
  error_count: number;
  results: object[];
}

export interface ConfigUpdate {
  kdp_email: string;
  kdp_password: string;
}

export interface KDPPauseRequest {
  email: string;
  book_name: string;
}

export interface KDPRequest {
  email: string;
  book_name: string;
  default_bid: number;
  daily_budget: number;
}

export interface ManageRecommendationsRequest {
  action: string;
  recommendation: string;
}

export interface PromptRequest {
  user_prompt: string;
  n: number;
}

export interface RetryBookRequest {
  book_id: number;
}

export interface RoyaltiesPerBookResponse {
  id: number;
  timestamp: string | null;
  book_title: string;
  ebook_royalties: string | null;
  print_royalties: string | null;
  kenp_royalties: string | null;
  total_royalties: string | null;
  total_royalties_usd: string | null;
  email: string;
}

export interface RoyaltiesResponse {
  id: number;
  timestamp: string | null;
  email: string;
  total_orders: string | null;
  number_of_books: string | null;
  revenue: string | null;
}

export interface UploadResponse {
  message: string;
  book_title: string;
  success: boolean;
  stdout: string | null;
  stderr: string | null;
}

// Additional Service Class
export async function getConfiguration(key: string): Promise<AxiosResponse<ConfigurationResponse>> {
  return additionalServiceClient.get(`/config/${key}`);
}

export async function updateConfiguration(data: ConfigurationUpdate): Promise<AxiosResponse<ConfigurationResponse>> {
  return additionalServiceClient.post('/config', data);
}

export async function getAllConfigurations(): Promise<AxiosResponse<ConfigurationResponse[]>> {
  return additionalServiceClient.get('/config');
}

export async function bulkClearAll(data: BulkClearAllRequest): Promise<AxiosResponse<BulkOperationResponse>> {
  return additionalServiceClient.post('/bulk/clear-all', data);
}

export async function bulkResetPending(data: BulkResetPendingRequest): Promise<AxiosResponse<BulkOperationResponse>> {
  return additionalServiceClient.post('/bulk/reset-pending', data);
}

export async function bulkGenerateKdpData(data: BulkGenerateKdpDataRequest): Promise<AxiosResponse<BulkOperationResponse>> {
  return additionalServiceClient.post('/bulk/generate-kdp-data', data);
}

export async function uploadBook(data: UploadBookRequest): Promise<AxiosResponse<{ book_id: string; status: string }>> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('author', data.author);
  formData.append('genre', data.genre);
  formData.append('description', data.description);
  formData.append('content', data.content);
  
  if (data.cover_image) {
    formData.append('cover_image', data.cover_image);
  }
  
  if (data.metadata) {
    formData.append('metadata', JSON.stringify(data.metadata));
  }
  
  return additionalServiceClient.post('/upload-book', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export async function bulkUploadBooks(data: BulkUploadBooksRequest): Promise<AxiosResponse<{ batch_id: string; status: string }>> {
  return additionalServiceClient.post('/bulk-upload-books', data);
}

export async function getUploadProgress(batchId?: string): Promise<AxiosResponse<UploadProgressResponse>> {
  const url = batchId ? `/upload-progress?batch_id=${batchId}` : '/upload-progress';
  return additionalServiceClient.get(url);
}

export async function retryFailedUploads(data: RetryFailedUploadsRequest): Promise<AxiosResponse<BulkOperationResponse>> {
  return additionalServiceClient.post('/retry-failed-uploads', data);
}

export async function getBookStatusDebug(bookId: string): Promise<AxiosResponse<BookStatusDebugResponse>> {
  return additionalServiceClient.get(`/debug/book-status?book_id=${bookId}`);
}

export async function getEnvironmentStatus(): Promise<AxiosResponse<EnvStatusResponse>> {
  return additionalServiceClient.get('/env-status');
}

export async function getAccountStatus(): Promise<AxiosResponse<AccountStatus[]>> {
  return additionalServiceClient.get('/account-status');
}

export async function getAllAccounts(): Promise<AxiosResponse<AccountStatus[]>> {
  return additionalServiceClient.get('/all-accounts');
}

export async function getUploadHistory(): Promise<AxiosResponse<any[]>> {
  return additionalServiceClient.get('/upload-history');
}

export async function startRoyaltiesProcess(): Promise<AxiosResponse<{ message: string }>> {
  return additionalServiceClient.post('/start-royalties');
}

export async function generateBook(data: { user_prompt: string; n: number }): Promise<AxiosResponse<GenerateBookResponse>> {
  return additionalServiceClient.post('/generate-book', data);
}

export async function autoGenerateBooks(data: { n: number }): Promise<AxiosResponse<GenerateBookResponse>> {
  return additionalServiceClient.post(`/auto-generate-books?n=${data.n}`, data);
}

export async function generatePendingBooks(): Promise<AxiosResponse<BulkOperationResponse>> {
  return additionalServiceClient.post('/generate-pending-books');
}



// Explicit helpers required by spec (typed wrappers)
export async function flowGenerateBook(data: FlowGenerateBookRequest) {
  return generateBook({ user_prompt: data.user_prompt, n: data.n ?? 1 });
}
export async function flowBulkGenerateKdpData(data: BulkGenerateKdpDataRequest) {
  return bulkGenerateKdpData(data);
}
export async function flowEditKdpData(bookIndex: number, data: any) {
  return editKdpData(bookIndex, data);
}
export async function flowGetBookQueue() {
  return getBookQueueStatus();
}
export async function flowUploadSingle(data: UploadBookRequest) {
  return uploadBook(data);
}
export async function flowUploadBulk(data: BulkUploadBooksRequest) {
  return bulkUploadBooks(data);
}
export async function flowAutoGenerate(n: number) {
  return autoGenerateBooks({ n });
}


export async function getBooksFromDatabase(): Promise<AxiosResponse<any[]>> {
  return additionalServiceClient.get('/books/database');
}

export async function startKdpAds(): Promise<AxiosResponse<{ message: string }>> {
  return additionalServiceClient.post('/start-kdp-ads');
}

export async function startAdsForBook(bookId: string): Promise<AxiosResponse<{ message: string }>> {
  return additionalServiceClient.post(`/start-ads/${bookId}`);
}

export async function pauseKdpAds(): Promise<AxiosResponse<{ message: string }>> {
  return additionalServiceClient.post('/pause-kdp-ads');
}

export async function pauseAdsForBook(bookId: string): Promise<AxiosResponse<{ message: string }>> {
  return additionalServiceClient.post(`/pause-ads/${bookId}`);
}

export async function restartAdsForBook(bookId: string): Promise<AxiosResponse<{ message: string }>> {
  return additionalServiceClient.post(`/restart-ads/${bookId}`);
}

export async function getUploadStatus(): Promise<AxiosResponse<{ status: string; progress: any }>> {
  return additionalServiceClient.get('/bulk/upload-status');
}

export async function viewCover(bookId: string): Promise<AxiosResponse<{ cover_url: string }>> {
  return additionalServiceClient.get(`/view-cover/${bookId}`);
}

export async function getBooks(page?: number, limit?: number): Promise<AxiosResponse<any[]>> {
  const params: Record<string, number> = {};
  if (typeof page === 'number') params.page = page;
  if (typeof limit === 'number') params.limit = limit;
  return additionalServiceClient.get('/books', Object.keys(params).length ? { params } : undefined as any);
}

export async function getBookByAsin(asin: string): Promise<AxiosResponse<any>> {
  return additionalServiceClient.get(`/books/${asin}`);
}

export async function getKdpLoginStatus(): Promise<AxiosResponse<{ logged_in: boolean; status: string }>> {
  return additionalServiceClient.get('/login-status');
}

export async function getRoyaltiesByEmail(email: string): Promise<AxiosResponse<RoyaltyData[]>> {
  return additionalServiceClient.get(`/royalties/${email}`);
}

export async function getRoyaltiesPerBookByEmail(email: string): Promise<AxiosResponse<RoyaltyData[]>> {
  return additionalServiceClient.get(`/royalties-per-book/${email}`);
}

export async function getRoyaltiesForAllAccounts(): Promise<AxiosResponse<RoyaltyData[]>> {
  return additionalServiceClient.get('/royalties-for-all-accounts');
}

export async function getAccountStatusById(accountId?: string): Promise<AxiosResponse<AccountStatus | AccountStatus[]>> {
  if (accountId) {
    const response = await getAllAccounts();
    const account = response.data.find(acc => acc.id === accountId);
    return Promise.resolve({ data: account || response.data[0] } as AxiosResponse<AccountStatus>);
  } else {
    return getAccountStatus();
  }
}

export async function getRoyalties(email?: string): Promise<AxiosResponse<RoyaltyData[]>> {
  if (email) {
    return getRoyaltiesByEmail(email);
  } else {
    return getRoyaltiesForAllAccounts();
  }
}

export async function getRoyaltiesPerBook(email?: string): Promise<AxiosResponse<RoyaltyData[]>> {
  if (email) {
    return getRoyaltiesPerBookByEmail(email);
  } else {
    return getRoyaltiesForAllAccounts();
  }
}

export async function editKdpData(bookIndex: number, data: any): Promise<AxiosResponse<BulkActionResponse>> {
  return additionalServiceClient.put(`/bulk/edit-kdp-data/${bookIndex}`, data);
}

export async function retryBook(data: RetryBookRequest): Promise<AxiosResponse<UploadResponse>> {
  return additionalServiceClient.post('/retry-book', data);
}

export async function getBookInsights(data: BookUploadRequest): Promise<AxiosResponse<BookInsightsResponse>> {
  return additionalServiceClient.post('/bulk/insights', data);
}

export async function manageRecommendations(data: ManageRecommendationsRequest): Promise<AxiosResponse<{ message: string }>> {
  return additionalServiceClient.post('/manage-recommendations', data);
}

export async function bulkUploadBooksWithDelay(data: BulkUploadRequest): Promise<AxiosResponse<BulkUploadResponse>> {
  return additionalServiceClient.post('/bulk-upload-books', data);
}

export async function updateKdpConfig(data: ConfigUpdate): Promise<AxiosResponse<{ message: string }>> {
  return additionalServiceClient.post('/config', data);
}

export async function startKdpAdsWithBudget(data: KDPRequest): Promise<AxiosResponse<{ message: string }>> {
  return additionalServiceClient.post('/start-kdp-ads', data);
}

export async function pauseKdpAdsWithEmail(data: KDPPauseRequest): Promise<AxiosResponse<{ message: string }>> {
  return additionalServiceClient.post('/pause-kdp-ads', data);
}

// Default export object for backward compatibility with existing imports
const AdditionalService = {
  getConfiguration,
  updateConfiguration,
  getAllConfigurations,
  bulkClearAll,
  bulkResetPending,
  bulkGenerateKdpData,
  uploadBook,
  bulkUploadBooks,
  getUploadProgress,
  retryFailedUploads,
  getBookStatusDebug,
  getEnvironmentStatus,
  getAccountStatus,
  getAllAccounts,
  getUploadHistory,
  startRoyaltiesProcess,
  generateBook,
  autoGenerateBooks,
  generatePendingBooks,
  getBooksFromDatabase,
  startKdpAds,
  startAdsForBook,
  pauseKdpAds,
  pauseAdsForBook,
  restartAdsForBook,
  getUploadStatus,
  viewCover,
  getBooks,
  getBookByAsin,
  getKdpLoginStatus,
  getRoyaltiesByEmail,
  getRoyaltiesPerBookByEmail,
  getRoyaltiesForAllAccounts,
  getAccountStatusById,
  getRoyalties,
  getRoyaltiesPerBook,
  editKdpData,
  retryBook,
  getBookInsights,
  manageRecommendations,
  bulkUploadBooksWithDelay,
  updateKdpConfig,
  startKdpAdsWithBudget,
  pauseKdpAdsWithEmail,
  // flow helpers
  flowGenerateBook,
  flowBulkGenerateKdpData,
  flowEditKdpData,
  flowGetBookQueue,
  flowUploadSingle,
  flowUploadBulk,
  flowAutoGenerate,
};

export default AdditionalService;

// Named exports (including aliases for legacy names)

// Legacy alias functions used by some components
export async function getBookQueue(): Promise<AxiosResponse<BookQueueResponse>> {
  return additionalServiceClient.get('/book-queue');
}
export async function debugBookStatus(bookId: string): Promise<AxiosResponse<BookStatusDebugResponse>> {
  return getBookStatusDebug(bookId);
}
export async function getEnvStatus(): Promise<AxiosResponse<EnvStatusResponse>> {
  return getEnvironmentStatus();
}




export async function getBookQueueStatus(): Promise<BookQueueResponse> {
  const response: AxiosResponse<BookQueueResponse> =
    await additionalServiceClient.get('/book-queue');

  if (!response.data) {
    throw new Error('Invalid response: missing data');
  }

  if (!Array.isArray(response.data.book_queue)) {
    console.warn('⚠️ Missing book_queue array, using empty array');
    response.data.book_queue = [];
  }

  return response.data; // ✅ Return only the validated data
}
