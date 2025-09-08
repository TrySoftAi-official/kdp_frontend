import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  FileText, 
  Sparkles, 
  Download, 
  Save,
  Eye,
  Target,
  X
} from 'lucide-react';
import { GeneratedBook } from './types';
import { useCreateBookContext } from './CreateBookContext';

interface BookWorkspaceProps {
  onSaveBook: (book: GeneratedBook) => void;
  onDownloadBook: (book: GeneratedBook) => void;
  onViewBook: (book: GeneratedBook) => void;
}

export const BookWorkspace: React.FC<BookWorkspaceProps> = ({
  onSaveBook,
  onDownloadBook,
  onViewBook
}) => {
  const { generatedBooks } = useCreateBookContext();
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [selectedBookForDropdown, setSelectedBookForDropdown] = useState<GeneratedBook | null>(null);

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

  if (generatedBooks.length === 0) {
    return (
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
    );
  }

  return (
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
            <Button variant="outline" size="sm" onClick={() => generatedBooks[0] && onSaveBook(generatedBooks[0])}>
              <Save className="h-4 w-4 mr-2" />
              Save Book
            </Button>
            <Button variant="outline" size="sm" onClick={() => generatedBooks[0] && onDownloadBook(generatedBooks[0])}>
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
                            onClick={() => onViewBook(selectedBookForDropdown)}
                          >
                            <Eye className="h-3 w-3 mr-2" />
                            Full View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => onDownloadBook(selectedBookForDropdown)}
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
                  onClick={() => onDownloadBook(book)}
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
  );
};
