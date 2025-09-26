import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, RefreshCw, BookOpen, Eye, Sparkles } from 'lucide-react';

export interface BookSuggestion {
  title: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  prompt: string;
  description: string;
  isApiBook?: boolean;
  bookId?: string;
}

export interface BookSliderProps {
  suggestions: BookSuggestion[];
  isLoading: boolean;
  error: string | null;
  onGenerateBook: (suggestion: BookSuggestion) => void;
  onPreviewSuggestion: (suggestion: BookSuggestion) => void;
  onRefresh: () => void;
  onClearError: () => void;
  className?: string;
}

export const BookSlider: React.FC<BookSliderProps> = ({
  suggestions,
  isLoading,
  error,
  onGenerateBook,
  onPreviewSuggestion,
  onRefresh,
  onClearError,
  className = ''
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState(0);
  const [dragOffset, setDragOffset] = React.useState(0);
  const [animationPaused, setAnimationPaused] = React.useState(false);

  // Drag handlers for slider
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX - dragOffset);
    setAnimationPaused(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newOffset = e.clientX - dragStart;
    setDragOffset(newOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setAnimationPaused(false);
    // Reset offset after a short delay to resume animation
    setTimeout(() => {
      setDragOffset(0);
    }, 100);
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX - dragOffset);
    setAnimationPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const newOffset = e.touches[0].clientX - dragStart;
    setDragOffset(newOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setAnimationPaused(false);
    // Reset offset after a short delay to resume animation
    setTimeout(() => {
      setDragOffset(0);
    }, 100);
  };

  const renderSuggestionCard = (suggestion: BookSuggestion, index: number, isDuplicate = false) => (
    <div 
      key={isDuplicate ? `duplicate-${index}` : index} 
      className="flex-shrink-0 w-44 h-68 border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all duration-300 bg-white hover:border-blue-300 group"
    >
      {/* Card Header */}
      <div className="h-16 mb-3">
        <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
          {suggestion.title}
        </h4>
      </div>

      {/* Badges Section - Fixed Height */}
      <div className="h-20 mb-4 space-y-2">
        <Badge variant="outline" className="text-xs w-full justify-center bg-gray-50">
          {suggestion.niche}
        </Badge>
        <Badge variant="secondary" className="text-xs w-full justify-center">
          {suggestion.targetAudience}
        </Badge>
        <Badge variant="outline" className="text-xs w-full justify-center bg-blue-50 text-blue-700 border-blue-200">
          {(suggestion.wordCount || 0).toLocaleString()} words
        </Badge>
      </div>

      {/* Description - Fixed Height */}
      <div className="h-16 mb-4">
        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
          {suggestion.description}
        </p>
      </div>

      {/* Action Buttons - Fixed Height */}
      <div className="h-20 space-y-2">
        <Button 
          size="sm" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => onGenerateBook(suggestion)}
        >
          <Sparkles className="h-3 w-3 mr-2" />
          Generate
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full border-gray-300 hover:border-blue-300 hover:bg-blue-50"
          onClick={() => onPreviewSuggestion(suggestion)}
        >
          <Eye className="h-3 w-3 mr-2" />
          Preview
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center w-full py-8">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            <span>Loading trending books...</span>
          </div>
        </div>
      );
    }

    if (suggestions.length === 0 && !isLoading) {
      return (
        <div className="flex items-center justify-center w-full py-8">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No trending books available</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return [
      // Original cards
      ...suggestions.map((suggestion, index) => renderSuggestionCard(suggestion, index)),
      // Duplicate cards for seamless infinite scroll
      ...suggestions.map((suggestion, index) => renderSuggestionCard(suggestion, index, true))
    ];
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Hot Selling Genres & Amazon KDP Suggestions
            </CardTitle>
            <CardDescription>
              Generate popular book types that are trending on Amazon KDP
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden group">
          {/* Live Moving Slider Container */}
          <div 
            className={`flex gap-3 cursor-grab active:cursor-grabbing ${!animationPaused ? 'animate-scroll' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ transform: `translateX(${dragOffset}px)` }}
          >
            {renderContent()}
          </div>

          {/* Gradient Overlays for Smooth Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white to-transparent pointer-events-none"></div>

          {/* Pause Indicator */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-600 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Hover to pause
          </div>

          {/* Drag Indicator */}
          {isDragging && (
            <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Dragging...
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <div className="h-4 w-4 text-red-600">⚠</div>
              <span className="font-medium">Error loading books:</span>
              <span>{error}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearError}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
