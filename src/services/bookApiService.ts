import { 
  getKdpLoginStatus,
  getBooks,
  viewCover,
  getEnvironmentStatus
} from '@/services/additionalService';

export interface BookApiResponse {
  data_preview?: any[];
  book_queue?: any[];
  success?: boolean;
  message?: string;
}

export interface BookData {
  id: string;
  title: string;
  content?: string;
  book_content?: string;
  cover_url?: string;
  genre?: string;
  niche?: string;
  target_audience?: string;
  word_count?: number;
  chapters?: number;
  author_name?: string;
  price?: number;
  txt_path?: string;
  cover_path?: string;
  proofread_report?: string;
  stats?: Record<string, any>;
  created_at?: string;
  status?: string;
  kdp_form_data_exists?: boolean;
  description?: string;
}

export interface EnvStatusResponse {
  [key: string]: any;
}

export interface KdpLoginStatus {
  logged_in: boolean;
  email?: string;
  expires_at?: string;
}

export class BookApiService {
  private static instance: BookApiService;
  private baseUrl = 'http://127.0.0.1:8081';

  private constructor() {}

  public static getInstance(): BookApiService {
    if (!BookApiService.instance) {
      BookApiService.instance = new BookApiService();
    }
    return BookApiService.instance;
  }

  /**
   * Test backend connection by trying multiple endpoints
   */
  public async testConnection(): Promise<boolean> {
    const endpoints = ['/env-status', '/books', '/health'];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing backend connection at ${endpoint}...`);
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'GET',
          timeout: 5000
        } as any);
        
        if (response.ok) {
          console.log(`✅ Backend connection successful at ${endpoint}`);
          return true;
        } else {
          console.log(`❌ Backend responded with error at ${endpoint}:`, response.status);
        }
      } catch (error) {
        console.log(`❌ Failed to connect to ${endpoint}:`, error);
        continue;
      }
    }
    
    console.error('❌ All backend connection attempts failed');
    return false;
  }

  /**
   * Get environment status with caching
   */
  public async getEnvironmentStatus(forceRefresh = false): Promise<EnvStatusResponse | null> {
    try {
      // Check session storage first
      const cachedEnvStatus = sessionStorage.getItem('env_status');
      const cacheTime = sessionStorage.getItem('env_status_time');
      const now = Date.now();
      const cacheAge = cacheTime ? now - parseInt(cacheTime) : Infinity;
      
      // Use cache if it's less than 5 minutes old and not forcing refresh
      if (!forceRefresh && cachedEnvStatus && cacheAge < 5 * 60 * 1000) {
        return JSON.parse(cachedEnvStatus);
      }
      
      const response = await getEnvironmentStatus();
      if (response?.data) {
        // Cache the response
        sessionStorage.setItem('env_status', JSON.stringify(response.data));
        sessionStorage.setItem('env_status_time', now.toString());
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching environment status:', error);
      return null;
    }
  }

  /**
   * Get books from API
   */
  public async getBooks(): Promise<BookData[]> {
    try {
      const response = await getBooks();
      console.log('API Response:', response?.data);
      
      if (response?.data) {
        // Handle both array response and wrapped response
        return Array.isArray(response.data) ? response.data : [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }

  /**
   * Get book cover by ID
   */
  public async getBookCover(bookId: string): Promise<any> {
    try {
      const response = await viewCover(bookId);
      return response?.data;
    } catch (error) {
      console.error('Error getting book cover:', error);
      throw error;
    }
  }

  /**
   * Check KDP login status
   */
  public async getKdpLoginStatus(): Promise<KdpLoginStatus> {
    try {
      const response = await getKdpLoginStatus();
      return response.data;
    } catch (error) {
      console.error('Error checking KDP login status:', error);
      throw error;
    }
  }

  /**
   * Generate book suggestions from API books
   */
  public generateBookSuggestions(apiBooks: BookData[]): any[] {
    return apiBooks.map((book: BookData) => ({
      title: String(book.Title || book.title || 'Untitled Book'),
      niche: String(book.Category || book.niche || 'General'),
      targetAudience: String(book.targetAudience || 'General Audience'),
      wordCount: 5000, // Default word count
      prompt: `Create a book about ${String(book.Title || book.title || 'this topic')}`,
      description: String(book.Description || book.description || `A comprehensive guide about ${String(book.Title || book.title || 'this topic')}`),
      isApiBook: true,
      bookId: String(book.ASIN || book.id || Math.random().toString())
    }));
  }

  /**
   * Create a book prompt object
   */
  public createBookPrompt(promptData: {
    prompt: string;
    niche: string;
    targetAudience: string;
    keywords?: string;
    description?: string;
  }): {
    id: string;
    prompt: string;
    niche: string;
    targetAudience: string;
    keywords?: string;
    description?: string;
    createdAt: string;
  } {
    return {
      ...promptData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Transform API book data to frontend book format
   */
  public transformApiBookToFrontend(bookData: BookData, prompt?: any): {
    id: string;
    title: string;
    content: string;
    coverUrl: string;
    niche: string;
    targetAudience: string;
    wordCount: number;
    createdAt: string;
    status: 'Pending' | 'Review' | 'Uploaded';
    kdpPhase: 'Pending' | 'Review' | 'Uploaded';
    chapters?: number;
    authorName?: string | null;
    price?: number | null;
    manuscriptFilename?: string;
    coverFilename?: string;
    proofreadReport?: string;
    stats?: Record<string, any>;
  } {
    const actualTitle = bookData.title || prompt?.prompt || 'Generated Book';
    const actualContent = bookData.book_content || bookData.content || 
      `# ${actualTitle}

## Table of Contents
1. Introduction
2. Main Content
3. Conclusion

## Introduction
This comprehensive guide provides essential knowledge and practical strategies for success in ${prompt?.niche || 'General'}. Tailored specifically for ${prompt?.targetAudience || 'General Audience'}, this book contains high-quality, actionable content.

## Main Content
The book covers all essential topics related to ${prompt?.prompt || 'the subject matter'}, providing readers with:
- Practical strategies and techniques
- Real-world examples and case studies
- Step-by-step implementation guides
- Expert insights and recommendations

## Conclusion
This book has been successfully generated and is ready for download.
Generated on: ${new Date().toLocaleDateString()}
Niche: ${prompt?.niche || 'General'}
Target Audience: ${prompt?.targetAudience || 'General Audience'}`;

    return {
      id: Date.now().toString(),
      title: actualTitle,
      content: actualContent,
      coverUrl: bookData.cover_url || `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodeURIComponent(actualTitle)}`,
      niche: bookData.genre || bookData.niche || prompt?.niche || 'General',
      targetAudience: bookData.target_audience || prompt?.targetAudience || 'General Audience',
      wordCount: bookData.word_count || 5000,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      kdpPhase: 'Pending',
      chapters: bookData.chapters,
      authorName: bookData.author_name,
      price: bookData.price,
      manuscriptFilename: bookData.txt_path,
      coverFilename: bookData.cover_path,
      proofreadReport: bookData.proofread_report,
      stats: bookData.stats
    };
  }
}

// Export singleton instance
export const bookApiService = BookApiService.getInstance();
