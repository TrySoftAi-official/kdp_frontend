import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Upload, 
 
  Globe, 
  DollarSign, 

  CheckCircle,
  AlertCircle,

  Download,
  Eye,
  Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookForPublishing {
  id: string;
  title: string;
  content: string;
  coverUrl: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  createdAt: string;
  status: 'draft' | 'generated' | 'ready' | 'published';
  metadata?: {
    subtitle?: string;
    description?: string;
    keywords?: string[];
    categories?: string[];
    price?: number;
    language?: string;
    isbn?: string;
  };
}

export const Publish: React.FC = () => {
  const [books, setBooks] = useState<BookForPublishing[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookForPublishing | null>(null);


  useEffect(() => {
    // Load saved books from localStorage
    const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
    setBooks(savedBooks);
  }, []);

  const handlePublish = async (bookId: string) => {
    // Simulate publishing process
    setBooks(prev => prev.map(book => 
      book.id === bookId 
        ? { ...book, status: 'published' as const }
        : book
    ));
    
    // Here you would integrate with KDP API
    alert('Book published successfully to Amazon KDP!');
  };

  const handleUpdateMetadata = (bookId: string, metadata: any) => {
    setBooks(prev => prev.map(book => 
      book.id === bookId 
        ? { ...book, metadata: { ...book.metadata, ...metadata } }
        : book
    ));
  };

  const categories = [
    'Self-Help',
    'Business & Money',
    'Health, Fitness & Dieting',
    'Cookbooks, Food & Wine',
    'Travel',
    'Romance',
    'Computers & Technology',
    'Parenting & Relationships',
    'Investing',
    'Education & Teaching'
  ];

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Japanese',
    'Chinese',
    'Korean',
    'Russian'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Publish Books</h1>
          <p className="text-muted-foreground">
            Prepare and publish your AI-generated books to Amazon KDP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            KDP Ready
          </Badge>
        </div>
      </div>

      {books.length === 0 ? (
        /* Empty State */
        <Card className="h-96 flex items-center justify-center">
          <CardContent className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Books Ready for Publishing</h3>
              <p className="text-muted-foreground">
                Create and save books first, then come back here to publish them to Amazon KDP.
              </p>
            </div>
            <Button asChild>
              <a href="/create">Create Your First Book</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Books List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Books</CardTitle>
                <CardDescription>
                  Select a book to prepare for publishing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      selectedBook?.id === book.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="flex items-start gap-3">
                      <img 
                        src={book.coverUrl} 
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{book.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {book.wordCount.toLocaleString()} words
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={book.status === 'published' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {book.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {book.niche.split(' ')[0]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Book Details & Publishing */}
          <div className="lg:col-span-2">
            {selectedBook ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {selectedBook.title}
                      </CardTitle>
                      <CardDescription>
                        Prepare this book for publishing to Amazon KDP
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        onClick={() => handlePublish(selectedBook.id)}
                        disabled={selectedBook.status === 'published'}
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {selectedBook.status === 'published' ? 'Published' : 'Publish to KDP'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overview Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {selectedBook.wordCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Words</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {selectedBook.niche.split(' ')[0]}
                        </div>
                        <div className="text-sm text-muted-foreground">Niche</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {selectedBook.targetAudience}
                        </div>
                        <div className="text-sm text-muted-foreground">Audience</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {selectedBook.status === 'published' ? (
                            <CheckCircle className="h-6 w-6 mx-auto text-green-600" />
                          ) : (
                            <AlertCircle className="h-6 w-6 mx-auto text-yellow-600" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">Status</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Metadata Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Input
                          id="subtitle"
                          placeholder="Enter book subtitle"
                          value={selectedBook.metadata?.subtitle || ''}
                          onChange={(e) => handleUpdateMetadata(selectedBook.id, { subtitle: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select 
                          value={selectedBook.metadata?.language || 'English'}
                          onValueChange={(value) => handleUpdateMetadata(selectedBook.id, { language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="categories">Categories</Label>
                        <Select 
                          value={selectedBook.metadata?.categories?.[0] || ''}
                          onValueChange={(value) => handleUpdateMetadata(selectedBook.id, { categories: [value] })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="isbn">ISBN (Optional)</Label>
                        <Input
                          id="isbn"
                          placeholder="Enter ISBN if available"
                          value={selectedBook.metadata?.isbn || ''}
                          onChange={(e) => handleUpdateMetadata(selectedBook.id, { isbn: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="description">Book Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Write a compelling description for your book..."
                        rows={4}
                        value={selectedBook.metadata?.description || ''}
                        onChange={(e) => handleUpdateMetadata(selectedBook.id, { description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                      <Input
                        id="keywords"
                        placeholder="keyword1, keyword2, keyword3..."
                        value={selectedBook.metadata?.keywords?.join(', ') || ''}
                        onChange={(e) => handleUpdateMetadata(selectedBook.id, { 
                          keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                        })}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Cover Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Cover</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <img 
                          src={selectedBook.coverUrl} 
                          alt="Book Cover"
                          className="w-48 h-64 object-cover rounded-lg border shadow-sm"
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Cover Preview</h4>
                          <p className="text-sm text-muted-foreground">
                            This is the AI-generated cover for your book. You can customize it or generate a new one.
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Customize Cover
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download Cover
                          </Button>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <h5 className="font-medium mb-2">Cover Requirements</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Minimum resolution: 1600 x 2400 pixels</li>
                            <li>• Format: JPEG or TIFF</li>
                            <li>• File size: Under 50MB</li>
                            <li>• No text in the bottom 15% of the image</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (USD)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            id="price"
                            type="number"
                            min="0.99"
                            step="0.01"
                            placeholder="9.99"
                            className="pl-8"
                            value={selectedBook.metadata?.price || ''}
                            onChange={(e) => handleUpdateMetadata(selectedBook.id, { 
                              price: parseFloat(e.target.value) || 0 
                            })}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Minimum price: $0.99 for Kindle Direct Publishing
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Royalty Rate</Label>
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">70%</div>
                          <div className="text-sm text-muted-foreground">
                            Standard KDP royalty rate for books priced between $2.99 - $9.99
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg mt-4">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Estimated Earnings
                      </h5>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            ${((selectedBook.metadata?.price || 0) * 0.7).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">Per Sale</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">100</div>
                          <div className="text-sm text-muted-foreground">Monthly Sales</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            ${((selectedBook.metadata?.price || 0) * 0.7 * 100).toFixed(0)}
                          </div>
                          <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Select a Book</h3>
                    <p className="text-muted-foreground">
                      Choose a book from the list to prepare it for publishing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

