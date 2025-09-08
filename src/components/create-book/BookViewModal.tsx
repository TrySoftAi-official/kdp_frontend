import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { GeneratedBook } from './types';

interface BookViewModalProps {
  selectedBook: GeneratedBook | null;
  showBookView: boolean;
  onClose: () => void;
  onDownloadBook: (book: GeneratedBook) => void;
}

export const BookViewModal: React.FC<BookViewModalProps> = ({
  selectedBook,
  showBookView,
  onClose,
  onDownloadBook
}) => {
  if (!showBookView || !selectedBook) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold line-clamp-2">{selectedBook.title}</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {selectedBook.niche} • {selectedBook.targetAudience} • {selectedBook.wordCount.toLocaleString()} words
            </p>
          </div>
          <Button variant="outline" onClick={onClose} className="flex-shrink-0">
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
              onClick={() => onDownloadBook(selectedBook)}
              size="sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Download Book
            </Button>
            <Button onClick={onClose} size="sm">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
