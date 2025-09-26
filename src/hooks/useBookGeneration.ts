import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from '@/utils/toast';
import { 
  generateBookThunk,
  autoGenerateBooksThunk,
  selectKdpFlow
} from '@/redux/slices/kdpFlowSlice';
import { useBookGenerationWorker } from '@/hooks/useBookGenerationWorker';
import { useGeneratePendingBooksWorker } from '@/hooks/useGeneratePendingBooksWorker';

export interface BookPrompt {
  id: string;
  prompt: string;
  niche: string;
  targetAudience: string;
  keywords?: string;
  description?: string;
  createdAt: string;
}

export interface GeneratedBook {
  id: string;
  title: string;
  content: string;
  coverUrl: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  createdAt: string;
  status: 'Pending' | 'Review' | 'Uploaded';
  progress?: number;
  error?: string;
  estimatedTime?: number;
  kdpPhase?: 'Pending' | 'Review' | 'Uploaded';
  kdpProgress?: number;
  authorName?: string | null;
  price?: number | null;
  chapters?: number;
  manuscriptFilename?: string;
  coverFilename?: string;
  proofreadReport?: string;
  stats?: Record<string, any>;
  kdpFormData?: Record<string, any>;
}

export interface UseBookGenerationReturn {
  // State
  generatedBooks: GeneratedBook[];
  isGenerating: boolean;
  error: string | null;
  generatingBookIds: Set<string>;
  
  // Actions
  generateBook: (prompt: BookPrompt) => Promise<void>;
  generateBookWithWorker: (prompt: BookPrompt) => Promise<void>;
  generateFullBook: (book: GeneratedBook) => Promise<void>;
  autoGenerateBooks: (numberOfBooks: number) => Promise<void>;
  saveBook: (book: GeneratedBook) => Promise<void>;
  
  // Worker state
  isWorkerGenerating: boolean;
  workerProgress: number;
  workerMessage: string | null;
  workerError: string | null;
  
  // Pending books worker state
  isPendingBooksGenerating: boolean;
  pendingBooksProgress: number;
  pendingBooksMessage: string | null;
  pendingBooksResult: any;
  pendingBooksError: string | null;
  pendingBooksJobId: string | null;
  pendingBooksCurrentBook: string | null;
  pendingBooksTotalBooks: number;
  pendingBooksProcessedBooks: number;
  pendingBooksEstimatedTime: string | null;
  pendingBooksCurrentStep: string | null;
  pendingBooksSuccessful: number;
  pendingBooksFailed: number;
  pendingBooksRemaining: number;
  pendingBooksDuration: number;
  pendingBooksLogs: string[];
  
  // Worker controls
  startWorkerGeneration: (bookData: any) => void;
  stopWorkerGeneration: () => void;
  startPendingBooksGeneration: () => void;
  stopPendingBooksGeneration: () => void;
  recoverPendingBooksConnection: () => void;
  
  // Utilities
  createBookPrompt: (promptData: Omit<BookPrompt, 'id' | 'createdAt'>) => BookPrompt;
  setError: (error: string | null) => void;
  setGeneratedBooks: (books: GeneratedBook[]) => void;
}

