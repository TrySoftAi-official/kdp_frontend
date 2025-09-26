import { useEffect, useRef, useState, useCallback } from 'react';

interface WorkerMessage {
  type: 'START_GENERATION' | 'CHECK_STATUS' | 'STOP_GENERATION';
  data?: any;
}

interface WorkerResponse {
  type: 'PROGRESS' | 'COMPLETE' | 'ERROR' | 'STATUS_UPDATE';
  data?: any;
  progress?: number;
  message?: string;
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
  status: 'Pending' | 'Review' | 'Uploaded';
  kdpPhase?: 'Pending' | 'Review' | 'Uploaded';
  chapters?: number;
  authorName?: string | null;
  price?: number | null;
  manuscriptFilename?: string;
  coverFilename?: string;
  proofreadReport?: string;
  stats?: Record<string, any>;
}

interface UseBookGenerationWorkerReturn {
  isGenerating: boolean;
  progress: number;
  message: string;
  generatedBook: GeneratedBook | null;
  error: string | null;
  startGeneration: (bookData: any) => void;
  stopGeneration: () => void;
  checkStatus: () => void;
}

export const useBookGenerationWorker = (): UseBookGenerationWorkerReturn => {
  const workerRef = useRef<Worker | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [generatedBook, setGeneratedBook] = useState<GeneratedBook | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize worker
  useEffect(() => {
    // Create worker from the worker file
    workerRef.current = new Worker(
      new URL('../workers/pendingBooksWorker.ts', import.meta.url),
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
          break;

        case 'COMPLETE':
          setIsGenerating(false);
          setProgress(100);
          setMessage(workerMessage || 'Generation completed!');
          if (data) {
            setGeneratedBook(data);
          }
          setError(null);
          break;

        case 'ERROR':
          setIsGenerating(false);
          setError(workerMessage || 'Unknown error occurred');
          setMessage('');
          break;

        case 'STATUS_UPDATE':
          if (data) {
            setIsGenerating(data.isRunning);
            setProgress(data.progress);
            setMessage(data.message);
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

  const startGeneration = useCallback((bookData: any) => {
    if (workerRef.current && !isGenerating) {
      setError(null);
      setGeneratedBook(null);
      setProgress(0);
      setMessage('');
      setIsGenerating(true);

      const message: WorkerMessage = {
        type: 'START_GENERATION',
        data: bookData
      };

      workerRef.current.postMessage(message);
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

  return {
    isGenerating,
    progress,
    message,
    generatedBook,
    error,
    startGeneration,
    stopGeneration,
    checkStatus
  };
};
