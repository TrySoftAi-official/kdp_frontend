import { useEffect, useRef, useState, useCallback } from 'react';
import { CookieManager } from '@/utils/cookies';

interface WorkerMessage {
  type: 'START_GENERATION' | 'CHECK_STATUS' | 'STOP_GENERATION' | 'RECOVER_CONNECTION';
  data?: any;
  token?: string;
}

interface WorkerResponse {
  type: 'PROGRESS' | 'COMPLETE' | 'ERROR' | 'STATUS_UPDATE';
  data?: any;
  progress?: number;
  message?: string;
}

interface UseGeneratePendingBooksWorkerReturn {
  isGenerating: boolean;
  progress: number;
  message: string;
  result: any;
  error: string | null;
  jobId: string | null;
  currentBook: string | null;
  totalBooks: number;
  processedBooks: number;
  // Enhanced progress data
  estimatedTimeRemaining: string | null;
  currentStep: string;
  successfulBooks: number;
  failedBooks: number;
  remainingBooks: number;
  duration: number | null;
  logs: Array<{
    timestamp: string;
    message: string;
    type: string;
  }>;
  startGeneration: () => void;
  stopGeneration: () => void;
  checkStatus: () => void;
  recoverConnection: () => void;
}

export const useGeneratePendingBooksWorker = (): UseGeneratePendingBooksWorkerReturn => {
  const workerRef = useRef<Worker | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [currentBook, setCurrentBook] = useState<string | null>(null);
  const [totalBooks, setTotalBooks] = useState(0);
  const [processedBooks, setProcessedBooks] = useState(0);
  // Enhanced progress data
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [successfulBooks, setSuccessfulBooks] = useState(0);
  const [failedBooks, setFailedBooks] = useState(0);
  const [remainingBooks, setRemainingBooks] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [logs, setLogs] = useState<Array<{
    timestamp: string;
    message: string;
    type: string;
  }>>([]);

  // Initialize worker
  useEffect(() => {
    // Create worker from the worker file
    workerRef.current = new Worker(
      new URL('../workers/generatePendingBooksWorker.ts', import.meta.url),
      { type: 'module' }
    );

    // Handle messages from worker
    const handleMessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, data, progress: workerProgress, message: workerMessage } = event.data;

      switch (type) {
        case 'PROGRESS':
          setProgress(workerProgress || 0);
          setMessage(workerMessage || '');
          setError(null);
          
          // Handle real progress data from backend
          if (data) {
            if (data.job_id) {
              setJobId(data.job_id);
            }
            if (data.total_books) {
              setTotalBooks(data.total_books);
            }
            if (data.processed_books !== undefined) {
              setProcessedBooks(data.processed_books);
            }
            if (data.current_book !== undefined) {
              setCurrentBook(data.current_book);
            }
            // Enhanced progress data
            if (data.estimated_time_remaining !== undefined) {
              setEstimatedTimeRemaining(data.estimated_time_remaining);
            }
            if (data.current_step !== undefined) {
              setCurrentStep(data.current_step);
            }
            if (data.successful_books !== undefined) {
              setSuccessfulBooks(data.successful_books);
            }
            if (data.failed_books !== undefined) {
              setFailedBooks(data.failed_books);
            }
            if (data.remaining_books !== undefined) {
              setRemainingBooks(data.remaining_books);
            }
            if (data.duration_seconds !== undefined) {
              setDuration(data.duration_seconds);
            }
            if (data.logs && Array.isArray(data.logs)) {
              setLogs(data.logs);
            }
          }
          break;

        case 'COMPLETE':
          setIsGenerating(false);
          setProgress(100);
          setMessage(workerMessage || 'Generation completed!');
          if (data) {
            setResult(data);
            // Update final state from completion data
            if (data.total_books) {
              setTotalBooks(data.total_books);
            }
            if (data.processed_books !== undefined) {
              setProcessedBooks(data.processed_books);
            }
            if (data.current_book !== undefined) {
              setCurrentBook(data.current_book);
            }
            // Update enhanced progress data from completion
            if (data.successful_books !== undefined) {
              setSuccessfulBooks(data.successful_books);
            }
            if (data.failed_books !== undefined) {
              setFailedBooks(data.failed_books);
            }
            if (data.remaining_books !== undefined) {
              setRemainingBooks(data.remaining_books);
            }
            if (data.duration_seconds !== undefined) {
              setDuration(data.duration_seconds);
            }
            if (data.logs && Array.isArray(data.logs)) {
              setLogs(data.logs);
            }
          }
          setError(null);
          break;

        case 'ERROR':
          setIsGenerating(false);
          setError(workerMessage || 'Unknown error occurred');
          setMessage('');
          
          // Preserve some data if available from error response
          if (data) {
            if (data.job_id) {
              setJobId(data.job_id);
            }
            if (data.total_books) {
              setTotalBooks(data.total_books);
            }
            if (data.processed_books !== undefined) {
              setProcessedBooks(data.processed_books);
            }
            if (data.current_book !== undefined) {
              setCurrentBook(data.current_book);
            }
            if (data.successful_books !== undefined) {
              setSuccessfulBooks(data.successful_books);
            }
            if (data.failed_books !== undefined) {
              setFailedBooks(data.failed_books);
            }
            if (data.logs && Array.isArray(data.logs)) {
              setLogs(data.logs);
            }
          } else {
            // Reset all data if no error data available
            setJobId(null);
            setCurrentBook(null);
            setTotalBooks(0);
            setProcessedBooks(0);
            setEstimatedTimeRemaining(null);
            setCurrentStep('');
            setSuccessfulBooks(0);
            setFailedBooks(0);
            setRemainingBooks(0);
            setDuration(null);
            setLogs([]);
          }
          break;

        case 'STATUS_UPDATE':
          if (data) {
            setIsGenerating(data.isRunning);
            setProgress(data.progress);
            setMessage(data.message);
            if (data.jobId) {
              setJobId(data.jobId);
            }
          }
          break;

        default:
          console.warn('Unknown worker message type:', type);
      }
    };

    workerRef.current.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.removeEventListener('message', handleMessage);
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const startGeneration = useCallback(() => {
    console.log('Hook: startGeneration called, workerRef.current:', !!workerRef.current, 'isGenerating:', isGenerating);
    
    if (workerRef.current && !isGenerating) {
      console.log('Hook: Starting generation...');
      setError(null);
      setResult(null);
      setProgress(0);
      setMessage('');
      setJobId(null);
      setCurrentBook(null);
      setTotalBooks(0);
      setProcessedBooks(0);
      // Reset enhanced progress data
      setEstimatedTimeRemaining(null);
      setCurrentStep('');
      setSuccessfulBooks(0);
      setFailedBooks(0);
      setRemainingBooks(0);
      setDuration(null);
      setLogs([]);
      setIsGenerating(true);

      // Get authentication token from localStorage and cookies
      const token = localStorage.getItem("access_token") || 
                   localStorage.getItem("accessToken") || 
                   CookieManager.getAccessToken() ||
                   undefined;
      console.log('Hook: Token available:', !!token);

      const message: WorkerMessage = {
        type: 'START_GENERATION',
        token
      };

      console.log('Hook: Sending message to worker:', message);
      workerRef.current.postMessage(message);
    } else {
      console.log('Hook: Cannot start generation - worker not available or already generating');
    }
  }, [isGenerating]);

  const stopGeneration = useCallback(() => {
    if (workerRef.current && isGenerating) {
      const message: WorkerMessage = {
        type: 'STOP_GENERATION'
      };

      workerRef.current.postMessage(message);
    }
  }, [isGenerating]);

  const checkStatus = useCallback(() => {
    if (workerRef.current) {
      const message: WorkerMessage = {
        type: 'CHECK_STATUS'
      };

      workerRef.current.postMessage(message);
    }
  }, []);

  const recoverConnection = useCallback(() => {
    if (workerRef.current) {
      const token = localStorage.getItem("access_token") || 
                   localStorage.getItem("accessToken") || 
                   CookieManager.getAccessToken() ||
                   undefined;

      const message: WorkerMessage = {
        type: 'RECOVER_CONNECTION',
        token
      };

      workerRef.current.postMessage(message);
    }
  }, []);

  return {
    isGenerating,
    progress,
    message,
    result,
    error,
    jobId,
    currentBook,
    totalBooks,
    processedBooks,
    // Enhanced progress data
    estimatedTimeRemaining,
    currentStep,
    successfulBooks,
    failedBooks,
    remainingBooks,
    duration,
    logs,
    startGeneration,
    stopGeneration,
    checkStatus,
    recoverConnection
  };
};
