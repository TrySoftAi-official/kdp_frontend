// Web Worker for handling /generate-pending-books API call
// This worker runs the API call in the background without freezing the UI
// Updated to use real backend progress tracking instead of fake simulation

import workerApiClient from './workerApiClient';

interface WorkerMessage {
  type: 'START_GENERATION' | 'CHECK_STATUS' | 'STOP_GENERATION' | 'RECOVER_CONNECTION';
  data?: any;
  token?: string; // Authentication token from main thread
}

interface WorkerResponse {
  type: 'PROGRESS' | 'COMPLETE' | 'ERROR' | 'STATUS_UPDATE';
  data?: any;
  progress?: number;
  message?: string;
}

interface GenerationProgress {
  job_id: string;
  status: string;
  total_books: number;
  processed_books: number;
  current_book: string | null;
  message: string;
  books: Array<{
    title: string;
    status: string;
    id?: string;
    error?: string;
    full_details?: any;
    processing_time?: string;
    success?: boolean;
  }>;
  start_time?: string;
  end_time?: string;
  duration_seconds?: number;
  progress_percentage?: number;
  remaining_books?: number;
  successful_books?: number;
  failed_books?: number;
  pending_books_details?: any[];
  current_book_details?: any;
  logs?: Array<{
    timestamp: string;
    message: string;
    type: string;
  }>;
}

// Worker class for handling generate-pending-books API call
class GeneratePendingBooksWorker {
  private isRunning = false;
  private progress = 0;
  private jobId: string | null = null;
  private pollingIntervalId: number | null = null;
  private pollingInterval = 5000; // Poll every 5 seconds as specified

