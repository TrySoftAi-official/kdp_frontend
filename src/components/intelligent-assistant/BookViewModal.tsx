import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface Book {
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

export interface BookViewModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  className?: string;
}

export const BookViewModal: React.FC<BookViewModalProps> = ({
  isOpen,
  book,
  onClose,
  className = ''
}) => {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold line-clamp-2">{book.title}</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {book.niche || 'Unknown'} • {book.targetAudience || 'General'} • {(book.wordCount || 0).toLocaleString()} words
            </p>
          </div>
          <Button variant="outline" onClick={onClose} className="flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose max-w-none">
            <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
              {book.content}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-t bg-gray-50 gap-3">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Generated on {new Date(book.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onClose} size="sm">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
