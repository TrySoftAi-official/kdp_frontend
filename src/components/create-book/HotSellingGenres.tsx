import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Sparkles, Eye } from 'lucide-react';
import { BookSuggestion } from './types';
import { useCreateBookContext } from './CreateBookContext';

interface HotSellingGenresProps {
  onGenerateBook: (prompt: any) => void;
  onPreviewSuggestion: (suggestion: BookSuggestion) => void;
}

export const HotSellingGenres: React.FC<HotSellingGenresProps> = ({
  onGenerateBook,
  onPreviewSuggestion
}) => {
  const { currentPrompt, setCurrentPrompt } = useCreateBookContext();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [animationPaused, setAnimationPaused] = useState(false);

  const createBookPrompt = (promptData: Omit<any, 'id' | 'createdAt'>) => {
    const newPrompt = {
      ...promptData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    return newPrompt;
  };

  const suggestions: BookSuggestion[] = [
    { title: "Weight Loss Guide", niche: "Health & Fitness", targetAudience: "Beginners", wordCount: 8000, prompt: "Create a comprehensive weight loss guide for beginners", description: "A complete guide to healthy weight loss with proven strategies and meal plans" },
    { title: "Business Startup", niche: "Business & Entrepreneurship", targetAudience: "Entrepreneurs", wordCount: 10000, prompt: "Write a complete guide to starting a business from scratch", description: "Step-by-step guide to launching your own successful business venture" },
    { title: "Digital Marketing", niche: "Marketing", targetAudience: "Professionals", wordCount: 12000, prompt: "Create a digital marketing strategy guide for businesses", description: "Comprehensive digital marketing strategies for modern businesses" },
    { title: "Personal Finance", niche: "Finance", targetAudience: "Young Adults", wordCount: 9000, prompt: "Write a personal finance guide for young adults", description: "Essential money management skills for financial independence" },
    { title: "Cooking Basics", niche: "Food & Cooking", targetAudience: "Beginners", wordCount: 7000, prompt: "Create a beginner's guide to cooking healthy meals", description: "Master the fundamentals of cooking with simple, delicious recipes" },
    { title: "Productivity Hacks", niche: "Self-Improvement", targetAudience: "Professionals", wordCount: 6000, prompt: "Write a productivity guide with actionable hacks", description: "Transform your work efficiency with proven productivity techniques" },
    { title: "Fitness Training", niche: "Health & Fitness", targetAudience: "Intermediate", wordCount: 8500, prompt: "Create a fitness training program for intermediate level", description: "Advanced workout routines to take your fitness to the next level" },
    { title: "Social Media", niche: "Marketing", targetAudience: "Business Owners", wordCount: 9500, prompt: "Write a social media marketing guide for businesses", description: "Build your brand presence and engage customers effectively" }
  ];

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

  const handleGenerateFromSuggestion = (suggestion: BookSuggestion) => {
    const newPrompt = createBookPrompt({
      prompt: suggestion.prompt,
      niche: suggestion.niche,
      targetAudience: suggestion.targetAudience,
      wordCount: suggestion.wordCount
    });
    setCurrentPrompt(newPrompt);
    onGenerateBook(newPrompt);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Hot Selling Genres & Amazon KDP Suggestions
        </CardTitle>
        <CardDescription>
          Generate popular book types that are trending on Amazon KDP
        </CardDescription>
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
            {[
              // Original cards
              ...suggestions.map((suggestion, index) => (
                <div key={index} className="flex-shrink-0 w-44 h-68 border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all duration-300 bg-white hover:border-blue-300 group">
                  {/* Card Header */}
                  <div className="h-16 mb-3">
                    <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">{suggestion.title}</h4>
                  </div>
                  
                  {/* Badges Section - Fixed Height */}
                  <div className="h-20 mb-4 space-y-2">
                    <Badge variant="outline" className="text-xs w-full justify-center bg-gray-50">{suggestion.niche}</Badge>
                    <Badge variant="secondary" className="text-xs w-full justify-center">{suggestion.targetAudience}</Badge>
                    <Badge variant="outline" className="text-xs w-full justify-center bg-blue-50 text-blue-700 border-blue-200">{suggestion.wordCount.toLocaleString()} words</Badge>
                  </div>
                  
                  {/* Description - Fixed Height */}
                  <div className="h-16 mb-4">
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{suggestion.description}</p>
                  </div>
                  
                  {/* Action Buttons - Fixed Height */}
                  <div className="h-20 space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleGenerateFromSuggestion(suggestion)}
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
              )),
              // Duplicate cards for seamless infinite scroll
              ...suggestions.map((suggestion, index) => (
                <div key={`duplicate-${index}`} className="flex-shrink-0 w-44 h-68 border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all duration-300 bg-white hover:border-blue-300 group">
                  {/* Card Header */}
                  <div className="h-16 mb-3">
                    <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">{suggestion.title}</h4>
                  </div>
                  
                  {/* Badges Section - Fixed Height */}
                  <div className="h-20 mb-4 space-y-2">
                    <Badge variant="outline" className="text-xs w-full justify-center bg-gray-50">{suggestion.niche}</Badge>
                    <Badge variant="secondary" className="text-xs w-full justify-center">{suggestion.targetAudience}</Badge>
                    <Badge variant="outline" className="text-xs w-full justify-center bg-blue-50 text-blue-700 border-blue-200">{suggestion.wordCount.toLocaleString()} words</Badge>
                  </div>
                  
                  {/* Description - Fixed Height */}
                  <div className="h-16 mb-4">
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{suggestion.description}</p>
                  </div>
                  
                  {/* Action Buttons - Fixed Height */}
                  <div className="h-20 space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleGenerateFromSuggestion(suggestion)}
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
              ))
            ]}
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
      </CardContent>
    </Card>
  );
};
