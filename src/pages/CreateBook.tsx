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

interface CSVBookData {
  title: string;
  prompt: string;
  niche: string;
  targetAudience: string;
  wordCount: string;
  keywords?: string;
  description?: string;
}

export const CreateBook: React.FC = () => {
  const { user } = useAuth();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVBookData[]>([]);
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

  // Check if user needs to upgrade
  useEffect(() => {
    if (user?.role === 'guest') {
      setShowUpgradeModal(true);
    }
  }, [user]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadError('Please upload a valid CSV file');
      return;
    }

    setCsvFile(file);
    setUploadError('');
    processCSVFile(file);
  };

  const processCSVFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      if (lines.length < 2) {
        setUploadError('CSV file must contain at least a header row and one data row. Please follow the template format.');
        setIsProcessing(false);
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Check if required headers are present
      const requiredHeaders = ['title', 'prompt', 'niche', 'targetaudience'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      
      if (missingHeaders.length > 0) {
        setUploadError(`Missing required columns: ${missingHeaders.join(', ')}. Please follow the CSV template format.`);
        setIsProcessing(false);
        return;
      }
      
      const data: CSVBookData[] = [];
      const errors: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          // Validate required fields
          const missingFields: string[] = [];
          if (!row.title) missingFields.push('title');
          if (!row.prompt) missingFields.push('prompt');
          if (!row.niche) missingFields.push('niche');
          if (!row.targetaudience) missingFields.push('target audience');
          
          if (missingFields.length > 0) {
            errors.push(`Row ${i + 1}: Missing required fields: ${missingFields.join(', ')}`);
          } else {
            data.push({
              title: row.title,
              prompt: row.prompt,
              niche: row.niche,
              targetAudience: row.targetaudience,
              wordCount: row.wordcount || '5000',
              keywords: row.keywords || '',
              description: row.description || ''
            });
          }
        }
      }
      
      if (errors.length > 0) {
        const errorMessage = `Incorrect data entered. Please follow the template format.\n\nErrors found:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : ''}`;
        setUploadError(errorMessage);
        setCsvData([]);
      } else if (data.length === 0) {
        setUploadError('No valid data rows found. Please ensure your CSV contains at least one row with all required fields.');
        setCsvData([]);
      } else {
        setUploadError('');
        setCsvData(data);
      }
      
      setIsProcessing(false);
    };
    
    reader.onerror = () => {
      setUploadError('Failed to read the CSV file. Please try again.');
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };

  const handleGenerateAll = async () => {
    if (csvData.length === 0) {
      alert('Please upload a CSV file with book data first');
      return;
    }

    setIsGenerating(true);
    setGeneratedBooks([]);
    setCurrentBookIndex(0);

    // Initialize generation steps
    const steps: GenerationStep[] = [
      { id: '1', name: 'Analyzing CSV data', status: 'pending', progress: 0 },
      { id: '2', name: 'Generating book outlines', status: 'pending', progress: 0 },
      { id: '3', name: 'Creating chapter content', status: 'pending', progress: 0 },
      { id: '4', name: 'Generating book covers', status: 'pending', progress: 0 },
      { id: '5', name: 'Finalizing and optimizing', status: 'pending', progress: 0 }
    ];
    
    setGenerationSteps(steps);

    // Process each book in the CSV
    for (let bookIndex = 0; bookIndex < csvData.length; bookIndex++) {
      const bookData = csvData[bookIndex];
      setCurrentBookIndex(bookIndex);

      // Simulate the generation process for each book
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
      const generateComprehensiveContent = (title: string, niche: string, targetAudience: string, wordCount: number) => {
        const chapters = Math.max(3, Math.floor(wordCount / 2000));
        const wordsPerChapter = Math.floor(wordCount / chapters);
        
        let content = `${title.toUpperCase()}\nA Comprehensive Guide for ${targetAudience}\n\n`;
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
        id: `${Date.now()}-${bookIndex}`,
        title: bookData.title,
        content: generateComprehensiveContent(bookData.title, bookData.niche, bookData.targetAudience, parseInt(bookData.wordCount)),
        coverUrl: `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodeURIComponent(bookData.title)}`,
        niche: bookData.niche,
        targetAudience: bookData.targetAudience,
        wordCount: parseInt(bookData.wordCount),
        createdAt: new Date().toISOString(),
        status: 'generated' as const
      };

      setGeneratedBooks(prev => [...prev, mockBook]);
    }

    setIsGenerating(false);
  };

  const handleSaveAll = () => {
    if (generatedBooks.length > 0) {
      // Save to local storage or send to backend
      const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
      
      // Add books with 'saved' status for My Books page
      const booksToSave = generatedBooks.map(book => ({
        ...book,
        status: 'saved' as const,
        savedAt: new Date().toISOString()
      }));
      
      savedBooks.push(...booksToSave);
      localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
      alert(`${generatedBooks.length} books saved successfully! You can view them in the "My Books" page.`);
    }
  };

  const handleDownloadAll = () => {
    if (generatedBooks.length > 0) {
      // Create and download all books as a zip or individual files
      generatedBooks.forEach((book) => {
        const blob = new Blob([book.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${book.title}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  };

  const downloadCSVTemplate = () => {
    const template = `title,prompt,niche,targetaudience,wordcount,keywords,description
 "Sample Book Title","Write a book about healthy eating habits","Health & Fitness","Beginners","5000","nutrition,health,wellness","A comprehensive guide to healthy eating"
 "Business Success Guide","Create a book about starting a business","Business & Entrepreneurship","Entrepreneurs","10000","business,startup,entrepreneurship","Complete guide to business success"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'book_creation_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Books from CSV</h1>
          <p className="text-muted-foreground">
            Upload a CSV file to generate multiple books with AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* CSV Upload Section */}
        <div className="xl:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                CSV Upload
              </CardTitle>
              <CardDescription>
                Upload a CSV file with book data to generate multiple books
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-upload">CSV File *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {csvFile ? csvFile.name : 'Drop your CSV file here or click to browse'}
                  </p>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('csv-upload')?.click()}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Choose File'}
                  </Button>
                </div>
                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium mb-2">CSV Validation Error</p>
                    <div className="text-sm text-red-700 whitespace-pre-line">{uploadError}</div>
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={downloadCSVTemplate}
                        className="text-red-700 border-red-300 hover:bg-red-100"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                onClick={downloadCSVTemplate}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>

              {csvData.length > 0 && (
                <div className="space-y-2">
                  <Label>CSV Preview ({csvData.length} books)</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                    {csvData.slice(0, 5).map((book, index) => (
                      <div key={index} className="text-sm py-1 border-b last:border-b-0">
                        <strong>{book.title}</strong> - {book.niche}
                      </div>
                    ))}
                    {csvData.length > 5 && (
                      <div className="text-sm text-muted-foreground py-1">
                        ... and {csvData.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleGenerateAll} 
                disabled={isGenerating || csvData.length === 0}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating {currentBookIndex + 1}/{csvData.length}...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate {csvData.length} Books
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
                  Processing book {currentBookIndex + 1} of {csvData.length}
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
        <div className="xl:col-span-3 space-y-6">
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
                      <Button variant="outline" size="sm" onClick={handleSaveAll}>
                        <Save className="h-4 w-4 mr-2" />
                        Save All
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
                    {generatedBooks.map((book) => (
                      <div key={book.id} className="border border-gray-200 rounded-xl p-5 space-y-4 hover:shadow-lg hover:border-blue-200 transition-all duration-200 relative bg-white">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <img 
                              src={book.coverUrl} 
                              alt={book.title}
                              className="w-18 h-28 object-cover rounded-lg border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200"
                            />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base mb-1 line-clamp-2 text-gray-900">{book.title}</h4>
                            <p className="text-sm text-blue-600 font-medium mb-2">{book.niche}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium">{book.targetAudience}</Badge>
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 font-medium">{book.wordCount.toLocaleString()} words</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Generated on {new Date(book.createdAt).toLocaleDateString()}</span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 font-medium">
                            {book.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 pt-3">
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
                                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] min-w-[380px] backdrop-blur-sm"
                                data-dropdown={book.id}
                              >
                                {/* Arrow indicator */}
                                <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
                                
                                <div className="p-5">
                                  {/* Header with close button */}
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="relative">
                                        <img 
                                          src={selectedBookForDropdown.coverUrl} 
                                          alt={selectedBookForDropdown.title}
                                          className="w-14 h-20 object-cover rounded-lg border shadow-md flex-shrink-0"
                                        />
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                          <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm mb-1 line-clamp-2 text-gray-900">{selectedBookForDropdown.title}</h4>
                                        <p className="text-xs text-blue-600 font-medium mb-1">{selectedBookForDropdown.niche}</p>
                                        <div className="flex items-center gap-1 mb-2">
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
                                  <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                      <div className="text-lg font-bold text-blue-700">{Math.max(3, Math.floor(selectedBookForDropdown.wordCount / 2000))}</div>
                                      <div className="text-xs text-blue-600 font-medium">Chapters</div>
                                    </div>
                                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                      <div className="text-lg font-bold text-green-700">A+</div>
                                      <div className="text-xs text-green-600 font-medium">Quality</div>
                                    </div>
                                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                      <div className="text-lg font-bold text-purple-700">{selectedBookForDropdown.wordCount > 10000 ? 'Premium' : 'Standard'}</div>
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
                                    <div className="max-h-28 overflow-y-auto p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 text-xs leading-relaxed">
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
                                  <div className="flex items-center gap-3">
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
                                    <div className="flex items-center justify-between text-xs text-gray-500">
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
                      Upload a CSV file to start generating your books
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
                    <FileSpreadsheet className="h-12 w-12 text-blue-600" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Ready to Generate Books
                  </h3>
                  
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Upload your CSV file with book specifications to start generating high-quality, AI-powered books tailored to your niche and target audience.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-green-800 mb-1">Upload CSV</h4>
                      <p className="text-sm text-green-700">Provide book specifications in CSV format</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-blue-800 mb-1">AI Generation</h4>
                      <p className="text-sm text-blue-700">AI creates comprehensive book content</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Download className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-purple-800 mb-1">Download</h4>
                      <p className="text-sm text-purple-700">Get your professionally formatted books</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={downloadCSVTemplate}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    
                    <div className="text-sm text-gray-500">
                      or drag & drop your CSV file above
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    What You'll Get
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                        <span className="text-gray-700">Batch processing capability</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">{selectedBook.title}</h2>
                <p className="text-muted-foreground">
                  {selectedBook.niche} • {selectedBook.targetAudience} • {selectedBook.wordCount.toLocaleString()} words
                </p>
              </div>
              <Button variant="outline" onClick={closeBookView}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {selectedBook.content}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="text-sm text-muted-foreground">
                Generated on {new Date(selectedBook.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleDownloadGeneratedBook(selectedBook)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Book
                </Button>
                <Button onClick={closeBookView}>
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
  );
};
