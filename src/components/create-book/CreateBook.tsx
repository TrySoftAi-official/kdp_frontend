import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { PlanUpgradeModal } from '@/components/shared/PlanUpgradeModal';
import { useAuth } from '@/hooks/useAuth';
import { CreateBookProvider, useCreateBookContext } from './CreateBookContext';
import { HotSellingGenres } from './HotSellingGenres';
import { BookPrompt } from './BookPrompt';
import { GenerationProgress } from './GenerationProgress';
import { BookWorkspace } from './BookWorkspace';
import { BookViewModal } from './BookViewModal';
import { BookPrompt as BookPromptType, GeneratedBook, BookSuggestion, GenerationStep } from './types';

const CreateBookContent: React.FC = () => {
  const { user } = useAuth();
  const {
    currentPrompt,
    setCurrentPrompt,
    isGenerating,
    setIsGenerating,
    generationSteps,
    setGenerationSteps,
    generatedBooks,
    setGeneratedBooks,
    selectedBook,
    setSelectedBook,
    showBookView,
    setShowBookView,
    showUpgradeModal,
    setShowUpgradeModal
  } = useCreateBookContext();

  const createBookPrompt = (promptData: Omit<BookPromptType, 'id' | 'createdAt'>) => {
    const newPrompt: BookPromptType = {
      ...promptData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    return newPrompt;
  };

  const handleGenerateBook = async (prompt: BookPromptType) => {
    if (!prompt) {
      alert('Please provide a book prompt first');
      return;
    }

    // Extract niche and target audience from the prompt if not provided
    const extractedNiche = prompt.niche || 'General';
    const extractedTargetAudience = prompt.targetAudience || 'General Audience';

    setIsGenerating(true);
    setGeneratedBooks([]);

    // Initialize generation steps
    const steps: GenerationStep[] = [
      { id: '1', name: 'Analyzing prompt', status: 'pending', progress: 0 },
      { id: '2', name: 'Generating book outline', status: 'pending', progress: 0 },
      { id: '3', name: 'Creating chapter content', status: 'pending', progress: 0 },
      { id: '4', name: 'Generating book cover', status: 'pending', progress: 0 },
      { id: '5', name: 'Finalizing and optimizing', status: 'pending', progress: 0 }
    ];
    
    setGenerationSteps(steps);

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

    const getChapterTitle = (chapterNum: number, niche: string, _targetAudience: string): string => {
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

  const handlePreviewSuggestion = (suggestion: BookSuggestion) => {
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

  const closeBookView = () => {
    setShowBookView(false);
    setSelectedBook(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 page-container">
      <div className="max-w-4xl mx-auto px-4 sm:px-2 py-2 space-y-2">
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

        {/* Hot Selling Genres Section */}
        <HotSellingGenres
          onGenerateBook={handleGenerateBook}
          onPreviewSuggestion={handlePreviewSuggestion}
        />

        <div className="space-y-6">
          {/* Book Prompt Input Section */}
          <div className="space-y-6">
            <BookPrompt onGenerateBook={handleGenerateBook} />

            {/* Generation Progress */}
            {isGenerating && (
              <GenerationProgress generationSteps={generationSteps} />
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <BookWorkspace
              onSaveBook={handleSaveBook}
              onDownloadBook={handleDownloadBook}
              onViewBook={handleViewGeneratedBook}
            />
          </div>
        </div>

        {/* Book View Modal */}
        <BookViewModal
          selectedBook={selectedBook}
          showBookView={showBookView}
          onClose={closeBookView}
          onDownloadBook={handleDownloadBook}
        />

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

export const CreateBook: React.FC = () => {
  return (
    <CreateBookProvider>
      <CreateBookContent />
    </CreateBookProvider>
  );
};
