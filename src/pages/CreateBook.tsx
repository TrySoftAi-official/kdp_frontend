import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  FileText, 
  Sparkles, 
  Download, 
  Play,
  Save,
  Eye,
  Target,
  Upload,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { PlanUpgradeModal } from '@/components/shared/PlanUpgradeModal';

interface GenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  result?: string;
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
  status: 'draft' | 'generated' | 'published';
}

interface BookPrompt {
  id: string;
  prompt: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  keywords?: string;
  description?: string;
  createdAt: string;
}

export const CreateBook: React.FC = () => {
  const { user } = useAuth();
  const [bookPrompts, setBookPrompts] = useState<BookPrompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<BookPrompt | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [generatedBooks, setGeneratedBooks] = useState<GeneratedBook[]>([]);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [uploadError, setUploadError] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<GeneratedBook | null>(null);
  const [showBookView, setShowBookView] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [selectedBookForDropdown, setSelectedBookForDropdown] = useState<GeneratedBook | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [animationPaused, setAnimationPaused] = useState(false);

  // Check if user needs to upgrade
  useEffect(() => {
    if (user?.role === 'guest') {
      setShowUpgradeModal(true);
    }
  }, [user]);

  // Initialize currentPrompt with empty values
  useEffect(() => {
    if (!currentPrompt) {
      setCurrentPrompt({
        id: '',
        prompt: '',
        niche: '',
        targetAudience: '',
        wordCount: 5000,
        keywords: '',
        description: '',
        createdAt: ''
      });
    }
  }, [currentPrompt]);

  const handlePromptSubmit = (prompt: BookPrompt) => {
    setCurrentPrompt(prompt);
    setBookPrompts(prev => [...prev, prompt]);
    setUploadError('');
  };

  const createBookPrompt = (promptData: Omit<BookPrompt, 'id' | 'createdAt'>) => {
    const newPrompt: BookPrompt = {
      ...promptData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    return newPrompt;
  };

  const handleGenerateBook = async (prompt: BookPrompt) => {
    if (!prompt) {
      alert('Please provide a book prompt first');
      return;
    }

    // Extract niche and target audience from the prompt if not provided
    const extractedNiche = prompt.niche || 'General';
    const extractedTargetAudience = prompt.targetAudience || 'General Audience';

    setIsGenerating(true);
    setGeneratedBooks([]);
    setCurrentBookIndex(0);

    // Initialize generation steps
    const steps: GenerationStep[] = [
      { id: '1', name: 'Analyzing prompt', status: 'pending', progress: 0 },
      { id: '2', name: 'Generating book outline', status: 'pending', progress: 0 },
      { id: '3', name: 'Creating chapter content', status: 'pending', progress: 0 },
      { id: '4', name: 'Generating book cover', status: 'pending', progress: 0 },
      { id: '5', name: 'Finalizing and optimizing', status: 'pending', progress: 0 }
    ];
    
    setGenerationSteps(steps);

    // Process the book generation
    setCurrentBookIndex(0);

      // Simulate the generation process
      for (let i = 0; i < steps.length; i++) {
        // Update step to running
        setGenerationSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'running', progress: 0 } : step
        ));

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setGenerationSteps(prev => prev.map((step, index) => 
            index === i ? { ...step, progress } : step
          ));
        }

        // Complete step
        setGenerationSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'completed', progress: 100 } : step
        ));

        // Start next step if not the last one
        if (i < steps.length - 1) {
          setGenerationSteps(prev => prev.map((step, index) => 
            index === i + 1 ? { ...step, status: 'running', progress: 0 } : step
          ));
        }
      }

      // Generate comprehensive mock book data
      const generateComprehensiveContent = (prompt: string, niche: string, targetAudience: string, wordCount: number) => {
        const chapters = Math.max(3, Math.floor(wordCount / 2000));
        const wordsPerChapter = Math.floor(wordCount / chapters);
        
        let content = `${prompt.toUpperCase()}\nA Comprehensive Guide for ${targetAudience}\n\n`;
        content += `Table of Contents\n`;
        for (let i = 1; i <= chapters; i++) {
          content += `${i}. Chapter ${i}\n`;
        }
        content += `\n`;

        for (let i = 1; i <= chapters; i++) {
          content += `CHAPTER ${i}: ${getChapterTitle(i, niche, targetAudience)}\n\n`;
          content += `${getChapterContent(i, niche, targetAudience, wordsPerChapter)}\n\n`;
        }

        content += `CONCLUSION\n\n`;
        content += `In conclusion, this comprehensive guide has provided you with essential knowledge and practical strategies for success in ${niche.toLowerCase()}. Whether you're a ${targetAudience.toLowerCase()} or an experienced professional, the insights shared in this book will help you achieve your goals and overcome challenges.\n\n`;
        content += `Remember that success is a journey, not a destination. Apply the principles and strategies outlined in this guide consistently, and you'll see remarkable improvements in your ${niche.toLowerCase()} endeavors.\n\n`;
        content += `Thank you for choosing this guide as your companion on this journey. Your dedication to learning and growth will undoubtedly lead to outstanding results.\n\n`;
        content += `Best wishes for your continued success!\n\n`;
        content += `---\n`;
        content += `Generated with AI assistance for educational purposes.\n`;
        content += `Word count: ${wordCount.toLocaleString()} words\n`;
        content += `Target audience: ${targetAudience}\n`;
        content += `Niche: ${niche}\n`;

        return content;
      };

      const getChapterTitle = (chapterNum: number, niche: string, targetAudience: string): string => {
        const titles = {
          1: `Introduction to ${niche}`,
          2: `Understanding the Fundamentals`,
          3: `Advanced Strategies and Techniques`,
          4: `Practical Applications`,
          5: `Overcoming Common Challenges`,
          6: `Best Practices and Optimization`,
          7: `Scaling and Growth`,
          8: `Future Trends and Opportunities`,
          9: `Case Studies and Success Stories`,
          10: `Implementation and Action Plan`
        };
        return titles[chapterNum as keyof typeof titles] || `Chapter ${chapterNum}`;
      };

      const getChapterContent = (chapterNum: number, niche: string, targetAudience: string, wordCount: number): string => {
        const baseContent = `This chapter provides comprehensive insights into ${niche.toLowerCase()} specifically tailored for ${targetAudience.toLowerCase()}. We'll explore essential concepts, practical strategies, and actionable tips that will help you succeed in this field.\n\n`;
        
        const detailedContent = `Understanding the fundamentals is crucial for success in any ${niche.toLowerCase()} endeavor. This chapter breaks down complex concepts into digestible, actionable information that you can immediately apply to your projects and goals.\n\n`;
        
        const practicalContent = `Real-world application is where theory meets practice. In this chapter, we'll examine case studies, analyze successful strategies, and provide step-by-step guidance for implementing what you've learned.\n\n`;
        
        const advancedContent = `Once you've mastered the basics, it's time to explore advanced techniques and strategies. This chapter delves into sophisticated approaches that can give you a competitive edge in the ${niche.toLowerCase()} landscape.\n\n`;
        
        const optimizationContent = `Optimization is the key to maximizing your results. This chapter focuses on fine-tuning your approach, identifying opportunities for improvement, and implementing best practices that drive success.\n\n`;

        const contents = [
          baseContent,
          detailedContent,
          practicalContent,
          advancedContent,
          optimizationContent
        ];

        const selectedContent = contents[(chapterNum - 1) % contents.length];
        const expandedContent = selectedContent.repeat(Math.ceil(wordCount / selectedContent.length));
        
        return expandedContent.substring(0, wordCount);
      };

             const mockBook: GeneratedBook = {
         id: `${Date.now()}-0`,
         title: prompt.prompt,
         content: generateComprehensiveContent(prompt.prompt, extractedNiche, extractedTargetAudience, prompt.wordCount),
         coverUrl: `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodeURIComponent(prompt.prompt)}`,
         niche: extractedNiche,
         targetAudience: extractedTargetAudience,
         wordCount: prompt.wordCount,
         createdAt: new Date().toISOString(),
         status: 'generated' as const
       };

      setGeneratedBooks(prev => [...prev, mockBook]);

    setIsGenerating(false);
  };

  const handleSaveBook = (book: GeneratedBook) => {
    // Save to local storage or send to backend
    const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
    
    // Add book with 'saved' status for My Books page
    const bookToSave = {
      ...book,
      status: 'saved' as const,
      savedAt: new Date().toISOString()
    };
    
    savedBooks.push(bookToSave);
    localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
    alert('Book saved successfully! You can view it in the "My Books" page.');
  };

  const handleDownloadBook = (book: GeneratedBook) => {
    const blob = new Blob([book.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreviewSuggestion = (suggestion: any) => {
    // Show preview modal with suggestion details
    setSelectedBook({
      id: 'preview',
      title: suggestion.title,
      content: `This is a preview of "${suggestion.title}" - ${suggestion.description}\n\nNiche: ${suggestion.niche}\nTarget Audience: ${suggestion.targetAudience}\nWord Count: ${suggestion.wordCount.toLocaleString()} words\n\nPrompt: ${suggestion.prompt}`,
      coverUrl: `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodeURIComponent(suggestion.title)}`,
      niche: suggestion.niche,
      targetAudience: suggestion.targetAudience,
      wordCount: suggestion.wordCount,
      createdAt: new Date().toISOString(),
      status: 'draft' as const
    });
    setShowBookView(true);
  };

  const handleViewGeneratedBook = (book: GeneratedBook) => {
    setSelectedBook(book);
    setShowBookView(true);
  };

  const handleDownloadGeneratedBook = (book: GeneratedBook) => {
    const blob = new Blob([book.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const closeBookView = () => {
    setShowBookView(false);
    setSelectedBook(null);
  };

  const handleViewDropdown = (book: GeneratedBook, event: React.MouseEvent) => {
    event.stopPropagation();
    if (showDropdown === book.id) {
      setShowDropdown(null);
      setSelectedBookForDropdown(null);
    } else {
      // Close any other open dropdown first
      setShowDropdown(book.id);
      setSelectedBookForDropdown(book);
      
      // Ensure the dropdown is visible by scrolling if needed
      setTimeout(() => {
        const dropdownElement = document.querySelector(`[data-dropdown="${book.id}"]`);
        if (dropdownElement) {
          dropdownElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  };

  const closeDropdown = () => {
    setShowDropdown(null);
    setSelectedBookForDropdown(null);
  };

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest('.dropdown-container')) {
        closeDropdown();
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <div className="min-h-screen bg-gray-50 page-container">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Books with AI</h1>
          <p className="text-muted-foreground">
            Generate high-quality books from your prompts using AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Suggested Book Generation Slider */}
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
              {(() => {
                const suggestions = [
                  { title: "Weight Loss Guide", niche: "Health & Fitness", targetAudience: "Beginners", wordCount: 8000, prompt: "Create a comprehensive weight loss guide for beginners", description: "A complete guide to healthy weight loss with proven strategies and meal plans" },
                  { title: "Business Startup", niche: "Business & Entrepreneurship", targetAudience: "Entrepreneurs", wordCount: 10000, prompt: "Write a complete guide to starting a business from scratch", description: "Step-by-step guide to launching your own successful business venture" },
                  { title: "Digital Marketing", niche: "Marketing", targetAudience: "Professionals", wordCount: 12000, prompt: "Create a digital marketing strategy guide for businesses", description: "Comprehensive digital marketing strategies for modern businesses" },
                  { title: "Personal Finance", niche: "Finance", targetAudience: "Young Adults", wordCount: 9000, prompt: "Write a personal finance guide for young adults", description: "Essential money management skills for financial independence" },
                  { title: "Cooking Basics", niche: "Food & Cooking", targetAudience: "Beginners", wordCount: 7000, prompt: "Create a beginner's guide to cooking healthy meals", description: "Master the fundamentals of cooking with simple, delicious recipes" },
                  { title: "Productivity Hacks", niche: "Self-Improvement", targetAudience: "Professionals", wordCount: 6000, prompt: "Write a productivity guide with actionable hacks", description: "Transform your work efficiency with proven productivity techniques" },
                  { title: "Fitness Training", niche: "Health & Fitness", targetAudience: "Intermediate", wordCount: 8500, prompt: "Create a fitness training program for intermediate level", description: "Advanced workout routines to take your fitness to the next level" },
                  { title: "Social Media", niche: "Marketing", targetAudience: "Business Owners", wordCount: 9500, prompt: "Write a social media marketing guide for businesses", description: "Build your brand presence and engage customers effectively" }
                ];
                
                return [
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
                          onClick={() => {
                            const newPrompt = createBookPrompt({
                              prompt: suggestion.prompt,
                              niche: suggestion.niche,
                              targetAudience: suggestion.targetAudience,
                              wordCount: suggestion.wordCount
                            });
                            setCurrentPrompt(newPrompt);
                            handleGenerateBook(newPrompt);
                          }}
                        >
                          <Sparkles className="h-3 w-3 mr-2" />
                          Generate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                          onClick={() => handlePreviewSuggestion(suggestion)}
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
                          onClick={() => {
                            const newPrompt = createBookPrompt({
                              prompt: suggestion.prompt,
                              niche: suggestion.niche,
                              targetAudience: suggestion.targetAudience,
                              wordCount: suggestion.wordCount
                            });
                            setCurrentPrompt(newPrompt);
                            handleGenerateBook(newPrompt);
                          }}
                        >
                          <Sparkles className="h-3 w-3 mr-2" />
                          Generate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                          onClick={() => handlePreviewSuggestion(suggestion)}
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))
                ];
              })()}
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

      <div className="space-y-6">
        {/* Book Prompt Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Book Prompt
              </CardTitle>
              <CardDescription>
                Describe your book idea and AI will generate the content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="book-prompt">Book Description *</Label>
                <textarea
                  id="book-prompt"
                  placeholder="Describe your book idea, topic, target audience, niche, and any specific requirements. For example: 'Write a comprehensive guide to starting a business from scratch, targeting entrepreneurs and beginners in the business niche, with practical steps and strategies.'"
                  className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={currentPrompt?.prompt || ''}
                  onChange={(e) => setCurrentPrompt(prev => prev ? { ...prev, prompt: e.target.value } : null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="word-count">Word Count</Label>
                <Input
                  id="word-count"
                  type="number"
                  placeholder="5000"
                  value={currentPrompt?.wordCount || 5000}
                  onChange={(e) => setCurrentPrompt(prev => prev ? { ...prev, wordCount: parseInt(e.target.value) || 5000 } : null)}
                />
              </div>

              <Button 
                onClick={() => currentPrompt && handleGenerateBook(currentPrompt)} 
                disabled={isGenerating || !currentPrompt?.prompt}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating Book...
                  </>
                  ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Book
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generation Progress */}
          {isGenerating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Generation Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Generating your book...
                </div>
                {generationSteps.map((step) => (
                  <div key={step.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn(
                        step.status === 'completed' && 'text-green-600',
                        step.status === 'running' && 'text-blue-600',
                        step.status === 'error' && 'text-red-600'
                      )}>
                        {step.name}
                      </span>
                      <span className="text-muted-foreground">
                        {step.progress}%
                      </span>
                    </div>
                    <Progress value={step.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {generatedBooks.length > 0 ? (
            <>
              {/* Generated Books Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Generated Books ({generatedBooks.length})
                      </CardTitle>
                      <CardDescription>
                        All books have been successfully generated!
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => generatedBooks[0] && handleSaveBook(generatedBooks[0])}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Book
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => generatedBooks[0] && handleDownloadBook(generatedBooks[0])}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Book
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6">
                    {generatedBooks.map((book) => (
                      <div key={book.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-200 relative bg-white">
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
                            <p className="text-sm text-blue-600 font-medium mb-3">{book.niche}</p>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium">{book.targetAudience}</Badge>
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 font-medium">{book.wordCount.toLocaleString()} words</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-100 gap-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Generated on {new Date(book.createdAt).toLocaleDateString()}</span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 font-medium self-start sm:self-center">
                            {book.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-3">
                          <div className="relative dropdown-container flex-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                              onClick={(e) => handleViewDropdown(book, e)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            
                            {/* Professional Dropdown View */}
                            {showDropdown === book.id && selectedBookForDropdown && (
                              <div 
                                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] w-full max-w-sm sm:max-w-md backdrop-blur-sm"
                                data-dropdown={book.id}
                              >
                                {/* Arrow indicator */}
                                <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
                                
                                <div className="p-4 sm:p-5">
                                  {/* Header with close button */}
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="relative">
                                        <img 
                                          src={selectedBookForDropdown.coverUrl} 
                                          alt={selectedBookForDropdown.title}
                                          className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-lg border shadow-md flex-shrink-0"
                                        />
                                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm mb-1 line-clamp-2 text-gray-900">{selectedBookForDropdown.title}</h4>
                                        <p className="text-xs text-blue-600 font-medium mb-1">{selectedBookForDropdown.niche}</p>
                                        <div className="flex flex-wrap items-center gap-1 mb-2">
                                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{selectedBookForDropdown.targetAudience}</Badge>
                                          <Badge variant="secondary" className="text-xs bg-gray-100">{selectedBookForDropdown.wordCount.toLocaleString()} words</Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                      onClick={closeDropdown}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  {/* Stats Grid */}
                                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                      <div className="text-base sm:text-lg font-bold text-blue-700">{Math.max(3, Math.floor(selectedBookForDropdown.wordCount / 2000))}</div>
                                      <div className="text-xs text-blue-600 font-medium">Chapters</div>
                                    </div>
                                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                      <div className="text-base sm:text-lg font-bold text-green-700">A+</div>
                                      <div className="text-xs text-green-600 font-medium">Quality</div>
                                    </div>
                                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                      <div className="text-base sm:text-lg font-bold text-purple-700">{selectedBookForDropdown.wordCount > 10000 ? 'Premium' : 'Standard'}</div>
                                      <div className="text-xs text-purple-600 font-medium">Tier</div>
                                    </div>
                                  </div>
                                  
                                  <Separator className="my-4" />
                                  
                                  {/* Content Preview */}
                                  <div className="mb-4">
                                    <h5 className="font-semibold text-sm mb-3 flex items-center gap-2 text-gray-800">
                                      <FileText className="h-4 w-4 text-blue-600" />
                                      Content Preview
                                    </h5>
                                    <div className="max-h-24 sm:max-h-28 overflow-y-auto p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 text-xs leading-relaxed">
                                      <div className="space-y-2">
                                        <p className="font-semibold text-gray-800">
                                          📚 Table of Contents
                                        </p>
                                        <p className="text-gray-700">
                                          This comprehensive guide provides essential knowledge and practical strategies for success in <span className="font-medium text-blue-600">{selectedBookForDropdown.niche.toLowerCase()}</span>. Tailored specifically for <span className="font-medium text-green-600">{selectedBookForDropdown.targetAudience.toLowerCase()}</span>, this book contains <span className="font-bold">{selectedBookForDropdown.wordCount.toLocaleString()} words</span> of high-quality, actionable content.
                                        </p>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <span className="text-xs">Professional writing style</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="text-xs">SEO optimized content</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                          <span className="text-xs">Engaging storytelling</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
                                    <Button 
                                      variant="default" 
                                      size="sm" 
                                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                      onClick={() => handleViewGeneratedBook(selectedBookForDropdown)}
                                    >
                                      <Eye className="h-3 w-3 mr-2" />
                                      Full View
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                                      onClick={() => handleDownloadGeneratedBook(selectedBookForDropdown)}
                                    >
                                      <Download className="h-3 w-3 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                  
                                  {/* Footer */}
                                  <div className="mt-4 pt-3 border-t border-gray-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-2">
                                      <span>Generated on {new Date(selectedBookForDropdown.createdAt).toLocaleDateString()}</span>
                                      <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Ready to publish
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors duration-200"
                            onClick={() => handleDownloadGeneratedBook(book)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Empty State - Formal View */
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Book Generation Workspace
                    </CardTitle>
                                         <CardDescription>
                       Enter your book description to start generating
                     </CardDescription>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Ready
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                                     <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-6">
                     <FileText className="h-12 w-12 text-blue-600" />
                   </div>
                   
                   <h3 className="text-xl font-semibold text-gray-900 mb-3">
                     Ready to Generate Books
                   </h3>
                   
                   <p className="text-gray-600 mb-6 max-w-md mx-auto">
                     Describe your book idea in detail and AI will generate high-quality content tailored to your requirements.
                   </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-green-800 mb-1 text-sm sm:text-base">Write Prompt</h4>
                      <p className="text-xs sm:text-sm text-green-700">Describe your book idea and topic</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-blue-800 mb-1 text-sm sm:text-base">AI Generation</h4>
                      <p className="text-xs sm:text-sm text-blue-700">AI creates comprehensive book content</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Download className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-purple-800 mb-1 text-sm sm:text-base">Download</h4>
                      <p className="text-xs sm:text-sm text-purple-700">Get your professionally formatted book</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500">
                      Start by entering your book prompt above
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Target className="h-4 w-4 text-blue-600" />
                    What You'll Get
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Professional book content with chapters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">SEO-optimized writing style</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Target audience-specific content</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Customizable word count</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Multiple format downloads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Professional formatting</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Book View Modal */}
      {showBookView && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold line-clamp-2">{selectedBook.title}</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {selectedBook.niche} • {selectedBook.targetAudience} • {selectedBook.wordCount.toLocaleString()} words
                </p>
              </div>
              <Button variant="outline" onClick={closeBookView} className="flex-shrink-0">
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
                  onClick={() => handleDownloadGeneratedBook(selectedBook)}
                  size="sm"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Download Book
                </Button>
                <Button onClick={closeBookView} size="sm">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredFeature="Book Creation"
        currentPlan={user?.subscription?.plan || 'free'}
      />
      </div>
    </div>
  );
};
