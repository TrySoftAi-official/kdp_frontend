import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, RefreshCw } from 'lucide-react';

export interface ProgressData {
  status: string;
  progress: number;
  message?: string;
  currentStep?: string;
  currentBook?: string;
  totalBooks?: number;
  processedBooks?: number;
  estimatedTime?: string;
  successful?: number;
  failed?: number;
  remaining?: number;
  duration?: number;
  jobId?: string;
}

export interface ProgressCardProps {
  progress?: ProgressData | null;
  isWorkerGenerating?: boolean;
  isPendingBooksGenerating?: boolean;
  onStopGeneration?: () => void;
  onRecoverConnection?: () => void;
  className?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  progress,
  isWorkerGenerating = false,
  isPendingBooksGenerating = false,
  onStopGeneration,
  onRecoverConnection,
  className = ''
}) => {
  const isActive = progress || isWorkerGenerating || isPendingBooksGenerating;

  if (!isActive) return null;

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-blue-700">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            <span className="font-medium">Processing:</span>
            <span>{progress?.status || progress?.message || 'Working...'}</span>
          </div>
          
          {/* Real progress data for pending books generation */}
          {isPendingBooksGenerating && progress?.totalBooks && progress.totalBooks > 0 && (
            <div className="text-sm text-blue-600 space-y-1">
              <div className="flex justify-between items-center">
                <span>Books: {progress.processedBooks || 0} / {progress.totalBooks}</span>
                <span>{progress.progress}% complete</span>
              </div>
              
              {progress.currentStep && (
                <div className="text-xs text-blue-500 truncate">
                  {progress.currentStep}
                </div>
              )}
              
              {progress.currentBook && (
                <div className="text-xs text-blue-500 truncate">
                  Current: {progress.currentBook}
                </div>
              )}
              
              <div className="flex justify-between items-center text-xs">
                {progress.successful && progress.successful > 0 && (
                  <span className="text-green-600">✓ {progress.successful} successful</span>
                )}
                {progress.failed && progress.failed > 0 && (
                  <span className="text-red-600">✗ {progress.failed} failed</span>
                )}
                {progress.remaining && progress.remaining > 0 && (
                  <span className="text-gray-600">{progress.remaining} remaining</span>
                )}
              </div>
              
              {progress.estimatedTime && (
                <div className="text-xs text-blue-400">
                  ETA: {progress.estimatedTime}
                </div>
              )}
              
              {progress.duration && (
                <div className="text-xs text-gray-500">
                  Duration: {Math.round(progress.duration / 60)}m {Math.round(progress.duration % 60)}s
                </div>
              )}
              
              {progress.jobId && (
                <div className="text-xs text-blue-400">
                  Job ID: {progress.jobId.substring(0, 8)}...
                </div>
              )}
            </div>
          )}
          
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress?.progress || 0}%` }}
            />
          </div>
          
          {/* Show percentage for non-pending books generation */}
          {!isPendingBooksGenerating && (
            <div className="text-sm text-blue-600 text-center">
              {progress?.progress || 0}% complete
            </div>
          )}
          
          {(isWorkerGenerating || isPendingBooksGenerating) && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onStopGeneration}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="h-3 w-3 mr-1" />
                Stop Generation
              </Button>
              
              {isPendingBooksGenerating && onRecoverConnection && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRecoverConnection}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Recover Connection
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
