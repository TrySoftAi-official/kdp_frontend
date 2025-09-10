import React, { useState, useEffect } from 'react';
import { Upload, Filter, Search, Eye, Edit, Trash2, BookOpen, DollarSign, TrendingUp, Loader2, RefreshCw, Settings, Monitor, Database, Server, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Book } from '@/types';
import { useDynamicApi } from '@/hooks/useDynamicApi';
import { useApi } from '@/hooks/useApi';
import { ApiErrorHandler } from '@/components/ApiErrorHandler';
import { toast } from '@/lib/toast';
import { 
  AdditionalService, 
  ConfigurationUpdate,
  UploadProgressResponse,
  BookStatusDebugResponse,
  BookQueueResponse,
  EnvStatusResponse
} from '@/api/additionalService';

// Extended Book interface to include more fields
interface ExtendedBook extends Book {
  coverUrl?: string;
  niche?: string;
  targetAudience?: string;
  wordCount?: number;
  content?: string;
  savedAt?: string;
  publishedAt?: string;
}

export const Books: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Additional service states
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  
  // Configuration states
  const [configuration, setConfiguration] = useState<ConfigurationUpdate>({});
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  // Bulk operations states
  const [isBulkClearing, setIsBulkClearing] = useState(false);
  const [isResettingPending, setIsResettingPending] = useState(false);
  const [isGeneratingKdpData, setIsGeneratingKdpData] = useState(false);
  const [bulkOperationResult, setBulkOperationResult] = useState<string>('');

  // Upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressResponse | null>(null);
  const [isRetryingUploads, setIsRetryingUploads] = useState(false);

  // Debug and monitoring states
  const [debugBookId, setDebugBookId] = useState('');
  const [bookDebugInfo, setBookDebugInfo] = useState<BookStatusDebugResponse | null>(null);
  const [bookQueue, setBookQueue] = useState<BookQueueResponse | null>(null);
  const [envStatus, setEnvStatus] = useState<EnvStatusResponse | null>(null);
  const [isLoadingDebug, setIsLoadingDebug] = useState(false);

  // Initialize dynamic API
  const {
    isLoading,
    isError,
    error,
    isRefetching,
    books: booksApi,
    retry
  } = useDynamicApi({
    enableAutoRefresh: true,
    refreshInterval: 30000,
    enableErrorNotifications: true,
    enableSuccessNotifications: true
  });

  // Get real-time data using React Query hooks
  const { books: booksHooks } = useApi();
  const { 
    data: booksData, 
    isLoading: booksLoading, 
    error: booksError,
    refetch: refetchBooks 
  } = booksHooks.useBooks(page, limit, {}, { field: 'createdAt', direction: 'desc' });

  // Get books from API data
  const books = booksData?.books || [];
  const totalBooks = booksData?.pagination?.total || 0;
  const totalPages = booksData?.pagination?.totalPages || 1;
  const loading = booksLoading || isLoading;

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchBooks();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchBooks]);

  const filteredBooks = books.filter(book => {
    const extendedBook = book as ExtendedBook;
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (extendedBook.niche && extendedBook.niche.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'saved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'generated': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return '✓';
      case 'saved': return '💾';
      case 'generated': return '✨';
      case 'processing': return '⏳';
      case 'failed': return '❌';
      default: return '•';
    }
  };

  const handleViewBook = async (book: ExtendedBook) => {
    try {
      // Implement view book functionality
      console.log('Viewing book:', book.title);
      toast.success(`Opening ${book.title}`);
    } catch (error) {
      toast.error('Failed to open book');
    }
  };

  const handleEditBook = async (book: ExtendedBook) => {
    try {
      // Implement edit book functionality
      console.log('Editing book:', book.title);
      toast.success(`Editing ${book.title}`);
    } catch (error) {
      toast.error('Failed to edit book');
    }
  };

  const handleDeleteBook = async (book: ExtendedBook) => {
    try {
      // Use the original hooks for delete operation
      const deleteMutation = booksHooks.useDeleteBook();
      await deleteMutation.mutateAsync(book.id);
      toast.success(`Deleted ${book.title}`);
      refetchBooks();
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const handlePublishBook = async (book: ExtendedBook) => {
    try {
      await booksApi.publishBook(book.id, 'kdp');
      toast.success(`Publishing ${book.title}`);
      refetchBooks();
    } catch (error) {
      toast.error('Failed to publish book');
    }
  };

  const handleRefresh = async () => {
    try {
      await refetchBooks();
      toast.success('Books refreshed');
    } catch (error) {
      toast.error('Failed to refresh books');
    }
  };

  // Book selection handlers (for future use)
  // const handleSelectBook = (bookId: string) => {
  //   setSelectedBooks(prev => 
  //     prev.includes(bookId) 
  //       ? prev.filter(id => id !== bookId)
  //       : [...prev, bookId]
  //   );
  // };

  // const handleSelectAllBooks = () => {
  //   if (selectedBooks.length === filteredBooks.length) {
  //     setSelectedBooks([]);
  //   } else {
  //     setSelectedBooks(filteredBooks.map(book => book.id));
  //   }
  // };

  // Configuration Management Functions
  const handleUpdateConfiguration = async () => {
    setIsUpdatingConfig(true);
    try {
      await AdditionalService.updateConfiguration(configuration);
      toast.success('Configuration updated successfully!');
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error('Failed to update configuration. Please try again.');
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  // Bulk Operations Functions
  const handleBulkClearAll = async () => {
    setIsBulkClearing(true);
    setBulkOperationResult('');
    try {
      await AdditionalService.bulkClearAll({
        confirm: true,
        includeBooks: true,
        includeUsers: false,
        includeAnalytics: false
      });
      setBulkOperationResult('Bulk clear operation completed successfully!');
      toast.success('Bulk clear operation completed!');
      refetchBooks();
    } catch (error) {
      console.error('Error in bulk clear:', error);
      setBulkOperationResult('Failed to perform bulk clear operation.');
      toast.error('Failed to perform bulk clear operation.');
    } finally {
      setIsBulkClearing(false);
    }
  };

  const handleBulkResetPending = async () => {
    setIsResettingPending(true);
    setBulkOperationResult('');
    try {
      await AdditionalService.bulkResetPending({
        resetAll: true
      });
      setBulkOperationResult('Pending books reset successfully!');
      toast.success('Pending books reset successfully!');
      refetchBooks();
    } catch (error) {
      console.error('Error resetting pending books:', error);
      setBulkOperationResult('Failed to reset pending books.');
      toast.error('Failed to reset pending books.');
    } finally {
      setIsResettingPending(false);
    }
  };

  const handleBulkGenerateKdpData = async () => {
    setIsGeneratingKdpData(true);
    setBulkOperationResult('');
    try {
      await AdditionalService.bulkGenerateKdpData({
        generateAll: true,
        includeMetadata: true
      });
      setBulkOperationResult('KDP data generated successfully!');
      toast.success('KDP data generated successfully!');
      refetchBooks();
    } catch (error) {
      console.error('Error generating KDP data:', error);
      setBulkOperationResult('Failed to generate KDP data.');
      toast.error('Failed to generate KDP data.');
    } finally {
      setIsGeneratingKdpData(false);
    }
  };

  // Upload Functions
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUploadBook = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const file = selectedFiles[0];
      await AdditionalService.uploadBook({
        bookId: `book_${Date.now()}`,
        file: file,
        format: file.name.split('.').pop() as any,
        metadata: { uploadedAt: new Date().toISOString() }
      });

      toast.success('Book uploaded successfully!');
      setSelectedFiles([]);
      refetchBooks();
    } catch (error) {
      console.error('Error uploading book:', error);
      toast.error('Failed to upload book. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkUploadBooks = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const books = selectedFiles.map((file, index) => ({
        bookId: `book_${Date.now()}_${index}`,
        file: file,
        format: file.name.split('.').pop() || 'pdf',
        metadata: { uploadedAt: new Date().toISOString() }
      }));

      await AdditionalService.bulkUploadBooks({ books });
      toast.success(`Successfully uploaded ${selectedFiles.length} books!`);
      setSelectedFiles([]);
      refetchBooks();
    } catch (error) {
      console.error('Error bulk uploading books:', error);
      toast.error('Failed to bulk upload books. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGetUploadProgress = async () => {
    try {
      const response = await AdditionalService.getUploadProgress();
      setUploadProgress(response.data);
    } catch (error) {
      console.error('Error getting upload progress:', error);
      toast.error('Failed to get upload progress.');
    }
  };

  const handleRetryFailedUploads = async () => {
    setIsRetryingUploads(true);
    try {
      await AdditionalService.retryFailedUploads({
        retryAll: true
      });
      toast.success('Failed uploads retried successfully!');
      refetchBooks();
    } catch (error) {
      console.error('Error retrying failed uploads:', error);
      toast.error('Failed to retry uploads. Please try again.');
    } finally {
      setIsRetryingUploads(false);
    }
  };

  // Debug and Monitoring Functions
  const handleDebugBookStatus = async () => {
    if (!debugBookId.trim()) {
      toast.error('Please enter a book ID to debug.');
      return;
    }

    setIsLoadingDebug(true);
    try {
      const response = await AdditionalService.debugBookStatus(debugBookId);
      setBookDebugInfo(response.data);
    } catch (error) {
      console.error('Error debugging book status:', error);
      toast.error('Failed to get book debug info. Please try again.');
    } finally {
      setIsLoadingDebug(false);
    }
  };

  const handleGetBookQueue = async () => {
    setIsLoadingDebug(true);
    try {
      const response = await AdditionalService.getBookQueue();
      setBookQueue(response.data);
    } catch (error) {
      console.error('Error getting book queue:', error);
      toast.error('Failed to get book queue. Please try again.');
    } finally {
      setIsLoadingDebug(false);
    }
  };

  const handleGetEnvStatus = async () => {
    setIsLoadingDebug(true);
    try {
      const response = await AdditionalService.getEnvStatus();
      setEnvStatus(response.data);
    } catch (error) {
      console.error('Error getting environment status:', error);
      toast.error('Failed to get environment status. Please try again.');
    } finally {
      setIsLoadingDebug(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Books</h1>
          <p className="text-muted-foreground">
            View and manage your AI-generated books
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowAdvancedTools(!showAdvancedTools)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced Tools
          </Button>
          <Button asChild>
            <a href="/create">Create New Book</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/publish">Publish Books</a>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {(isError || booksError) && (
        <ApiErrorHandler
          error={error || booksError}
          onRetry={retry}
          title="Failed to load books"
          description="Unable to fetch your books. Please try again."
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Books</p>
                <p className="text-2xl font-bold">{totalBooks}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{books.filter(b => b.status === 'published').length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${books.reduce((sum, b) => sum + b.revenue, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg ROAS</p>
                <p className="text-2xl font-bold">
                  {books.filter(b => b.roas > 0).length > 0 
                    ? (books.filter(b => b.roas > 0).reduce((sum, b) => sum + b.roas, 0) / books.filter(b => b.roas > 0).length).toFixed(2)
                    : '0.00'}x
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Tools Section */}
      {showAdvancedTools && (
        <div className="space-y-4">
          {/* Configuration Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="config-key">Configuration Key</Label>
                  <Input
                    id="config-key"
                    placeholder="Enter configuration key"
                    onChange={(e) => setConfiguration({ ...configuration, key: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="config-value">Configuration Value</Label>
                  <Input
                    id="config-value"
                    placeholder="Enter configuration value"
                    onChange={(e) => setConfiguration({ ...configuration, value: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                onClick={handleUpdateConfiguration}
                disabled={isUpdatingConfig}
                variant="outline"
                className="w-full"
              >
                {isUpdatingConfig ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                    Updating Configuration...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Update Configuration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Bulk Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button 
                  onClick={handleBulkClearAll}
                  disabled={isBulkClearing}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {isBulkClearing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Books
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleBulkResetPending}
                  disabled={isResettingPending}
                  variant="outline"
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                >
                  {isResettingPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Pending
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleBulkGenerateKdpData}
                  disabled={isGeneratingKdpData}
                  variant="outline"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  {isGeneratingKdpData ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Generate KDP Data
                    </>
                  )}
                </Button>
              </div>

              {bulkOperationResult && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-700">{bulkOperationResult}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Book Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Files</Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.epub,.mobi,.docx"
                  onChange={handleFileSelection}
                />
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Selected {selectedFiles.length} file(s): {selectedFiles.map(f => f.name).join(', ')}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleUploadBook}
                  disabled={isUploading || selectedFiles.length === 0}
                  variant="outline"
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Single Book
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleBulkUploadBooks}
                  disabled={isUploading || selectedFiles.length === 0}
                  variant="outline"
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Upload
                    </>
                  )}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleGetUploadProgress}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Check Progress
                </Button>

                <Button 
                  onClick={handleRetryFailedUploads}
                  disabled={isRetryingUploads}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {isRetryingUploads ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Failed
                    </>
                  )}
                </Button>
              </div>

              {uploadProgress && (
                <div className="bg-gray-50 border rounded-lg p-3">
                  <h4 className="font-semibold mb-2">Upload Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status: {uploadProgress.status}</span>
                      <span>{uploadProgress.progress}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completed: {uploadProgress.completedFiles}/{uploadProgress.totalFiles}</span>
                      <span>Failed: {uploadProgress.failedFiles}</span>
                    </div>
                    {uploadProgress.currentFile && (
                      <p className="text-sm text-gray-600">Current: {uploadProgress.currentFile}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debug and Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Debug & Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="debug-book-id">Book ID for Debug</Label>
                <div className="flex gap-2">
                  <Input
                    id="debug-book-id"
                    placeholder="Enter book ID"
                    value={debugBookId}
                    onChange={(e) => setDebugBookId(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleDebugBookStatus}
                    disabled={isLoadingDebug}
                    variant="outline"
                    size="sm"
                  >
                    {isLoadingDebug ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    ) : (
                      'Debug'
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleGetBookQueue}
                  disabled={isLoadingDebug}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoadingDebug ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Book Queue
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleGetEnvStatus}
                  disabled={isLoadingDebug}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoadingDebug ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Server className="h-4 w-4 mr-2" />
                      System Status
                    </>
                  )}
                </Button>
              </div>

              {/* Debug Results */}
              {bookDebugInfo && (
                <div className="bg-gray-50 border rounded-lg p-3">
                  <h4 className="font-semibold mb-2">Book Debug Info</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Book ID:</strong> {bookDebugInfo.bookId}</p>
                    <p><strong>Status:</strong> {bookDebugInfo.status}</p>
                    {bookDebugInfo.details.generationStatus && (
                      <p><strong>Generation Status:</strong> {bookDebugInfo.details.generationStatus}</p>
                    )}
                    {bookDebugInfo.details.uploadStatus && (
                      <p><strong>Upload Status:</strong> {bookDebugInfo.details.uploadStatus}</p>
                    )}
                    {bookDebugInfo.details.publishStatus && (
                      <p><strong>Publish Status:</strong> {bookDebugInfo.details.publishStatus}</p>
                    )}
                    {bookDebugInfo.details.lastActivity && (
                      <p><strong>Last Activity:</strong> {bookDebugInfo.details.lastActivity}</p>
                    )}
                    {bookDebugInfo.details.errors && bookDebugInfo.details.errors.length > 0 && (
                      <div>
                        <strong>Errors:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {bookDebugInfo.details.errors.map((error, index) => (
                            <li key={index} className="text-red-600">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Book Queue Results */}
              {bookQueue && (
                <div className="bg-gray-50 border rounded-lg p-3">
                  <h4 className="font-semibold mb-2">Book Queue Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                    <div className="text-center">
                      <p className="font-semibold text-gray-600">Pending</p>
                      <p className="text-lg font-bold text-yellow-600">{bookQueue.totalPending}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-600">Running</p>
                      <p className="text-lg font-bold text-blue-600">{bookQueue.totalRunning}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-600">Completed</p>
                      <p className="text-lg font-bold text-green-600">{bookQueue.totalCompleted}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-600">Failed</p>
                      <p className="text-lg font-bold text-red-600">{bookQueue.totalFailed}</p>
                    </div>
                  </div>
                  {bookQueue.queue.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Recent Queue Items:</h5>
                      {bookQueue.queue.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-xs bg-white p-2 rounded">
                          <span>{item.type} - {item.status}</span>
                          <span className="text-gray-500">{new Date(item.createdAt).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Environment Status Results */}
              {envStatus && (
                <div className="bg-gray-50 border rounded-lg p-3">
                  <h4 className="font-semibold mb-2">System Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span><strong>Environment:</strong> {envStatus.environment}</span>
                      <span><strong>Version:</strong> {envStatus.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span><strong>Database:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          envStatus.database.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {envStatus.database.status}
                        </span>
                      </span>
                      <span><strong>Uptime:</strong> {Math.floor(envStatus.system.uptime / 3600)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span><strong>Memory:</strong> {envStatus.system.memory.percentage}%</span>
                      <span><strong>CPU:</strong> {envStatus.system.cpu.usage}%</span>
                    </div>
                    {Object.keys(envStatus.services).length > 0 && (
                      <div>
                        <strong>Services:</strong>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          {Object.entries(envStatus.services).map(([name, service]) => (
                            <div key={name} className="flex justify-between text-xs">
                              <span>{name}:</span>
                              <span className={`px-1 rounded ${
                                service.status === 'healthy' ? 'bg-green-100 text-green-800' :
                                service.status === 'unhealthy' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {service.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search books by title, author, or niche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="saved">Saved</option>
              <option value="generated">Generated</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Book Catalog ({filteredBooks.length} books)</span>
            {isRefetching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={(book as ExtendedBook).coverUrl || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center'} 
                      alt={book.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={`${getStatusColor(book.status)} border`}>
                        {getStatusIcon(book.status)} {book.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{book.title}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>By {book.author || 'AI Author'}</span>
                      </div>
                      
                      {(book as ExtendedBook).niche && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{(book as ExtendedBook).niche}</span>
                        </div>
                      )}
                      
                      {book.wordCount && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{book.wordCount.toLocaleString()} words</span>
                        </div>
                      )}
                    </div>

                    {book.status === 'published' && (
                      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-semibold">${book.revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ROAS</p>
                          <p className="font-semibold">{book.roas.toFixed(2)}x</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewBook(book)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {book.status === 'saved' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handlePublishBook(book)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Publish
                        </Button>
                      )}
                      
                      {book.status === 'generated' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditBook(book)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteBook(book)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {!loading && filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No books match your current filters.'
                  : 'You haven\'t created any books yet.'
                }
              </p>
              <Button asChild>
                <a href="/create">Create Your First Book</a>
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};