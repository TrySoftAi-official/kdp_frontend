import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreateBookProvider } from '@/components/create-book/CreateBookContext';


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  FileText, 
  Sparkles, 
  Download, 
  Play,
  Save,
  Eye,
  Target,
  Upload,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { PlanUpgradeModal } from '@/components/shared/PlanUpgradeModal';
import { 
  AdditionalService,
  BookGenerationRequest,
  UploadBookRequest,
  UploadProgressResponse,
  BookQueueResponse,
  EnvStatusResponse
} from '@/api/additionalService';

interface GenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  result?: string;
}

interface GeneratedBook {
  id: string;
  title: string;
  content: string;
  coverUrl: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  createdAt: string;
  status: 'draft' | 'generated' | 'published' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  estimatedTime?: number;
}

interface BookPrompt {
  id: string;
  prompt: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  keywords?: string;
  description?: string;
  createdAt: string;
}

export const IntelligentAssistant: React.FC = () => {
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  const [currentPrompt, setCurrentPrompt] = useState<BookPrompt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [generatedBooks, setGeneratedBooks] = useState<GeneratedBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<GeneratedBook | null>(null);
  const [showBookView, setShowBookView] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [selectedBookForDropdown, setSelectedBookForDropdown] = useState<GeneratedBook | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [animationPaused, setAnimationPaused] = useState(false);
  
  // New state for API integration
  const [apiError, setApiError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgressResponse | null>(null);
  const [bookQueue, setBookQueue] = useState<BookQueueResponse | null>(null);
  const [envStatus, setEnvStatus] = useState<EnvStatusResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  // Check if user needs to upgrade
  useEffect(() => {
    if (user?.role === 'guest') {
      setShowUpgradeModal(true);
    }
  }, [user]);

  // Initialize currentPrompt with empty values
  useEffect(() => {
    if (!currentPrompt) {
      setCurrentPrompt({
        id: '',
        prompt: '',
        niche: '',
        targetAudience: '',
        wordCount: 5000,
        keywords: '',
        description: '',
        createdAt: ''
      });
    }
  }, [currentPrompt]);


  const createBookPrompt = (promptData: Omit<BookPrompt, 'id' | 'createdAt'>) => {
    const newPrompt: BookPrompt = {
      ...promptData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    return newPrompt;
  };

  // API utility functions
  const pollGenerationStatus = async (bookId: string) => {
    try {
      const response = await AdditionalService.debugBookStatus(bookId);
      const status = response?.data;
      
      console.log('Polling status response:', status);
      
      if (!status) {
        console.error('No status response received');
        return;
      }
      
      // Handle different response formats
      let generationStatus = status.details?.generationStatus || status.status;
      let progress = 0; // Progress is not available in the current response format
      
      console.log('Generation status:', generationStatus, 'Progress:', progress);
      
      // Update generation steps based on status
      setGenerationSteps(prev => prev.map((step, index) => {
        if (generationStatus === 'completed') {
          return { ...step, status: 'completed', progress: 100 };
        } else if (generationStatus === 'processing' || generationStatus === 'running') {
          // Distribute progress across steps
          const stepProgress = Math.min(100, Math.max(0, (progress / prev.length) * (index + 1)));
          return { ...step, status: 'running', progress: stepProgress };
        } else if (generationStatus === 'failed') {
          return { ...step, status: 'error', progress: 0 };
        }
        return step;
      }));

      if (generationStatus === 'completed') {
        // Stop polling and fetch the completed book
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        await fetchCompletedBook(bookId);
      } else if (generationStatus === 'failed') {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        setApiError(status.error || status.details?.errors?.[0] || 'Book generation failed');
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Error polling generation status:', error);
      setApiError('Failed to check generation status');
    }
  };

  const fetchCompletedBook = async (bookId: string) => {
    try {
      console.log('Fetching completed book for ID:', bookId);
      
      // Try to fetch the actual book data from the backend
      try {
        const response = await AdditionalService.getBookById(bookId);
        if (response?.data) {
          const bookData = response.data;
          const completedBook: GeneratedBook = {
            id: bookId,
            title: bookData.title || currentPrompt?.prompt || 'Generated Book',
            content: bookData.content || bookData.description || 'Book content generated successfully',
            coverUrl: bookData.coverUrl || `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodeURIComponent(bookData.title || currentPrompt?.prompt || 'Book')}`,
            niche: bookData.niche || currentPrompt?.niche || 'General',
            targetAudience: bookData.targetAudience || currentPrompt?.targetAudience || 'General Audience',
            wordCount: bookData.wordCount || currentPrompt?.wordCount || 5000,
            createdAt: bookData.createdAt || new Date().toISOString(),
            status: 'completed'
          };
          
          setGeneratedBooks(prev => [...prev, completedBook]);
          setIsGenerating(false);
          return;
        }
      } catch (fetchError) {
        console.log('Could not fetch book by ID, using fallback:', fetchError);
      }
      
      // Fallback: Create a book with the prompt data
      const completedBook: GeneratedBook = {
        id: bookId,
        title: currentPrompt?.prompt || 'Generated Book',
        content: `Book: "${currentPrompt?.prompt || 'Generated Book'}"\n\nNiche: ${currentPrompt?.niche || 'General'}\nTarget Audience: ${currentPrompt?.targetAudience || 'General Audience'}\nWord Count: ${currentPrompt?.wordCount || 5000}\n\nThis book has been successfully generated and is ready for download. The content has been processed and saved to the system.`,
        coverUrl: `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodeURIComponent(currentPrompt?.prompt || 'Book')}`,
        niche: currentPrompt?.niche || 'General',
        targetAudience: currentPrompt?.targetAudience || 'General Audience',
        wordCount: currentPrompt?.wordCount || 5000,
        createdAt: new Date().toISOString(),
        status: 'completed'
      };
      
      setGeneratedBooks(prev => [...prev, completedBook]);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error fetching completed book:', error);
      setApiError('Failed to fetch completed book');
      setIsGenerating(false);
    }
  };

  const startPolling = (bookId: string) => {
    const interval = setInterval(() => {
      pollGenerationStatus(bookId);
    }, 2000); // Poll every 2 seconds
    setPollingInterval(interval as unknown as number);
    
    // Set a timeout to stop polling after 5 minutes
    setTimeout(() => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
        setApiError('Book generation timed out. Please try again.');
        setIsGenerating(false);
      }
    }, 5 * 60 * 1000); // 5 minutes
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [pollingInterval]);

  const handleGenerateBook = async (prompt: BookPrompt) => {
    if (!prompt) {
      setApiError('Please provide a book prompt first');
      return;
    }

    // Check subscription access before generating
    try {
      const validation = await subscriptionApi.validateSubscriptionAccess('create_book');
      if (validation && !validation.can_perform) {
        setApiError(validation.message || 'You need to upgrade your subscription to create books');
        setShowUpgradeModal(true);
        return;
      }
    } catch (error) {
      console.error('Failed to validate subscription access:', error);
      // Continue with generation if validation fails
    }

    try {
      setApiError('');
      setIsGenerating(true);
      setGeneratedBooks([]);

      // Initialize generation steps
      const steps: GenerationStep[] = [
        { id: '1', name: 'Analyzing prompt', status: 'pending', progress: 0 },
        { id: '2', name: 'Generating book outline', status: 'pending', progress: 0 },
        { id: '3', name: 'Creating chapter content', status: 'pending', progress: 0 },
        { id: '4', name: 'Generating book cover', status: 'pending', progress: 0 },
        { id: '5', name: 'Finalizing and optimizing', status: 'pending', progress: 0 }
      ];

      setGenerationSteps(steps);

      // Prepare API request
      const bookRequest: BookGenerationRequest = {
        prompt: prompt.prompt,
        user_prompt: prompt.prompt,
        niche: prompt.niche || 'General',
        targetAudience: prompt.targetAudience || 'General Audience',
        wordCount: prompt.wordCount || 5000,
        genre: prompt.niche || 'General',
        language: 'English',
        tone: 'Professional',
        style: 'Informative',
        n: 1,
        metadata: {
          keywords: prompt.keywords || '',
          description: prompt.description || ''
        }
      };

      // Call the API to generate book
      console.log('Sending book generation request:', bookRequest);
      const response = await AdditionalService.generateBook(bookRequest);
      const generationResponse = response?.data;

      console.log('Generation response:', generationResponse);

      if (!generationResponse) {
        setApiError('No response received from server');
        setIsGenerating(false);
        return;
      }

      // Handle different response formats
      const status = generationResponse.status || generationResponse.generationStatus;
      const bookId = generationResponse.id || generationResponse.bookId || Date.now().toString();

      console.log('Book generation status:', status, 'Book ID:', bookId);

      if (status === 'processing' || status === 'running') {
        // Start polling for status updates
        console.log('Starting polling for book ID:', bookId);
        startPolling(bookId);
      } else if (status === 'completed' || status === 'success') {
        // Book is already completed
        console.log('Book generation completed immediately');
        const completedBook: GeneratedBook = {
          id: bookId,
          title: prompt.prompt,
          content: generationResponse.book?.content || generationResponse.content || 'Book content generated successfully',
          coverUrl: generationResponse.book?.coverUrl || generationResponse.coverUrl || `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodeURIComponent(prompt.prompt)}`,
          niche: prompt.niche || 'General',
          targetAudience: prompt.targetAudience || 'General Audience',
          wordCount: prompt.wordCount || 5000,
          createdAt: new Date().toISOString(),
          status: 'completed'
        };
        setGeneratedBooks(prev => [...prev, completedBook]);
        setIsGenerating(false);
      } else if (status === 'failed' || status === 'error') {
        setApiError(generationResponse.error || generationResponse.message || 'Book generation failed');
        setIsGenerating(false);
      } else {
        // Unknown status, start polling anyway
        console.log('Unknown status, starting polling:', status);
        startPolling(bookId);
      }

    } catch (error: any) {
      console.error('Error generating book:', error);
      setApiError(error.response?.data?.message || error.message || 'Failed to generate book');
      setIsGenerating(false);
    }
  };

  const handleSaveBook = async (book: GeneratedBook) => {
    try {
      // Save to local storage or send to backend
      const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');

      // Add book with 'saved' status for My Books page
      const bookToSave = {
        ...book,
        status: 'saved' as const,
        savedAt: new Date().toISOString()
      };

      savedBooks.push(bookToSave);
      localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
      
      // You could also save to backend here if needed
      // await AdditionalService.saveBook(bookToSave);
      
      alert('Book saved successfully! You can view it in the "My Books" page.');
    } catch (error) {
      console.error('Error saving book:', error);
      setApiError('Failed to save book');
    }
  };

  const handleUploadBook = async (book: GeneratedBook, file: File) => {
    try {
      setIsUploading(true);
      setApiError('');

      const uploadRequest: UploadBookRequest = {
        bookId: book.id,
        file: file,
        format: 'pdf',
        metadata: {
          title: book.title,
          niche: book.niche,
          targetAudience: book.targetAudience,
          wordCount: book.wordCount
        }
      };

      const response = await AdditionalService.uploadBook(uploadRequest);
      const uploadResponse = response?.data;

      if (!uploadResponse) {
        setApiError('No response received from server');
        setIsUploading(false);
        return;
      }

      if (uploadResponse.status === 'processing') {
        // Start polling for upload progress
        const progressInterval = setInterval(async () => {
          try {
            const progressResponse = await AdditionalService.getUploadProgress();
            if (progressResponse?.data) {
              setUploadProgress(progressResponse.data);
              
              if (progressResponse.data.status === 'completed') {
                clearInterval(progressInterval);
                setIsUploading(false);
                alert('Book uploaded successfully!');
              } else if (progressResponse.data.status === 'failed') {
                clearInterval(progressInterval);
                setIsUploading(false);
                setApiError('Upload failed');
              }
            }
          } catch (error) {
            console.error('Error checking upload progress:', error);
            clearInterval(progressInterval);
            setIsUploading(false);
          }
        }, 2000);
      } else if (uploadResponse.status === 'completed') {
        setIsUploading(false);
        alert('Book uploaded successfully!');
      } else if (uploadResponse.status === 'failed') {
        setIsUploading(false);
        setApiError(uploadResponse.error || 'Upload failed');
      }

    } catch (error: any) {
      console.error('Error uploading book:', error);
      setApiError(error.response?.data?.message || error.message || 'Failed to upload book');
      setIsUploading(false);
    }
  };

  const handleDownloadBook = (book: GeneratedBook) => {
    const blob = new Blob([book.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Bulk operations
  const handleBulkGenerateBooks = async () => {
    try {
      setApiError('');
      setIsGenerating(true);

      const bookRequest: BookGenerationRequest = {
        prompt: currentPrompt?.prompt || 'Generate multiple books',
        user_prompt: currentPrompt?.prompt || 'Generate multiple books',
        niche: currentPrompt?.niche || 'General',
        targetAudience: currentPrompt?.targetAudience || 'General Audience',
        wordCount: currentPrompt?.wordCount || 5000,
        n: 3, // Generate 3 books
        metadata: {
          keywords: currentPrompt?.keywords || '',
          description: currentPrompt?.description || ''
        }
      };

      const response = await AdditionalService.autoGenerateBooks(bookRequest);
      const generationResponse = response?.data;

      if (!generationResponse) {
        setApiError('No response received from server');
        setIsGenerating(false);
        return;
      }

      if (generationResponse.status === 'processing') {
        startPolling(generationResponse.id);
      } else if (generationResponse.status === 'completed') {
        setIsGenerating(false);
        alert('Bulk book generation completed!');
      } else if (generationResponse.status === 'failed') {
        setApiError(generationResponse.error || 'Bulk generation failed');
        setIsGenerating(false);
      }

    } catch (error: any) {
      console.error('Error in bulk generation:', error);
      setApiError(error.response?.data?.message || error.message || 'Failed to generate books in bulk');
      setIsGenerating(false);
    }
  };

  const handleGeneratePendingBooks = async () => {
    try {
      setApiError('');
      setIsGenerating(true);

      const response = await AdditionalService.generatePendingBooks();
      const generationResponse = response?.data;

      if (!generationResponse) {
        setApiError('No response received from server');
        setIsGenerating(false);
        return;
      }

      if (generationResponse.status === 'processing') {
        startPolling(generationResponse.id);
      } else if (generationResponse.status === 'completed') {
        setIsGenerating(false);
        alert('Pending books generation completed!');
      } else if (generationResponse.status === 'failed') {
        setApiError(generationResponse.error || 'Pending generation failed');
        setIsGenerating(false);
      }

    } catch (error: any) {
      console.error('Error generating pending books:', error);
      setApiError(error.response?.data?.message || error.message || 'Failed to generate pending books');
      setIsGenerating(false);
    }
  };

  const handleBulkClearAll = async () => {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    try {
      setApiError('');

      const response = await AdditionalService.bulkClearAll({
        confirm: true,
        includeBooks: true,
        includeUsers: false,
        includeAnalytics: false
      });

      if (response?.data?.success) {
        alert('All data cleared successfully!');
        setGeneratedBooks([]);
      } else {
        setApiError('Failed to clear data');
      }

    } catch (error: any) {
      console.error('Error clearing data:', error);
      setApiError(error.response?.data?.message || error.message || 'Failed to clear data');
    }
  };

  const handleBulkResetPending = async () => {
    try {
      setApiError('');

      const response = await AdditionalService.bulkResetPending({
        resetAll: true
      });

      if (response?.data?.success) {
        alert('Pending books reset successfully!');
      } else {
        setApiError('Failed to reset pending books');
      }

    } catch (error: any) {
      console.error('Error resetting pending books:', error);
      setApiError(error.response?.data?.message || error.message || 'Failed to reset pending books');
    }
  };

  const handleBulkGenerateKdpData = async () => {
    try {
      setApiError('');

      const response = await AdditionalService.bulkGenerateKdpData({
        generateAll: true,
        includeMetadata: true
      });

      if (response?.data?.success) {
        alert('KDP data generated successfully!');
      } else {
        setApiError('Failed to generate KDP data');
      }

    } catch (error: any) {
      console.error('Error generating KDP data:', error);
      setApiError(error.response?.data?.message || error.message || 'Failed to generate KDP data');
    }
  };

  // System monitoring functions
  const fetchBookQueue = async () => {
    try {
      const response = await AdditionalService.getBookQueue();
      if (response?.data) {
        setBookQueue(response.data);
      }
    } catch (error) {
      console.error('Error fetching book queue:', error);
    }
  };

  const fetchEnvStatus = async () => {
    try {
      const response = await AdditionalService.getEnvStatus();
      if (response?.data) {
        setEnvStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching environment status:', error);
    }
  };

  const handleRetryFailedUploads = async () => {
    try {
      setApiError('');

      const response = await AdditionalService.retryFailedUploads({
        retryAll: true
      });

      if (response?.data?.success) {
        alert('Failed uploads retried successfully!');
      } else {
        setApiError('Failed to retry uploads');
      }

    } catch (error: any) {
      console.error('Error retrying uploads:', error);
      setApiError(error.response?.data?.message || error.message || 'Failed to retry uploads');
    }
  };

  // Load system status on component mount
  useEffect(() => {
    fetchBookQueue();
    fetchEnvStatus();
  }, []);

  const handlePreviewSuggestion = (suggestion: any) => {
    // Show preview modal with suggestion details
    setSelectedBook({
      id: 'preview',
      title: suggestion.title,
      content: `This is a preview of "${suggestion.title}" - ${suggestion.description}\n\nNiche: ${suggestion.niche}\nTarget Audience: ${suggestion.targetAudience}\nWord Count: ${suggestion.wordCount.toLocaleString()} words\n\nPrompt: ${suggestion.prompt}`,
      coverUrl: `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodeURIComponent(suggestion.title)}`,
      niche: suggestion.niche,
      targetAudience: suggestion.targetAudience,
      wordCount: suggestion.wordCount,
      createdAt: new Date().toISOString(),
      status: 'draft' as const
    });
    setShowBookView(true);
  };

  const handleViewGeneratedBook = (book: GeneratedBook) => {
    setSelectedBook(book);
    setShowBookView(true);
  };

  const handleDownloadGeneratedBook = (book: GeneratedBook) => {
    const blob = new Blob([book.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const closeBookView = () => {
    setShowBookView(false);
    setSelectedBook(null);
  };

  const handleViewDropdown = (book: GeneratedBook, event: React.MouseEvent) => {
    event.stopPropagation();
    if (showDropdown === book.id) {
      setShowDropdown(null);
      setSelectedBookForDropdown(null);
    } else {
      // Close any other open dropdown first
      setShowDropdown(book.id);
      setSelectedBookForDropdown(book);

      // Ensure the dropdown is visible by scrolling if needed
      setTimeout(() => {
        const dropdownElement = document.querySelector(`[data-dropdown="${book.id}"]`);
        if (dropdownElement) {
          dropdownElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  };

  const closeDropdown = () => {
    setShowDropdown(null);
    setSelectedBookForDropdown(null);
  };

  // Drag handlers for slider
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX - dragOffset);
    setAnimationPaused(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newOffset = e.clientX - dragStart;
    setDragOffset(newOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setAnimationPaused(false);
    // Reset offset after a short delay to resume animation
    setTimeout(() => {
      setDragOffset(0);
    }, 100);
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX - dragOffset);
    setAnimationPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const newOffset = e.touches[0].clientX - dragStart;
    setDragOffset(newOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setAnimationPaused(false);
    // Reset offset after a short delay to resume animation
    setTimeout(() => {
      setDragOffset(0);
    }, 100);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest('.dropdown-container')) {
        closeDropdown();
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <CreateBookProvider>

    <div className="min-h-screen bg-gray-50 page-container">
      <div className=" max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Intelligent Assistant</h1>
          <p className="text-muted-foreground">
            Generate high-quality books from your prompts using AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </Badge>
          {envStatus && envStatus.database && (
            <Badge 
              variant={envStatus.database.status === 'connected' ? 'default' : 'destructive'}
              className="flex items-center gap-1"
            >
              <div className={`w-2 h-2 rounded-full ${envStatus.database.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
              {envStatus.database.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Error Display */}
      {apiError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              <span>{apiError}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setApiError('')}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      {envStatus && envStatus.database && envStatus.system && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database</span>
                  <Badge 
                    variant={envStatus.database.status === 'connected' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {envStatus.database.status}
                  </Badge>
                </div>
                {envStatus.database.connectionTime && (
                  <div className="text-xs text-muted-foreground">
                    Response: {envStatus.database.connectionTime}ms
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-xs text-muted-foreground">
                    {AdditionalService.formatMemoryUsage(envStatus.system.memory)}
                  </span>
                </div>
                <Progress value={envStatus.system.memory.percentage} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-xs text-muted-foreground">
                    {AdditionalService.formatSystemUptime(envStatus.system.uptime)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  CPU: {envStatus.system.cpu.usage}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Book Queue Status */}
      {bookQueue && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Book Queue Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{bookQueue.totalPending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{bookQueue.totalRunning}</div>
                <div className="text-sm text-muted-foreground">Running</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{bookQueue.totalCompleted}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{bookQueue.totalFailed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploadProgress && uploadProgress.status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {AdditionalService.formatUploadProgress(uploadProgress)}
                </span>
                <Badge 
                  variant="outline"
                  className={AdditionalService.getUploadStatusColor(uploadProgress.status)}
                >
                  {uploadProgress.status}
                </Badge>
              </div>
              <Progress value={uploadProgress.progress || 0} className="h-2" />
              {uploadProgress.currentFile && (
                <div className="text-xs text-muted-foreground">
                  Current: {uploadProgress.currentFile}
                </div>
              )}
              {uploadProgress.errors && uploadProgress.errors.length > 0 && (
                <div className="text-xs text-red-600">
                  Errors: {uploadProgress.errors.join(', ')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Book Generation Slider */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Hot Selling Genres & Amazon KDP Suggestions
          </CardTitle>
          <CardDescription>
            Generate popular book types that are trending on Amazon KDP
          </CardDescription>
        </CardHeader>
                <CardContent>
                     <div className="relative overflow-hidden group">
            {/* Live Moving Slider Container */}
                         <div 
               className={`flex gap-3 cursor-grab active:cursor-grabbing ${!animationPaused ? 'animate-scroll' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ transform: `translateX(${dragOffset}px)` }}
            >
              {(() => {
                const suggestions = [
                  { title: "Weight Loss Guide", niche: "Health & Fitness", targetAudience: "Beginners", wordCount: 8000, prompt: "Create a comprehensive weight loss guide for beginners", description: "A complete guide to healthy weight loss with proven strategies and meal plans" },
                  { title: "Business Startup", niche: "Business & Entrepreneurship", targetAudience: "Entrepreneurs", wordCount: 10000, prompt: "Write a complete guide to starting a business from scratch", description: "Step-by-step guide to launching your own successful business venture" },
                  { title: "Digital Marketing", niche: "Marketing", targetAudience: "Professionals", wordCount: 12000, prompt: "Create a digital marketing strategy guide for businesses", description: "Comprehensive digital marketing strategies for modern businesses" },
                  { title: "Personal Finance", niche: "Finance", targetAudience: "Young Adults", wordCount: 9000, prompt: "Write a personal finance guide for young adults", description: "Essential money management skills for financial independence" },
                  { title: "Cooking Basics", niche: "Food & Cooking", targetAudience: "Beginners", wordCount: 7000, prompt: "Create a beginner's guide to cooking healthy meals", description: "Master the fundamentals of cooking with simple, delicious recipes" },
                  { title: "Productivity Hacks", niche: "Self-Improvement", targetAudience: "Professionals", wordCount: 6000, prompt: "Write a productivity guide with actionable hacks", description: "Transform your work efficiency with proven productivity techniques" },
                  { title: "Fitness Training", niche: "Health & Fitness", targetAudience: "Intermediate", wordCount: 8500, prompt: "Create a fitness training program for intermediate level", description: "Advanced workout routines to take your fitness to the next level" },
                  { title: "Social Media", niche: "Marketing", targetAudience: "Business Owners", wordCount: 9500, prompt: "Write a social media marketing guide for businesses", description: "Build your brand presence and engage customers effectively" }
                ];

                return [
                  // Original cards
                  ...suggestions.map((suggestion, index) => (
                                         <div key={index} className="flex-shrink-0 w-44 h-68 border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all duration-300 bg-white hover:border-blue-300 group">
                      {/* Card Header */}
                      <div className="h-16 mb-3">
                        <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">{suggestion.title}</h4>
                      </div>

                      {/* Badges Section - Fixed Height */}
                      <div className="h-20 mb-4 space-y-2">
                        <Badge variant="outline" className="text-xs w-full justify-center bg-gray-50">{suggestion.niche}</Badge>
                        <Badge variant="secondary" className="text-xs w-full justify-center">{suggestion.targetAudience}</Badge>
                        <Badge variant="outline" className="text-xs w-full justify-center bg-blue-50 text-blue-700 border-blue-200">{suggestion.wordCount.toLocaleString()} words</Badge>
                      </div>

                      {/* Description - Fixed Height */}
                      <div className="h-16 mb-4">
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{suggestion.description}</p>
                      </div>

                      {/* Action Buttons - Fixed Height */}
                      <div className="h-20 space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            const newPrompt = createBookPrompt({
                              prompt: suggestion.prompt,
                              niche: suggestion.niche,
                              targetAudience: suggestion.targetAudience,
                              wordCount: suggestion.wordCount
                            });
                            setCurrentPrompt(newPrompt);
                            handleGenerateBook(newPrompt);
                          }}
                        >
                          <Sparkles className="h-3 w-3 mr-2" />
                          Generate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                          onClick={() => handlePreviewSuggestion(suggestion)}
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  )),
                  // Duplicate cards for seamless infinite scroll
                  ...suggestions.map((suggestion, index) => (
                                         <div key={`duplicate-${index}`} className="flex-shrink-0 w-44 h-68 border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all duration-300 bg-white hover:border-blue-300 group">
                      {/* Card Header */}
                      <div className="h-16 mb-3">
                        <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">{suggestion.title}</h4>
                      </div>

                      {/* Badges Section - Fixed Height */}
                      <div className="h-20 mb-4 space-y-2">
                        <Badge variant="outline" className="text-xs w-full justify-center bg-gray-50">{suggestion.niche}</Badge>
                        <Badge variant="secondary" className="text-xs w-full justify-center">{suggestion.targetAudience}</Badge>
                        <Badge variant="outline" className="text-xs w-full justify-center bg-blue-50 text-blue-700 border-blue-200">{suggestion.wordCount.toLocaleString()} words</Badge>
                      </div>

                      {/* Description - Fixed Height */}
                      <div className="h-16 mb-4">
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{suggestion.description}</p>
                      </div>

                      {/* Action Buttons - Fixed Height */}
                      <div className="h-20 space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            const newPrompt = createBookPrompt({
                              prompt: suggestion.prompt,
                              niche: suggestion.niche,
                              targetAudience: suggestion.targetAudience,
                              wordCount: suggestion.wordCount
                            });
                            setCurrentPrompt(newPrompt);
                            handleGenerateBook(newPrompt);
                          }}
                        >
                          <Sparkles className="h-3 w-3 mr-2" />
                          Generate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                          onClick={() => handlePreviewSuggestion(suggestion)}
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))
                ];
              })()}
            </div>

            {/* Gradient Overlays for Smooth Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white to-transparent pointer-events-none"></div>

            {/* Pause Indicator */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-600 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Hover to pause
            </div>

            {/* Drag Indicator */}
            {isDragging && (
              <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Dragging...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Book Prompt Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Book Prompt
              </CardTitle>
              <CardDescription>
                Describe your book idea and AI will generate the content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="book-prompt">Book Description *</Label>
                <textarea
                  id="book-prompt"
                  placeholder="Describe your book idea, topic, target audience, niche, and any specific requirements. For example: 'Write a comprehensive guide to starting a business from scratch, targeting entrepreneurs and beginners in the business niche, with practical steps and strategies.'"
                  className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={currentPrompt?.prompt || ''}
                  onChange={(e) => setCurrentPrompt(prev => prev ? { ...prev, prompt: e.target.value } : null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="word-count">Word Count</Label>
                <Input
                  id="word-count"
                  type="number"
                  placeholder="5000"
                  value={currentPrompt?.wordCount || 5000}
                  onChange={(e) => setCurrentPrompt(prev => prev ? { ...prev, wordCount: parseInt(e.target.value) || 5000 } : null)}
                />
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => currentPrompt && handleGenerateBook(currentPrompt)} 
                  disabled={isGenerating || !currentPrompt?.prompt}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating Book...
                    </>
                    ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Book
                    </>
                  )}
                </Button>

                {/* Bulk Operations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button 
                    onClick={handleBulkGenerateBooks}
                    disabled={isGenerating || !currentPrompt?.prompt}
                    variant="outline"
                    size="sm"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Bulk Generate
                  </Button>
                  <Button 
                    onClick={handleGeneratePendingBooks}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Pending
                  </Button>
                </div>

                {/* Advanced Operations */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button 
                    onClick={handleBulkResetPending}
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Pending
                  </Button>
                  <Button 
                    onClick={handleBulkGenerateKdpData}
                    variant="outline"
                    size="sm"
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Generate KDP Data
                  </Button>
                  <Button 
                    onClick={handleRetryFailedUploads}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Uploads
                  </Button>
                </div>

                {/* Danger Zone */}
                <div className="pt-2 border-t border-gray-200">
                  <Button 
                    onClick={handleBulkClearAll}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Progress */}
          {isGenerating && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Generation Progress
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (currentPrompt) {
                        const bookId = Date.now().toString();
                        pollGenerationStatus(bookId);
                      }
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Status
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Generating your book... This may take a few minutes.
                </div>
                {generationSteps.map((step) => (
                  <div key={step.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn(
                        step.status === 'completed' && 'text-green-600',
                        step.status === 'running' && 'text-blue-600',
                        step.status === 'error' && 'text-red-600'
                      )}>
                        {step.name}
                      </span>
                      <span className="text-muted-foreground">
                        {step.progress}%
                      </span>
                    </div>
                    <Progress value={step.progress} className="h-2" />
                  </div>
                ))}
                <div className="text-xs text-muted-foreground mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <strong>Note:</strong> If the generation seems stuck, click "Check Status" to manually refresh the progress.
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {generatedBooks.length > 0 ? (
            <>
              {/* Generated Books Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Generated Books ({generatedBooks.length})
                      </CardTitle>
                      <CardDescription>
                        All books have been successfully generated!
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => generatedBooks[0] && handleSaveBook(generatedBooks[0])}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Book
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => generatedBooks[0] && handleDownloadBook(generatedBooks[0])}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Book
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6">
                    {generatedBooks.map((book) => (
                      <div key={book.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-200 relative bg-white">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          <div className="relative flex-shrink-0">
                            <img 
                              src={book.coverUrl} 
                              alt={book.title}
                              className="w-16 h-24 sm:w-18 sm:h-28 object-cover rounded-lg border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base mb-2 line-clamp-2 text-gray-900">{book.title}</h4>
                            <p className="text-sm text-blue-600 font-medium mb-3">{book.niche}</p>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium">{book.targetAudience}</Badge>
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 font-medium">{book.wordCount.toLocaleString()} words</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-100 gap-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Generated on {new Date(book.createdAt).toLocaleDateString()}</span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 font-medium self-start sm:self-center">
                            {book.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-3">
                          <div className="relative dropdown-container flex-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                              onClick={(e) => handleViewDropdown(book, e)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>

                            {/* Professional Dropdown View */}
                            {showDropdown === book.id && selectedBookForDropdown && (
                              <div 
                                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] w-full max-w-sm sm:max-w-md backdrop-blur-sm"
                                data-dropdown={book.id}
                              >
                                {/* Arrow indicator */}
                                <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>

                                <div className="p-4 sm:p-5">
                                  {/* Header with close button */}
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="relative">
                                        <img 
                                          src={selectedBookForDropdown.coverUrl} 
                                          alt={selectedBookForDropdown.title}
                                          className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-lg border shadow-md flex-shrink-0"
                                        />
                                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm mb-1 line-clamp-2 text-gray-900">{selectedBookForDropdown.title}</h4>
                                        <p className="text-xs text-blue-600 font-medium mb-1">{selectedBookForDropdown.niche}</p>
                                        <div className="flex flex-wrap items-center gap-1 mb-2">
                                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{selectedBookForDropdown.targetAudience}</Badge>
                                          <Badge variant="secondary" className="text-xs bg-gray-100">{selectedBookForDropdown.wordCount.toLocaleString()} words</Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                      onClick={closeDropdown}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  {/* Stats Grid */}
                                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                      <div className="text-base sm:text-lg font-bold text-blue-700">{Math.max(3, Math.floor(selectedBookForDropdown.wordCount / 2000))}</div>
                                      <div className="text-xs text-blue-600 font-medium">Chapters</div>
                                    </div>
                                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                      <div className="text-base sm:text-lg font-bold text-green-700">A+</div>
                                      <div className="text-xs text-green-600 font-medium">Quality</div>
                                    </div>
                                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                      <div className="text-base sm:text-lg font-bold text-purple-700">{selectedBookForDropdown.wordCount > 10000 ? 'Premium' : 'Standard'}</div>
                                      <div className="text-xs text-purple-600 font-medium">Tier</div>
                                    </div>
                                  </div>

                                  <Separator className="my-4" />

                                  {/* Content Preview */}
                                  <div className="mb-4">
                                    <h5 className="font-semibold text-sm mb-3 flex items-center gap-2 text-gray-800">
                                      <FileText className="h-4 w-4 text-blue-600" />
                                      Content Preview
                                    </h5>
                                    <div className="max-h-24 sm:max-h-28 overflow-y-auto p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 text-xs leading-relaxed">
                                      <div className="space-y-2">
                                        <p className="font-semibold text-gray-800">
                                          📚 Table of Contents
                                        </p>
                                        <p className="text-gray-700">
                                          This comprehensive guide provides essential knowledge and practical strategies for success in <span className="font-medium text-blue-600">{selectedBookForDropdown.niche.toLowerCase()}</span>. Tailored specifically for <span className="font-medium text-green-600">{selectedBookForDropdown.targetAudience.toLowerCase()}</span>, this book contains <span className="font-bold">{selectedBookForDropdown.wordCount.toLocaleString()} words</span> of high-quality, actionable content.
                                        </p>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <span className="text-xs">Professional writing style</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="text-xs">SEO optimized content</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                          <span className="text-xs">Engaging storytelling</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
                                    <Button 
                                      variant="default" 
                                      size="sm" 
                                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                      onClick={() => handleViewGeneratedBook(selectedBookForDropdown)}
                                    >
                                      <Eye className="h-3 w-3 mr-2" />
                                      Full View
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                                      onClick={() => handleDownloadGeneratedBook(selectedBookForDropdown)}
                                    >
                                      <Download className="h-3 w-3 mr-2" />
                                      Download
                                    </Button>
                                  </div>

                                  {/* Footer */}
                                  <div className="mt-4 pt-3 border-t border-gray-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-2">
                                      <span>Generated on {new Date(selectedBookForDropdown.createdAt).toLocaleDateString()}</span>
                                      <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Ready to publish
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors duration-200"
                            onClick={() => handleDownloadGeneratedBook(book)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <div className="flex-1">
                            <input
                              type="file"
                              id={`upload-${book.id}`}
                              accept=".pdf,.epub,.mobi,.docx"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadBook(book, file);
                                }
                              }}
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200"
                              onClick={() => document.getElementById(`upload-${book.id}`)?.click()}
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Empty State - Formal View */
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Book Generation Workspace
                    </CardTitle>
                                         <CardDescription>
                       Enter your book description to start generating
                     </CardDescription>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Ready
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                                     <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-6">
                     <FileText className="h-12 w-12 text-blue-600" />
                   </div>

                   <h3 className="text-xl font-semibold text-gray-900 mb-3">
                     Ready to Generate Books
                   </h3>

                   <p className="text-gray-600 mb-6 max-w-md mx-auto">
                     Describe your book idea in detail and AI will generate high-quality content tailored to your requirements.
                   </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-green-800 mb-1 text-sm sm:text-base">Write Prompt</h4>
                      <p className="text-xs sm:text-sm text-green-700">Describe your book idea and topic</p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-blue-800 mb-1 text-sm sm:text-base">AI Generation</h4>
                      <p className="text-xs sm:text-sm text-blue-700">AI creates comprehensive book content</p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Download className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-purple-800 mb-1 text-sm sm:text-base">Download</h4>
                      <p className="text-xs sm:text-sm text-purple-700">Get your professionally formatted book</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-500">
                      Start by entering your book prompt above
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Target className="h-4 w-4 text-blue-600" />
                    What You'll Get
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Professional book content with chapters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">SEO-optimized writing style</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Target audience-specific content</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Customizable word count</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Multiple format downloads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Professional formatting</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Book View Modal */}
      {showBookView && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold line-clamp-2">{selectedBook.title}</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {selectedBook.niche} • {selectedBook.targetAudience} • {selectedBook.wordCount.toLocaleString()} words
                </p>
              </div>
              <Button variant="outline" onClick={closeBookView} className="flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                  {selectedBook.content}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-t bg-gray-50 gap-3">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Generated on {new Date(selectedBook.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleDownloadGeneratedBook(selectedBook)}
                  size="sm"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Download Book
                </Button>
                <Button onClick={closeBookView} size="sm">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredFeature="Book Creation"
        currentPlan={user?.subscription?.plan || 'free'}
      />
      </div>
    </div>
      </CreateBookProvider>

  );
};