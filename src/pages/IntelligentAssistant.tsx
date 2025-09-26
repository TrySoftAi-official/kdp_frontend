import React, { useState, useEffect } from 'react';
import { CreateBookProvider } from '@/components/create-book/CreateBookContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from '@/utils/toast';
import { KDPCredentialsModal } from '@/components/shared/KDPCredentialsModal';

// Custom hooks
import { useBookGeneration, BookPrompt, GeneratedBook } from '@/hooks/useBookGeneration';
import { useKdpManagement } from '@/hooks/useKdpManagement';
import { useBookQueue } from '@/hooks/useBookQueue';
import { useApiStatus } from '@/hooks/useApiStatus';
import { useUiState } from '@/hooks/useUiState';


// Components
import { StatusCard } from '@/components/intelligent-assistant/StatusCard';
import { BookCard } from '@/components/intelligent-assistant/BookCard';
import { BookPromptCard } from '@/components/intelligent-assistant/BookPromptCard';
import { BookSlider } from '@/components/intelligent-assistant/BookSlider';
import { BookViewModal } from '@/components/intelligent-assistant/BookViewModal';
import { EmptyStateCard } from '@/components/intelligent-assistant/EmptyStateCard';


// Types are now imported from hooks

export const IntelligentAssistant: React.FC = () => {
  
  // Custom hooks for state management
  const bookGeneration = useBookGeneration();
  const kdpManagement = useKdpManagement();
  const bookQueue = useBookQueue();
  const apiStatus = useApiStatus();
  const uiState = useUiState();
  
  // Local state for current prompt
  const [currentPrompt, setCurrentPrompt] = useState<BookPrompt | null>(null);

  // Initialize hooks on mount
  useEffect(() => {
    apiStatus.testBackendConnection();
    apiStatus.fetchEnvStatus();
    apiStatus.fetchApiBooks();
    bookQueue.syncBookQueueWithBackend();
    kdpManagement.checkAmazonKDPSession();
  }, []);

  // Initialize currentPrompt with empty values
  useEffect(() => {
    if (!currentPrompt) {
      setCurrentPrompt({
        id: '',
        prompt: '',
        niche: '',
        targetAudience: '',
        keywords: '',
        description: '',
        createdAt: ''
      });
    }
  }, [currentPrompt]);

  // Handle worker errors
  useEffect(() => {
    if (bookGeneration.workerError) {
      toast.error(`Generation error: ${bookGeneration.workerError}`);
    }
  }, [bookGeneration.workerError]);

  // Handle pending books errors
  useEffect(() => {
    if (bookGeneration.pendingBooksError) {
      toast.error(`Pending books generation error: ${bookGeneration.pendingBooksError}`);
    }
  }, [bookGeneration.pendingBooksError]);

  // Handle pending books results
  useEffect(() => {
    if (bookGeneration.pendingBooksResult) {
      toast.success('Books generated successfully! Check your book queue.');
      bookQueue.syncBookQueueWithBackend();
    }
  }, [bookGeneration.pendingBooksResult]);

  // Wrapper functions that delegate to hooks
  const handleGenerateBook = async (prompt: BookPrompt) => {
    if (!kdpManagement.amazonKDPSession.isConnected) {
      uiState.setShowKDPCredentialsModal(true);
      return;
    }
    await bookGeneration.generateBook(prompt);
  };

  const handleAutoGenerateBooks = async (numberOfBooks: number) => {
    await bookGeneration.autoGenerateBooks(numberOfBooks);
  };

  const handleGenerateFullBook = async (book: GeneratedBook) => {
    await bookGeneration.generateFullBook(book);
  };

  const handleGenerateKdpData = async (book: GeneratedBook) => {
    await kdpManagement.generateKdpData(book);
  };

  const handleEditKdpData = async (book: GeneratedBook) => {
    uiState.setSelectedBookForEdit(book);
    uiState.setShowKdpEditModal(true);
  };

  const handleSaveKdpData = async (book: GeneratedBook, editedData: any) => {
    await kdpManagement.saveKdpData(book, editedData);
    uiState.setShowKdpEditModal(false);
    uiState.setSelectedBookForEdit(null);
  };

  const handleUploadBook = async (book: GeneratedBook) => {
    await kdpManagement.uploadBook(book);
  };

  const handleSaveBook = async (book: GeneratedBook) => {
    await bookGeneration.saveBook(book);
  };

  const handlePreviewSuggestion = (suggestion: any) => {
    uiState.handlePreviewSuggestion(suggestion);
  };

  const handleViewGeneratedBook = (book: GeneratedBook) => {
    uiState.setSelectedBook(book);
    uiState.setShowBookView(true);
  };

  const handleConnectKdp = () => {
    uiState.setShowKDPCredentialsModal(true);
  };

  return (
    <CreateBookProvider>
      <div className="min-h-screen bg-gray-50 page-container">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
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
              {apiStatus.envStatus && (
                <Badge 
                  variant="default"
                  className="flex items-center gap-1"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  System Online
                </Badge>
              )}
              <Badge 
                variant={kdpManagement.amazonKDPSession.isConnected ? 'default' : 'destructive'}
                className="flex items-center gap-1"
              >
                <div className={`w-2 h-2 rounded-full ${kdpManagement.amazonKDPSession.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {kdpManagement.amazonKDPSession.isConnected ? 'KDP Connected' : 'KDP Disconnected'}
              </Badge>
            </div>
          </div>

          {/* Error Display */}
          {bookGeneration.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error:</span>
                <span>{bookGeneration.error}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => bookGeneration.setError('')}
                  className="ml-auto text-red-700 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusCard 
              title="Backend Connection"
              status={apiStatus.backendConnectionStatus === 'connected' ? 'connected' : 
                     apiStatus.backendConnectionStatus === 'checking' ? 'checking' : 'disconnected'}
              description={apiStatus.backendConnectionStatus === 'connected' ? 'API is responsive' : 
                          apiStatus.backendConnectionStatus === 'checking' ? 'Checking connection...' : 'API is not responding'}
              onRefresh={apiStatus.testBackendConnection}
              isLoading={apiStatus.backendConnectionStatus === 'checking'}
            />
            <StatusCard 
              title="KDP Connection"
              status={kdpManagement.amazonKDPSession.isConnected ? 'connected' : 'disconnected'}
              description={kdpManagement.amazonKDPSession.isConnected ? 'Amazon KDP is connected' : 'Amazon KDP not connected'}
              onRefresh={() => kdpManagement.checkAmazonKDPSession(true)}
              isLoading={kdpManagement.isCheckingKDPStatus}
            >
              {!kdpManagement.amazonKDPSession.isConnected && (
                <Button onClick={handleConnectKdp} size="sm" className="mt-2">
                  Connect KDP
                </Button>
              )}
            </StatusCard>
            <StatusCard 
              title="Book Queue"
              status={bookQueue.bookQueue && bookQueue.bookQueue.book_queue && bookQueue.bookQueue.book_queue.length > 0 ? 'connected' : 'disconnected'}
              description={`${bookQueue.bookQueue?.book_queue?.length || 0} books in queue`}
              onRefresh={bookQueue.syncBookQueueWithBackend}
            />
          </div>

          {/* Book Prompt Input */}
          <BookPromptCard 
            currentPrompt={currentPrompt}
            isGenerating={bookGeneration.isGenerating}
            isKdpConnected={kdpManagement.amazonKDPSession.isConnected}
            onPromptChange={setCurrentPrompt}
            onGenerateBook={handleGenerateBook}
            onAutoGenerateBooks={handleAutoGenerateBooks}
            onConnectKdp={handleConnectKdp}
          />

          {/* Book Suggestions Slider */}
          {apiStatus.apiBooks && apiStatus.apiBooks.length > 0 && (
            <BookSlider 
              suggestions={apiStatus.apiBooks}
              isLoading={apiStatus.isLoadingApiBooks}
              error={apiStatus.apiBooksError}
              onGenerateBook={(suggestion) => {
                const prompt = {
                  id: Date.now().toString(),
                  prompt: suggestion.prompt || suggestion.title,
                  niche: suggestion.niche,
                  targetAudience: suggestion.targetAudience,
                  description: suggestion.description,
                  createdAt: new Date().toISOString()
                };
                handleGenerateBook(prompt);
              }}
              onPreviewSuggestion={handlePreviewSuggestion}
              onRefresh={apiStatus.fetchApiBooks}
              onClearError={() => apiStatus.setApiBooksError('')}
            />
          )}

          {/* Generated Books Display */}
          {bookGeneration.generatedBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookGeneration.generatedBooks.map((book) => (
                <BookCard 
                  key={book.id}
                  book={book}
                  isGenerating={bookGeneration.generatingBookIds.has(book.id)}
                  isUploading={kdpManagement.isUploading}
                  onViewBook={handleViewGeneratedBook}
                  onSaveBook={handleSaveBook}
                  onGenerateFullBook={handleGenerateFullBook}
                  onGenerateKdpData={handleGenerateKdpData}
                  onEditKdpData={handleEditKdpData}
                  onUploadBook={handleUploadBook}
                />
              ))}
            </div>
          ) : (
            <EmptyStateCard />
          )}

          {/* Book View Modal */}
          <BookViewModal 
            isOpen={uiState.showBookView}
            book={uiState.selectedBook}
            onClose={uiState.closeBookView}
          />

          {/* KDP Credentials Modal */}
          {uiState.showKDPCredentialsModal && (
            <KDPCredentialsModal
              isOpen={uiState.showKDPCredentialsModal}
              onClose={() => uiState.setShowKDPCredentialsModal(false)}
              onSuccess={kdpManagement.handleKDPConnectionSuccess}
            />
          )}

          {/* KDP Edit Modal */}
          {uiState.showKdpEditModal && uiState.selectedBookForEdit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Edit KDP Data</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        uiState.setShowKdpEditModal(false);
                        uiState.setSelectedBookForEdit(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Author Name</label>
                      <Input
                        value={uiState.selectedBookForEdit.authorName || ''}
                        onChange={(e) => {
                          uiState.setSelectedBookForEdit((prev: GeneratedBook | null) => prev ? { 
                            ...prev, 
                            authorName: e.target.value 
                          } : null);
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Price</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={uiState.selectedBookForEdit.price || ''}
                        onChange={(e) => {
                          uiState.setSelectedBookForEdit((prev: GeneratedBook | null) => prev ? { 
                            ...prev, 
                            price: parseFloat(e.target.value) || 0 
                          } : null);
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Input
                        value={uiState.selectedBookForEdit.kdpFormData?.description || ''}
                        onChange={(e) => {
                          uiState.setSelectedBookForEdit((prev: GeneratedBook | null) => prev ? { 
                            ...prev, 
                            kdpFormData: { ...prev.kdpFormData, description: e.target.value }
                          } : null);
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Keywords</label>
                      <Input
                        value={uiState.selectedBookForEdit.kdpFormData?.keywords || ''}
                        onChange={(e) => {
                          uiState.setSelectedBookForEdit((prev: GeneratedBook | null) => prev ? { 
                            ...prev, 
                            kdpFormData: { ...prev.kdpFormData, keywords: e.target.value }
                          } : null);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        uiState.setShowKdpEditModal(false);
                        uiState.setSelectedBookForEdit(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (uiState.selectedBookForEdit) {
                          const editedData = {
                            author_name: uiState.selectedBookForEdit.authorName,
                            price: uiState.selectedBookForEdit.price,
                            description: uiState.selectedBookForEdit.kdpFormData?.description,
                            keywords: uiState.selectedBookForEdit.kdpFormData?.keywords
                          };
                          handleSaveKdpData(uiState.selectedBookForEdit, editedData);
                        }
                      }}
                      disabled={kdpManagement.isUploading}
                    >
                      {kdpManagement.isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CreateBookProvider>
  );
};

export default IntelligentAssistant;
