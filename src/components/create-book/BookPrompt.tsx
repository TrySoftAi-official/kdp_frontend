import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Sparkles, AlertCircle, ExternalLink, CheckCircle, BookOpen, Zap, Clock, Settings, Upload, Trash2, RefreshCw, Monitor, Database, Server } from 'lucide-react';
import { useCreateBookContext } from './CreateBookContext';
import { useAuth } from '../../redux/hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { AmazonKDPLoginModal } from './AmazonKDPLoginModal';
import { 
  // AdditionalService, 
  BookGenerationResponse, 
  ConfigurationUpdate,
  UploadProgressResponse,
  BookStatusDebugResponse,
  BookQueueResponse,
  EnvStatusResponse
} from '@/services/additionalService';

interface BookPromptProps {
  // Removed onGenerateBook as we're using additional service APIs directly
}

interface AmazonKDPSession {
  isConnected: boolean;
  lastConnected?: string;
  expiresAt?: string;
}

export const BookPrompt: React.FC<BookPromptProps> = () => {
  const { currentPrompt, setCurrentPrompt } = useCreateBookContext();
  const { user, isAuthenticated } = useAuth();
  const { getCurrentPlan } = usePermissions();
  
  const [amazonKDPSession, setAmazonKDPSession] = useState<AmazonKDPSession>({ isConnected: false });
  const [showKDPLoginModal, setShowKDPLoginModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  
  // Additional service states
  const [isGeneratingBook, setIsGeneratingBook] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [isGeneratingPending, setIsGeneratingPending] = useState(false);
  const [generatedBooks, setGeneratedBooks] = useState<BookGenerationResponse[]>([]);
  const [autoGenerateCount, setAutoGenerateCount] = useState(3);
  const [generationStatus, setGenerationStatus] = useState<string>('');

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

  // Check Amazon KDP session status
  useEffect(() => {
    checkAmazonKDPSession();
  }, []);

  const checkAmazonKDPSession = async () => {
    try {
      // Check if user has valid Amazon KDP session
      const sessionData = localStorage.getItem('amazon_kdp_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        
        if (expiresAt > now) {
          setAmazonKDPSession({
            isConnected: true,
            lastConnected: session.lastConnected,
            expiresAt: session.expiresAt
          });
        } else {
          // Session expired, clear it
          localStorage.removeItem('amazon_kdp_session');
          setAmazonKDPSession({ isConnected: false });
        }
      }
    } catch (error) {
      console.error('Error checking Amazon KDP session:', error);
      setAmazonKDPSession({ isConnected: false });
    }
  };

  const handlePromptChange = (value: string) => {
    if (currentPrompt) {
      setCurrentPrompt({ ...currentPrompt, prompt: value });
    }
    setValidationMessage('');
  };

  const handleWordCountChange = (value: string) => {
    if (currentPrompt) {
      setCurrentPrompt({ ...currentPrompt, wordCount: parseInt(value) || 5000 });
    }
  };

  const validateGenerationRequirements = (): { canGenerate: boolean; message: string } => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      return { canGenerate: false, message: "Please log in to continue." };
    }

    // Check Amazon KDP connection
    if (!amazonKDPSession.isConnected) {
      return { canGenerate: false, message: "Please connect to Amazon KDP to continue." };
    }

    // Check subscription plan
    const currentPlan = getCurrentPlan();
    if (currentPlan === 'free') {
      return { canGenerate: true, message: "Upgrade your plan to generate books." };
    }

    // Check if prompt is provided
    if (!currentPrompt?.prompt?.trim()) {
      return { canGenerate: false, message: "Please provide a book description." };
    }

    return { canGenerate: true, message: "" };
  };


  const handleKDPLoginSuccess = () => {
    // Store session data
    const session = {
      isConnected: true,
      lastConnected: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    localStorage.setItem('amazon_kdp_session', JSON.stringify(session));
    setAmazonKDPSession(session);
    setShowKDPLoginModal(false);
    setValidationMessage('');
  };

  const handleKDPLogout = () => {
    localStorage.removeItem('amazon_kdp_session');
    setAmazonKDPSession({ isConnected: false });
  };

  // Additional Service API Functions
  const handleGenerateBook = async () => {
    if (!currentPrompt?.prompt?.trim()) {
      setValidationMessage('Please provide a book description.');
      return;
    }

    setIsGeneratingBook(true);
    setGenerationStatus('Generating book...');
    setValidationMessage('');

    try {
      const response = await AdditionalService.generateBook({
        user_prompt: currentPrompt.prompt,
        n: 1
      });

      if (response.data) {
        setGeneratedBooks(prev => [...prev, response.data]);
        setGenerationStatus('Book generated successfully!');
        setValidationMessage('');
      }
    } catch (error) {
      console.error('Error generating book:', error);
      setValidationMessage('Failed to generate book. Please try again.');
      setGenerationStatus('');
    } finally {
      setIsGeneratingBook(false);
    }
  };

  const handleAutoGenerateBooks = async () => {
    setIsAutoGenerating(true);
    setGenerationStatus(`Auto-generating ${autoGenerateCount} books...`);
    setValidationMessage('');

    try {
      const response = await AdditionalService.autoGenerateBooks({
        n: autoGenerateCount
      });

      if (response.data) {
        setGeneratedBooks(prev => [...prev, response.data]);
        setGenerationStatus(`Successfully auto-generated ${autoGenerateCount} books!`);
        setValidationMessage('');
      }
    } catch (error) {
      console.error('Error auto-generating books:', error);
      setValidationMessage('Failed to auto-generate books. Please try again.');
      setGenerationStatus('');
    } finally {
      setIsAutoGenerating(false);
    }
  };


  // Configuration Management Functions
  const handleUpdateConfiguration = async () => {
    setIsUpdatingConfig(true);
    setValidationMessage('');

    try {
      await AdditionalService.updateConfiguration(configuration);
      setValidationMessage('Configuration updated successfully!');
    } catch (error) {
      console.error('Error updating configuration:', error);
      setValidationMessage('Failed to update configuration. Please try again.');
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
    } catch (error) {
      console.error('Error in bulk clear:', error);
      setBulkOperationResult('Failed to perform bulk clear operation.');
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
    } catch (error) {
      console.error('Error resetting pending books:', error);
      setBulkOperationResult('Failed to reset pending books.');
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
    } catch (error) {
      console.error('Error generating KDP data:', error);
      setBulkOperationResult('Failed to generate KDP data.');
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
      setValidationMessage('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setValidationMessage('');

    try {
      const file = selectedFiles[0];
      await AdditionalService.uploadBook({
        bookId: `book_${Date.now()}`,
        file: file,
        format: file.name.split('.').pop() as any,
        metadata: { uploadedAt: new Date().toISOString() }
      });

      setValidationMessage('Book uploaded successfully!');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error uploading book:', error);
      setValidationMessage('Failed to upload book. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkUploadBooks = async () => {
    if (selectedFiles.length === 0) {
      setValidationMessage('Please select files to upload.');
      return;
    }

    setIsUploading(true);
    setValidationMessage('');

    try {
      const books = selectedFiles.map((file, index) => ({
        bookId: `book_${Date.now()}_${index}`,
        file: file,
        format: file.name.split('.').pop() || 'pdf',
        metadata: { uploadedAt: new Date().toISOString() }
      }));

      await AdditionalService.bulkUploadBooks({ books });
      setValidationMessage(`Successfully uploaded ${selectedFiles.length} books!`);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error bulk uploading books:', error);
      setValidationMessage('Failed to bulk upload books. Please try again.');
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
    }
  };

  const handleRetryFailedUploads = async () => {
    setIsRetryingUploads(true);
    setValidationMessage('');

    try {
      await AdditionalService.retryFailedUploads({
        retryAll: true
      });
      setValidationMessage('Failed uploads retried successfully!');
    } catch (error) {
      console.error('Error retrying failed uploads:', error);
      setValidationMessage('Failed to retry uploads. Please try again.');
    } finally {
      setIsRetryingUploads(false);
    }
  };

  // Debug and Monitoring Functions
  const handleDebugBookStatus = async () => {
    if (!debugBookId.trim()) {
      setValidationMessage('Please enter a book ID to debug.');
      return;
    }

    setIsLoadingDebug(true);
    setValidationMessage('');

    try {
      const response = await AdditionalService.debugBookStatus(debugBookId);
      setBookDebugInfo(response.data);
    } catch (error) {
      console.error('Error debugging book status:', error);
      setValidationMessage('Failed to get book debug info. Please try again.');
    } finally {
      setIsLoadingDebug(false);
    }
  };

  const handleGetBookQueue = async () => {
    setIsLoadingDebug(true);
    setValidationMessage('');

    try {
      const response = await AdditionalService.getBookQueue();
      setBookQueue(response.data);
    } catch (error) {
      console.error('Error getting book queue:', error);
      setValidationMessage('Failed to get book queue. Please try again.');
    } finally {
      setIsLoadingDebug(false);
    }
  };

  const handleGetEnvStatus = async () => {
    setIsLoadingDebug(true);
    setValidationMessage('');

    try {
      const response = await AdditionalService.getEnvStatus();
      setEnvStatus(response.data);
    } catch (error) {
      console.error('Error getting environment status:', error);
      setValidationMessage('Failed to get environment status. Please try again.');
    } finally {
      setIsLoadingDebug(false);
    }
  };

  const currentPlan = getCurrentPlan();
  const canGenerate = validateGenerationRequirements().canGenerate;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Book Prompt
          </CardTitle>
          <CardDescription>
            Generate high-quality book content with AI-powered assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`border rounded-lg p-3 ${isAuthenticated ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${isAuthenticated ? 'text-green-800' : 'text-red-800'}`}>
                  Authentication
                </span>
              </div>
              <p className={`text-xs ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                {isAuthenticated ? '✅ Connected' : '❌ Not logged in'}
              </p>
            </div>

            <div className={`border rounded-lg p-3 ${amazonKDPSession.isConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                {amazonKDPSession.isConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${amazonKDPSession.isConnected ? 'text-green-800' : 'text-red-800'}`}>
                  Amazon KDP
                </span>
              </div>
              <p className={`text-xs ${amazonKDPSession.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {amazonKDPSession.isConnected ? '✅ Connected' : '❌ Not connected'}
              </p>
            </div>

            <div className={`border rounded-lg p-3 ${currentPlan !== 'free' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center gap-2">
                {currentPlan !== 'free' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className={`text-sm font-medium ${currentPlan !== 'free' ? 'text-green-800' : 'text-yellow-800'}`}>
                  Subscription
                </span>
              </div>
              <p className={`text-xs ${currentPlan !== 'free' ? 'text-green-600' : 'text-yellow-600'}`}>
                {currentPlan == 'free' ? `✅ ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan` : '⚠️ Free Plan'}
              </p>
            </div>
          </div>

          {/* Amazon KDP Connection Section */}
          {!amazonKDPSession.isConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Connect to Amazon KDP</h3>
                  <p className="text-sm text-blue-600">
                    Connect your Amazon KDP account to enable book generation and publishing.
                  </p>
                </div>
                <Button
                  onClick={() => setShowKDPLoginModal(true)}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
            </div>
          )}

          {/* Connected KDP Session Info */}
          {amazonKDPSession.isConnected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">Amazon KDP Connected</h3>
                  <p className="text-sm text-green-600">
                    Last connected: {amazonKDPSession.lastConnected ? new Date(amazonKDPSession.lastConnected).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <Button
                  onClick={handleKDPLogout}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          )}

          {/* Book Prompt Form */}
          <div className="space-y-2">
            <Label htmlFor="book-prompt">Book Description *</Label>
            <textarea
              id="book-prompt"
              placeholder="Describe your book idea, topic, target audience, niche, and any specific requirements. For example: 'Write a comprehensive guide to starting a business from scratch, targeting entrepreneurs and beginners in the business niche, with practical steps and strategies.'"
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={currentPrompt?.prompt || ''}
              onChange={(e) => handlePromptChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="word-count">Word Count</Label>
            <Input
              id="word-count"
              type="number"
              placeholder="5000"
              value={currentPrompt?.wordCount || 5000}
              onChange={(e) => handleWordCountChange(e.target.value)}
            />
          </div>

          {/* Validation Message */}
          {validationMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{validationMessage}</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleGenerateBook} 
            disabled={isGeneratingBook || !canGenerate}
            className="w-full"
            size="lg"
          >
            {isGeneratingBook ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Book...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Book Manuscript
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Auto Generate Books Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Auto Generate Books
          </CardTitle>
          <CardDescription>
            Automatically generate multiple books with AI-powered content creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auto-generate-count">Number of Books to Generate</Label>
            <Input
              id="auto-generate-count"
              type="number"
              min="1"
              max="10"
              value={autoGenerateCount}
              onChange={(e) => setAutoGenerateCount(parseInt(e.target.value) || 3)}
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleAutoGenerateBooks}
              disabled={isAutoGenerating || !canGenerate}
              variant="outline"
              className="flex-1"
            >
              {isAutoGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                  Auto Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Auto Generate {autoGenerateCount} Books
                </>
              )}
            </Button>

            <Button 
              onClick={handleGeneratePendingBooks}
              disabled={isGeneratingPending || !canGenerate}
              variant="outline"
              className="flex-1"
            >
              {isGeneratingPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                  Generating Pending...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Generate Pending Books
                </>
              )}
            </Button>
          </div>

          {/* Generation Status */}
          {generationStatus && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-700">{generationStatus}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Books for Publishing */}
      {generatedBooks.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Generated Books Ready for Publishing
            </CardTitle>
            <CardDescription>
              Your AI-generated books are ready for review and publishing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedBooks.map((book, index) => (
                <div key={book.id || index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Book #{index + 1} - {book.status}
                      </h3>
                      <p className="text-sm text-gray-600">ID: {book.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.status === 'completed' ? 'bg-green-100 text-green-800' :
                        book.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        book.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {book.status}
                      </span>
                      {book.progress && (
                        <span className="text-sm text-gray-600">
                          {book.progress}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {book.message && (
                    <p className="text-sm text-gray-700 mb-3">{book.message}</p>
                  )}
                  
                  {book.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                      <p className="text-sm text-red-700">{book.error}</p>
                    </div>
                  )}
                  
                  {book.estimatedTime && (
                    <p className="text-xs text-gray-500">
                      Estimated completion: {book.estimatedTime} minutes
                    </p>
                  )}
                  
                  {book.status === 'completed' && book.book && (
                    <div className="mt-3 pt-3 border-t">
                      <Button size="sm" variant="outline" className="mr-2">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Review Book
                      </Button>
                      <Button size="sm" variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Publish to KDP
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Management Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Management
          </CardTitle>
          <CardDescription>
            Update system configuration settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* Bulk Operations Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Bulk Operations
          </CardTitle>
          <CardDescription>
            Perform bulk operations on books and data
          </CardDescription>
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
                  Clear All
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
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Book Upload
          </CardTitle>
          <CardDescription>
            Upload books and track upload progress
          </CardDescription>
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

      {/* Debug and Monitoring Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Debug & Monitoring
          </CardTitle>
          <CardDescription>
            Debug book status, monitor queue, and check system health
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Book Debug */}
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

          {/* System Monitoring */}
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

      {/* Amazon KDP Login Modal */}
      <AmazonKDPLoginModal
        isOpen={showKDPLoginModal}
        onClose={() => setShowKDPLoginModal(false)}
        onSuccess={handleKDPLoginSuccess}
      />
    </>
  );
};
