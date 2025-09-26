import React, { useState, useCallback, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/utils/utils';
import { booksApi } from '@/utils/api';
import { useUI } from '@/redux/hooks/useUI';

interface UploadResult {
  processed: number;
  failed: number;
}

export const CSVUploader: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useUI();

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const response = await booksApi.uploadCSV(file);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        setResult(response.data);
        addNotification({
          title: 'Upload Complete',
          message: `Successfully processed ${response.data.processed} books. ${response.data.failed} failed.`,
          type: response.data.failed > 0 ? 'warning' : 'success'
        });
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      addNotification({
        title: 'Upload Failed',
        message: 'There was an error uploading your CSV file.',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  }, [addNotification]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Upload Books CSV</h3>
            <p className="text-sm text-muted-foreground">
              Import your book data from a CSV file
            </p>
          </div>

          {!result && !error && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
                uploading && 'pointer-events-none opacity-60'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                
                {uploading ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploading...</p>
                    <Progress value={progress} className="w-full max-w-xs mx-auto" />
                    <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to browse files
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Upload Complete!</span>
              </div>
              
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Books processed:</span>
                  <span className="font-medium text-green-600">{result.processed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Failed:</span>
                  <span className={cn(
                    'font-medium',
                    result.failed > 0 ? 'text-red-600' : 'text-muted-foreground'
                  )}>
                    {result.failed}
                  </span>
                </div>
              </div>
              
              <Button onClick={reset} variant="outline" className="w-full">
                Upload Another File
              </Button>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Upload Failed</span>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
              
              <Button onClick={reset} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>CSV Format Requirements:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Required columns: Title, Author, Genre, Country</li>
              <li>Optional columns: Revenue, Ad Spend, KENP</li>
              <li>Maximum file size: 10MB</li>
              <li>Maximum rows: 1,000</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