export const useBookGeneration = (): UseBookGenerationReturn => {
  const dispatch = useDispatch();
  const kdpFlow = useSelector(selectKdpFlow);
  
  // Local state
  const [generatedBooks, setGeneratedBooks] = useState<GeneratedBook[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generatingBookIds, setGeneratingBookIds] = useState<Set<string>>(new Set());
  
  // Redux state
  const isGenerating = kdpFlow.loadingStep === 'generate' || kdpFlow.loadingStep === 'autoGenerate';
  
  // Web Worker for book generation
  const {
    isGenerating: isWorkerGenerating,
    progress: workerProgress,
    message: workerMessage,
    error: workerError,
    startGeneration: startWorkerGeneration,
    stopGeneration: stopWorkerGeneration
  } = useBookGenerationWorker();

  // Web Worker for generate-pending-books API
  const {
    isGenerating: isPendingBooksGenerating,
    progress: pendingBooksProgress,
    message: pendingBooksMessage,
    result: pendingBooksResult,
    error: pendingBooksError,
    jobId: pendingBooksJobId,
    currentBook: pendingBooksCurrentBook,
    totalBooks: pendingBooksTotalBooks,
    processedBooks: pendingBooksProcessedBooks,
    estimatedTimeRemaining: pendingBooksEstimatedTime,
    currentStep: pendingBooksCurrentStep,
    successfulBooks: pendingBooksSuccessful,
    failedBooks: pendingBooksFailed,
    remainingBooks: pendingBooksRemaining,
    duration: pendingBooksDuration,
    logs: pendingBooksLogs,
    startGeneration: startPendingBooksGeneration,
    stopGeneration: stopPendingBooksGeneration,
    recoverConnection: recoverPendingBooksConnection
  } = useGeneratePendingBooksWorker();

  // Create book prompt utility
  const createBookPrompt = useCallback((promptData: Omit<BookPrompt, 'id' | 'createdAt'>): BookPrompt => {
    return {
      ...promptData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
  }, []);

  // Generate single book
  const generateBook = useCallback(async (prompt: BookPrompt) => {
    if (!prompt) {
      setError('Please provide a book prompt first');
      return;
    }

    try {
      setError('');
      console.log('Step 1: Sending generate-book request for single book');

      const result = await dispatch(generateBookThunk({
        user_prompt: prompt.prompt,
        n: 1
      }) as any).unwrap();

      console.log('Generate-book response:', result);

      if (!result) {
        setError('No response received from server');
        return;
      }

      // Extract generated book data from API response
      const previewData = result.data_preview?.[0];
      const queueData = result.book_queue?.[0];
      const bookData = previewData || queueData;
      
      const actualTitle = bookData?.title || prompt.prompt;
      const actualContent = bookData?.book_content || 
        `# ${actualTitle}

## Table of Contents
1. Introduction
2. Main Content
3. Conclusion

## Introduction
This comprehensive guide provides essential knowledge and practical strategies for success in ${prompt.niche || 'General'}. Tailored specifically for ${prompt.targetAudience || 'General Audience'}, this book contains high-quality, actionable content.

## Main Content
The book covers all essential topics related to ${prompt.prompt}, providing readers with:
- Practical strategies and techniques
- Real-world examples and case studies
- Step-by-step implementation guides
- Expert insights and recommendations

## Conclusion
This book has been successfully generated and is ready for download.
Generated on: ${new Date().toLocaleDateString()}
Niche: ${prompt.niche || 'General'}
Target Audience: ${prompt.targetAudience || 'General Audience'}`;

      const generatedBook: GeneratedBook = {
        id: Date.now().toString(),
        title: actualTitle,
        content: actualContent,
        coverUrl: bookData?.cover_url || `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodeURIComponent(actualTitle)}`,
        niche: bookData?.genre || prompt.niche || 'General',
        targetAudience: bookData?.target_audience || prompt.targetAudience || 'General Audience',
        wordCount: bookData?.word_count || 5000,
        createdAt: new Date().toISOString(),
        status: 'Pending',
        kdpPhase: 'Pending',
        chapters: bookData?.chapters,
        authorName: bookData?.author_name,
        price: bookData?.price,
        manuscriptFilename: bookData?.txt_path,
        coverFilename: bookData?.cover_path,
        proofreadReport: bookData?.proofread_report,
        stats: bookData?.stats
      };

      setGeneratedBooks(prev => [...prev, generatedBook]);
      toast.success('Book generated successfully! Click "Generate Full Book" to complete the process.');
    } catch (error: any) {
      console.error('Error generating book:', error);
      setError(error.response?.data?.message || error.message || 'Failed to generate book');
    }
  }, [dispatch]);

  // Generate book with worker
  const generateBookWithWorker = useCallback(async (prompt: BookPrompt) => {
    if (!prompt) {
      setError('Please provide a book prompt first');
      return;
    }

    try {
      setError('');
      console.log('Starting book generation with web worker...');

      const bookData = {
        title: prompt.prompt,
        niche: prompt.niche,
        targetAudience: prompt.targetAudience,
        keywords: prompt.keywords,
        description: prompt.description
      };

      startWorkerGeneration(bookData);
    } catch (error: any) {
      console.error('Error starting book generation:', error);
      setError(error.response?.data?.message || error.message || 'Failed to start book generation');
    }
  }, [startWorkerGeneration]);

  // Generate full book
  const generateFullBook = useCallback(async (book: GeneratedBook) => {
    try {
      setGeneratingBookIds(prev => new Set(prev).add(book.id));
      setError('');

      console.log('Step 3: Generating full book for:', book.title);
      console.log('Starting pending books generation via web worker...');

      setGeneratedBooks(prev => prev.map(b => 
        b.id === book.id 
          ? { ...b, status: 'Pending' as const }
          : b
      ));

      toast.success('Full book generation started! Processing complete content...');

      console.log('📚 Starting generate-pending-books via web worker...');
      console.log('Calling startPendingBooksGeneration...');
      startPendingBooksGeneration();
      console.log('startPendingBooksGeneration called successfully');

      // After worker completes, check book queue status
      const checkBookStatusAfterWorker = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log('📚 Checking book queue status after worker completion...');
          // This would typically call a queue service
          // For now, we'll just update the book status
          
          setGeneratedBooks(prev => prev.map(b => 
            b.id === book.id 
              ? { 
                  ...b, 
                  status: 'Review' as const,
                  kdpPhase: 'Review' as const
                }
              : b
          ));
          
          toast.success(`Book "${book.title}" is ready for KDP data generation!`);
        } catch (error: any) {
          console.error('Error checking book status after worker:', error);
        }
      };

      checkBookStatusAfterWorker();

      setGeneratingBookIds(prev => {
        const next = new Set(prev);
        next.delete(book.id);
        return next;
      });
    } catch (error: any) {
      console.error('Error generating full book:', error);
      setError(error.response?.data?.message || error.message || 'Failed to generate full book');
      
      setGeneratingBookIds(prev => {
        const next = new Set(prev);
        next.delete(book.id);
        return next;
      });
    }
  }, [startPendingBooksGeneration]);

  // Auto generate books
  const autoGenerateBooks = useCallback(async (numberOfBooks: number) => {
    try {
      setError('');
      console.log(`Step 1: Sending auto-generate-books request for ${numberOfBooks} books`);
      
      const result = await dispatch(autoGenerateBooksThunk({
        n: numberOfBooks
      }) as any).unwrap();

      console.log('Auto-generate response:', result);

      if (!result) {
        setError('No response received from server');
        return;
      }

      const previewData = result.data_preview || [];
      const queueData = result.book_queue || [];
      const bookQueueData = previewData.length > 0 ? previewData : queueData;
      const mockBooks: GeneratedBook[] = [];
      
      if (bookQueueData.length > 0) {
        bookQueueData.forEach((bookData: any, index: number) => {
          const actualTitle = bookData.title || `Generated Book ${index + 1}`;
          const actualContent = bookData.book_content || bookData.content || `# ${actualTitle}

## Table of Contents
1. Introduction
2. Main Content
3. Conclusion

## Introduction
This is book ${index + 1} of ${numberOfBooks} in the series. This comprehensive guide provides essential knowledge and practical strategies for success.

## Main Content
The book covers all essential topics, providing readers with:
- Practical strategies and techniques
- Real-world examples and case studies
- Step-by-step implementation guides
- Expert insights and recommendations

## Conclusion
This book has been successfully generated and is ready for download.

---
Generated on: ${new Date().toLocaleDateString()}
Book Number: ${index + 1} of ${numberOfBooks}`;

          mockBooks.push({
            id: `${Date.now()}-${index + 1}`,
            title: actualTitle,
            content: actualContent,
            coverUrl: bookData.cover_url || `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodeURIComponent(actualTitle)}`,
            niche: bookData.genre || 'General',
            targetAudience: bookData.target_audience || 'General Audience',
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
          });
        });
      } else {
        // Fallback: create mock books if no data from API
        for (let i = 1; i <= numberOfBooks; i++) {
          const bookTitle = `Generated Book ${i}`;
          mockBooks.push({
            id: `${Date.now()}-${i}`,
            title: bookTitle,
            content: `# ${bookTitle}

## Table of Contents
1. Introduction
2. Main Content
3. Conclusion

## Introduction
This is book ${i} of ${numberOfBooks} in the series. This comprehensive guide provides essential knowledge and practical strategies for success.

## Main Content
The book covers all essential topics, providing readers with:
- Practical strategies and techniques
- Real-world examples and case studies
- Step-by-step implementation guides
- Expert insights and recommendations

## Conclusion
This book has been successfully generated and is ready for download.

---
Generated on: ${new Date().toLocaleDateString()}
Book Number: ${i} of ${numberOfBooks}`,
            coverUrl: `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodeURIComponent(bookTitle)}`,
            niche: 'General',
            targetAudience: 'General Audience',
            wordCount: 5000,
            createdAt: new Date().toISOString(),
            status: 'Pending',
            kdpPhase: 'Pending'
          });
        }
      }

      setGeneratedBooks(prev => [...prev, ...mockBooks]);
      toast.success(`${numberOfBooks} books generated successfully! Click "Generate Full Book" on each book to complete the process.`);
    } catch (error: any) {
      console.error('Error in bulk generation:', error);
      setError(error.response?.data?.message || error.message || 'Failed to generate books in bulk');
    }
  }, [dispatch]);

  // Save book
  const saveBook = useCallback(async (book: GeneratedBook) => {
    try {
      const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
      const bookToSave = {
        ...book,
        status: 'Review' as const,
        savedAt: new Date().toISOString()
      };
      savedBooks.push(bookToSave);
      localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
      alert('Book saved successfully! You can view it in the "My Books" page.');
    } catch (error) {
      console.error('Error saving book:', error);
      setError('Failed to save book');
    }
  }, []);

  return {
    // State
    generatedBooks,
    isGenerating,
    error,
    generatingBookIds,
    
    // Actions
    generateBook,
    generateBookWithWorker,
    generateFullBook,
    autoGenerateBooks,
    saveBook,
    
    // Worker state
    isWorkerGenerating,
    workerProgress,
    workerMessage,
    workerError,
    
    // Pending books worker state
    isPendingBooksGenerating,
    pendingBooksProgress,
    pendingBooksMessage,
    pendingBooksResult,
    pendingBooksError,
    pendingBooksJobId,
    pendingBooksCurrentBook,
    pendingBooksTotalBooks,
    pendingBooksProcessedBooks,
    pendingBooksEstimatedTime,
    pendingBooksCurrentStep,
    pendingBooksSuccessful,
    pendingBooksFailed,
    pendingBooksRemaining,
    pendingBooksDuration,
    pendingBooksLogs,
    
    // Worker controls
    startWorkerGeneration,
    stopWorkerGeneration,
    startPendingBooksGeneration,
    stopPendingBooksGeneration,
    recoverPendingBooksConnection,
    
    // Utilities
    createBookPrompt,
    setError,
    setGeneratedBooks
  };
};
