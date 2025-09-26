import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Sparkles, 
  Settings, 
  Edit3, 
  Upload, 
  CheckCircle,
  Eye,
  X
} from 'lucide-react';

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

export interface BookCardProps {
  book: Book;
  isGenerating?: boolean;
  isUploading?: boolean;
  onGenerateFullBook?: (book: Book) => void;
  onGenerateKdpData?: (book: Book) => void;
  onEditKdpData?: (book: Book) => void;
  onUploadBook?: (book: Book) => void;
  onViewBook?: (book: Book) => void;
  onSaveBook?: (book: Book) => void;
  className?: string;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isGenerating = false,
  isUploading = false,
  onGenerateFullBook,
  onGenerateKdpData,
  onEditKdpData,
  onUploadBook,
  onViewBook,
  onSaveBook,
  className = ''
}) => {
  const getStatusBadge = () => {
    switch (book.status) {
      case 'Pending':
        return (
          <Badge 
            variant="outline" 
            className="text-xs font-medium bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending Generation
          </Badge>
        );
      case 'Review':
        return (
          <Badge 
            variant="outline" 
            className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200"
          >
            Ready for Upload
          </Badge>
        );
      case 'Uploaded':
        return (
          <Badge 
            variant="outline" 
            className="text-xs font-medium bg-green-50 text-green-700 border-green-200"
          >
            Uploaded to KDP
          </Badge>
        );
      default:
        return (
          <Badge 
            variant="outline" 
            className="text-xs font-medium bg-gray-50 text-gray-700 border-gray-200"
          >
            {book.status}
          </Badge>
        );
    }
  };

  const renderActionButtons = () => {
    if (book.status === 'Pending') {
      return (
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
            onClick={() => onGenerateFullBook?.(book)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Full Book
              </>
            )}
          </Button>
          
          {book.kdpPhase === 'Review' && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200"
                onClick={() => onGenerateKdpData?.(book)}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2" />
                    Generating KDP Data...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Generate KDP Data
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-colors duration-200"
                onClick={() => onEditKdpData?.(book)}
                disabled={isUploading}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit KDP Data
              </Button>

              <Button 
                variant="default" 
                size="sm" 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onUploadBook?.(book)}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload to KDP
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      );
    }

    if (book.status === 'Review' && book.kdpPhase === 'Review') {
      return (
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200"
            onClick={() => onGenerateKdpData?.(book)}
            disabled={isUploading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate KDP Data
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-colors duration-200"
            onClick={() => onEditKdpData?.(book)}
            disabled={isUploading}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit KDP Data
          </Button>
        </div>
      );
    }

    if (book.status === 'Uploaded') {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full border-green-200 text-green-700 bg-green-50"
          disabled
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Published to KDP
        </Button>
      );
    }

    return null;
  };

  return (
    <Card className={`border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-200 relative bg-white ${className}`}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="relative flex-shrink-0">
            <img 
              src={book.coverUrl} 
              alt={book.title}
              className="w-16 h-24 sm:w-18 sm:h-28 object-cover rounded-lg border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200"
            />
            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base mb-2 line-clamp-2 text-gray-900">{book.title}</h4>
            <p className="text-sm text-blue-600 font-medium mb-3">{book.niche || 'Unknown'}</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium">
                {book.targetAudience || 'General'}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 font-medium">
                {(book.wordCount || 0).toLocaleString()} words
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-100 gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Generated on {new Date(book.createdAt).toLocaleDateString()}</span>
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-3">
          <div className="flex-1 space-y-2">
            {renderActionButtons()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