  // Test connection to backend
  private async testConnection(): Promise<boolean> {
    const endpoints = ['/env-status', '/books', '/health', '/'];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing connection to backend at ${endpoint}...`);
        await workerApiClient.get(endpoint, { timeout: 5000 });
        console.log(`✅ Backend connection successful at ${endpoint}`);
        return true;
      } catch (error: any) {
        console.log(`❌ Failed to connect to ${endpoint}:`, error.message);
        continue;
      }
    }
    
    console.error('❌ All backend connection attempts failed');
    return false;
  }

  async startGeneration(token?: string) {
    if (this.isRunning) {
      this.sendResponse({
        type: 'ERROR',
        message: 'Generation already in progress'
      });
      return;
    }

    // Try to restore state from localStorage first
    const restoredState = this.loadStateFromLocalStorage();
    if (restoredState && this.jobId) {
      console.log('Restored generation job from localStorage, resuming polling...');
      this.isRunning = true;
      this.startProgressPolling(token);
      return;
    }

    this.isRunning = true;
    this.progress = 0;
    this.jobId = null;

    // Send initial status
    this.sendResponse({
      type: 'PROGRESS',
      progress: 0,
      message: 'Testing connection to backend...'
    });

    // Test connection first
    const isConnected = await this.testConnection();
    if (!isConnected) {
      this.isRunning = false;
      this.sendResponse({
        type: 'ERROR',
        message: 'Cannot connect to backend server on port 8081. The backend appears to be running but some endpoints may not be accessible. Please try again or check the browser console for more details.'
      });
      return;
    }

    // Send updated status
    this.sendResponse({
      type: 'PROGRESS',
      progress: 5,
      message: 'Connection successful. Starting pending books generation...'
    });

    try {
      // Make the initial API call to start generation
      console.log('Worker: Calling /generate-pending-books API...');
      console.log('Worker: API Client base URL:', workerApiClient.defaults.baseURL);
      console.log('Worker: Token available:', !!token);
      
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : {};
      
      console.log('Worker: Making POST request to /generate-pending-books with config:', config);
      const response = await workerApiClient.post('/generate-pending-books', {}, config);
      console.log('Worker: API response received:', response.data);
      
      const { job_id, message, total_books, status } = response.data;
      
      this.jobId = job_id;
      
      // Send initial response with job ID
      this.sendResponse({
        type: 'PROGRESS',
        progress: 0,
        message: message || 'Generation started successfully',
        data: { job_id, total_books, status }
      });

      // Start polling for progress updates
      this.startProgressPolling(token);

    } catch (error: any) {
      this.isRunning = false;
      this.jobId = null;
      
      console.error('Worker: Full error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        request: error.request
      });
      
      // Handle different types of errors
      let errorMessage = 'Failed to start pending books generation';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        console.error(`Worker: Server error ${status}:`, data);
        
        if (status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'Access denied. You do not have permission to generate books.';
        } else if (status === 404) {
          errorMessage = 'No pending books found to generate.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (data?.message) {
          errorMessage = data.message;
        } else {
          errorMessage = `Server error (${status}). Please try again.`;
        }
      } else if (error.request) {
        // Network error
        console.error('Worker: Network error - no response received:', error.request);
        if (error.code === 'ERR_NETWORK_CHANGED' || error.message?.includes('ERR_NETWORK_CHANGED')) {
          errorMessage = 'Network connection changed. Please check your internet connection and try again.';
        } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      } else {
        // Other error
        console.error('Worker: Other error:', error);
        errorMessage = error.message || errorMessage;
      }
      
      console.error('Worker: Generation start failed:', errorMessage);
      
      this.sendResponse({
        type: 'ERROR',
        message: `API Error: ${errorMessage}`
      });
    }
  }

  private async startProgressPolling(token?: string) {
    if (!this.jobId) return;

    let pollingAttempts = 0;
    const maxPollingAttempts = 360; // 30 minutes max (360 * 5 seconds)
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 20; // Allow more consecutive errors since backend is working
    let lastSuccessfulPoll = Date.now();

    // Start polling for progress updates
    this.pollingIntervalId = setInterval(async () => {
      pollingAttempts++;
      
      // Check for timeout
      if (pollingAttempts > maxPollingAttempts) {
        this.isRunning = false;
        this.jobId = null;
        
        if (this.pollingIntervalId) {
          clearInterval(this.pollingIntervalId);
          this.pollingIntervalId = null;
        }
        
        this.sendResponse({
          type: 'ERROR',
          message: 'Generation timeout. The process is taking longer than expected.'
        });
        return;
      }

      try {
        const config = token ? {
          headers: {
            Authorization: `Bearer ${token}`
          }
        } : {};
        
        const response = await workerApiClient.get(`/generation-progress/${this.jobId}`, config);
        const progressData: GenerationProgress = response.data;
        
        // Reset consecutive errors on successful request
        consecutiveErrors = 0;
        lastSuccessfulPoll = Date.now();
        
        // Use the progress percentage from the backend if available, otherwise calculate it
        const progressPercentage = progressData.progress_percentage || 
          (progressData.total_books > 0 
            ? Math.round((progressData.processed_books / progressData.total_books) * 100)
            : 0);
        
        this.progress = progressPercentage;
        
        // Send progress update with enhanced data
        this.sendResponse({
          type: 'PROGRESS',
          progress: progressPercentage,
          message: progressData.message,
          data: {
            ...progressData,
            // Include additional calculated fields
            estimated_time_remaining: this.calculateEstimatedTimeRemaining(progressData),
            current_step: this.getCurrentStep(progressData)
          }
        });
        
        // Check if generation is completed or failed
        if (progressData.status === 'completed') {
          this.isRunning = false;
          this.jobId = null;
          
          if (this.pollingIntervalId) {
            clearInterval(this.pollingIntervalId);
            this.pollingIntervalId = null;
          }
          
          // Calculate final statistics
          const successfulBooks = progressData.books?.filter(book => book.status === 'Review').length || 0;
          const failedBooks = progressData.books?.filter(book => book.status === 'Failed').length || 0;
          
          this.sendResponse({
            type: 'COMPLETE',
            data: {
              ...progressData,
              successful_books: successfulBooks,
              failed_books: failedBooks
            },
            progress: 100,
            message: `Generation completed! ${successfulBooks} books generated successfully, ${failedBooks} failed.`
          });
        } else if (progressData.status === 'failed' || progressData.status === 'error') {
          this.isRunning = false;
          this.jobId = null;
          
          if (this.pollingIntervalId) {
            clearInterval(this.pollingIntervalId);
            this.pollingIntervalId = null;
          }
          
          this.sendResponse({
            type: 'ERROR',
            message: progressData.message || 'Generation failed on the backend',
            data: progressData
          });
        }
        
      } catch (error: any) {
        consecutiveErrors++;
        console.error(`Error polling progress (attempt ${pollingAttempts}):`, error);
        
        // Handle specific error types
        let errorMessage = 'Lost connection to the server. Please check your connection and try again.';
        
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const data = error.response.data;
          
          if (status === 404) {
            errorMessage = 'Job not found. The generation job may have expired or been cancelled.';
          } else if (status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (status === 500) {
            errorMessage = 'Server error while checking progress. Please try again.';
          } else if (data?.error) {
            errorMessage = data.error;
          } else if (data?.message) {
            errorMessage = data.message;
          }
        } else if (error.request) {
          // Network error
          if (error.code === 'ERR_NETWORK_CHANGED' || error.message?.includes('ERR_NETWORK_CHANGED')) {
            errorMessage = 'Network connection changed. Please check your internet connection and try again.';
          } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else {
            errorMessage = 'Network error. Please check your connection and try again.';
          }
        } else {
          // Other error
          errorMessage = error.message || errorMessage;
        }
        
        // Check if we've had a successful poll recently (within last 5 minutes)
        const timeSinceLastSuccess = Date.now() - lastSuccessfulPoll;
        const hasRecentSuccess = timeSinceLastSuccess < 5 * 60 * 1000; // 5 minutes
        
        // Only send warning message every 5 attempts to avoid spam
        if (consecutiveErrors % 5 === 0) {
          this.sendResponse({
            type: 'PROGRESS',
            progress: this.progress,
            message: `Connection issue: ${errorMessage} (attempt ${consecutiveErrors}/${maxConsecutiveErrors})`
          });
        }
        
        // Only stop if we have too many consecutive errors AND no recent successful poll
        if (consecutiveErrors >= maxConsecutiveErrors && !hasRecentSuccess) {
          // Try to recover by checking if the job is still running
          console.log('Attempting to recover from connection issues...');
          const recovered = await this.recoverFromConnectionIssue(token);
          
          if (!recovered) {
            this.isRunning = false;
            this.jobId = null;
            
            if (this.pollingIntervalId) {
              clearInterval(this.pollingIntervalId);
              this.pollingIntervalId = null;
            }
            
            this.sendResponse({
              type: 'ERROR',
              message: `Lost connection to backend. Generation may still be running on the server. Please check the backend logs or try again later.`
            });
          } else {
            // Reset error count on successful recovery
            consecutiveErrors = 0;
            lastSuccessfulPoll = Date.now();
          }
        }
      }
    }, this.pollingInterval) as any;
  }

  checkStatus() {
    this.sendResponse({
      type: 'STATUS_UPDATE',
      data: {
        isRunning: this.isRunning,
        progress: this.progress,
        message: this.isRunning ? 'Generation in progress...' : 'Ready',
        jobId: this.jobId
      }
    });
  }

  // Method to recover from connection issues by checking if job is still running
  async recoverFromConnectionIssue(token?: string) {
    if (!this.jobId) return false;

    try {
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : {};
      
      const response = await workerApiClient.get(`/generation-progress/${this.jobId}`, config);
      const progressData: GenerationProgress = response.data;
      
      // If we get a successful response, the job is still running
      if (progressData.status && progressData.status !== 'completed' && progressData.status !== 'failed') {
        this.isRunning = true;
        this.sendResponse({
          type: 'PROGRESS',
          progress: this.progress,
          message: 'Connection recovered. Generation is still running on the backend.',
          data: progressData
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Recovery attempt failed:', error);
      return false;
    }
  }

  stopGeneration() {
    // Stop polling
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
    
    this.isRunning = false;
    this.progress = 0;
    this.jobId = null;

    this.sendResponse({
      type: 'COMPLETE',
      data: null,
      progress: 0,
      message: 'Generation stopped by user'
    });
  }

  private sendResponse(response: WorkerResponse) {
    // Save state to localStorage for persistence across page reloads
    this.saveStateToLocalStorage();
    self.postMessage(response);
  }

  private saveStateToLocalStorage() {
    // Web workers don't have access to localStorage
    // This method is kept for compatibility but does nothing
    console.log('Web worker: localStorage not available, skipping state save');
  }

  private loadStateFromLocalStorage(): boolean {
    // Web workers don't have access to localStorage
    // This method is kept for compatibility but always returns false
    console.log('Web worker: localStorage not available, skipping state restoration');
    return false;
  }

  private clearStateFromLocalStorage() {
    // Web workers don't have access to localStorage
    // This method is kept for compatibility but does nothing
    console.log('Web worker: localStorage not available, skipping state clear');
  }

  private calculateEstimatedTimeRemaining(progressData: GenerationProgress): string | null {
    if (!progressData.start_time || progressData.total_books === 0) {
      return null;
    }

    const startTime = new Date(progressData.start_time);
    const currentTime = new Date();
    const elapsedSeconds = (currentTime.getTime() - startTime.getTime()) / 1000;
    
    if (progressData.processed_books === 0) {
      return null;
    }

    const avgTimePerBook = elapsedSeconds / progressData.processed_books;
    const remainingBooks = progressData.total_books - progressData.processed_books;
    const estimatedRemainingSeconds = avgTimePerBook * remainingBooks;

    if (estimatedRemainingSeconds < 60) {
      return `${Math.round(estimatedRemainingSeconds)}s`;
    } else if (estimatedRemainingSeconds < 3600) {
      return `${Math.round(estimatedRemainingSeconds / 60)}m`;
    } else {
      return `${Math.round(estimatedRemainingSeconds / 3600)}h`;
    }
  }

  private getCurrentStep(progressData: GenerationProgress): string {
    if (progressData.status === 'completed') {
      return 'Completed';
    } else if (progressData.status === 'failed') {
      return 'Failed';
    } else if (progressData.current_book) {
      return `Processing: ${progressData.current_book}`;
    } else if (progressData.processed_books > 0) {
      return 'In Progress';
    } else {
      return 'Starting...';
    }
  }
}

// Create worker instance
const worker = new GeneratePendingBooksWorker();

// Handle messages from main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, token } = event.data;

  console.log('Worker: Received message:', { type, hasToken: !!token });

  try {
    switch (type) {
      case 'START_GENERATION':
        console.log('Worker: Starting generation...');
        worker.startGeneration(token);
        break;
      case 'CHECK_STATUS':
        console.log('Worker: Checking status...');
        worker.checkStatus();
        break;
      case 'STOP_GENERATION':
        console.log('Worker: Stopping generation...');
        worker.stopGeneration();
        break;
      case 'RECOVER_CONNECTION':
        console.log('Worker: Attempting connection recovery...');
        worker.recoverFromConnectionIssue(token);
        break;
      default:
        console.log('Worker: Unknown message type:', type);
        self.postMessage({
          type: 'ERROR',
          message: `Unknown message type: ${type}`
        });
    }
  } catch (error) {
    console.error('Worker: Error handling message:', error);
    self.postMessage({
      type: 'ERROR',
      message: `Worker error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// Export types for use in main thread
export type { WorkerMessage, WorkerResponse };
