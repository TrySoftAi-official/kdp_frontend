import React, { useState } from 'react';
import { useBooksQuery } from '@/hooks/useBooksQuery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Plus, Search, Filter } from 'lucide-react';
import { BookFilter, BookSort } from '@/services/bookService';

/**
 * Example component showing how to integrate the books API hooks
 * This demonstrates the complete book management workflow
 */
export const BooksIntegrationExample: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState<BookFilter>({});
  const [sort, setSort] = useState<BookSort>({ field: 'created_at', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [newBookPrompt, setNewBookPrompt] = useState('');

  // Queries
  const { data: booksData, isLoading: booksLoading, error: booksError } = useBooksQuery().useBooks(page, limit, filters, sort);
  const { data: genres, isLoading: genresLoading } = useBooksQuery().useGenres();
  const { data: hotGenres } = useBooksQuery().useHotSellingGenres(5);
  const { data: niches } = useBooksQuery().useNiches();
  const { data: bookSuggestions } = useBooksQuery().useBookSuggestions(3);

  // Mutations
  const createBookMutation = useBooksQuery().useCreateBook();
  const generateBookMutation = useBooksQuery().useGenerateBook();
  const updateBookMutation = useBooksQuery().useUpdateBook();
  const deleteBookMutation = useBooksQuery().useDeleteBook();
  const publishBookMutation = useBooksQuery().usePublishBook();

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPage(1);
  };

  const handleFilterChange = (key: keyof BookFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSortChange = (field: string) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCreateBook = async () => {
    if (!newBookPrompt.trim()) return;
    
    try {
      await createBookMutation.mutateAsync({
        prompt: newBookPrompt,
        niche: 'technology',
        targetAudience: 'developers',
        wordCount: 5000,
        genre: 'non_fiction'
      });
      setNewBookPrompt('');
    } catch (error) {
      console.error('Failed to create book:', error);
    }
  };

  const handleGenerateBook = async (prompt: string) => {
    try {
      await generateBookMutation.mutateAsync({
        prompt,
        niche: 'technology',
        targetAudience: 'developers',
        wordCount: 5000,
        genre: 'non_fiction'
      });
    } catch (error) {
      console.error('Failed to generate book:', error);
    }
  };

  const handlePublishBook = async (bookId: string) => {
    try {
      await publishBookMutation.mutateAsync({ bookId, platform: 'kdp' });
    } catch (error) {
      console.error('Failed to publish book:', error);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBookMutation.mutateAsync(bookId);
      } catch (error) {
        console.error('Failed to delete book:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Books Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and publish your books with AI assistance
          </p>
        </div>
        <Button onClick={() => setNewBookPrompt('')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Book
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Genre</Label>
              <Select onValueChange={(value) => handleFilterChange('genre', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All genres</SelectItem>
                  {genres?.map((genre) => (
                    <SelectItem key={genre.id} value={genre.name}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="generated">Generated</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Sort by</Label>
              <Select onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="word_count">Word Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hot Selling Genres */}
      {hotGenres && hotGenres.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hot Selling Genres</CardTitle>
            <CardDescription>
              Trending genres with high revenue potential
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hotGenres.map((genre) => (
                <Badge key={genre.id} variant="secondary" className="cursor-pointer">
                  {genre.name} (${genre.avgRevenue.toFixed(2)} avg)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Book Suggestions */}
      {bookSuggestions && bookSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Book Suggestions</CardTitle>
            <CardDescription>
              AI-generated book ideas based on market trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookSuggestions.map((suggestion) => (
                <div key={suggestion.title} className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{suggestion.niche}</Badge>
                    <Badge variant="outline">{suggestion.targetAudience}</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleGenerateBook(suggestion.prompt)}
                    className="w-full"
                  >
                    Generate This Book
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Book */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Book</CardTitle>
          <CardDescription>
            Describe your book idea and let AI generate the content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="book-prompt">Book Description</Label>
            <Textarea
              id="book-prompt"
              placeholder="Describe the book you want to create... (e.g., 'A comprehensive guide to React development for beginners')"
              value={newBookPrompt}
              onChange={(e) => setNewBookPrompt(e.target.value)}
              rows={4}
            />
          </div>
          <Button 
            onClick={handleCreateBook}
            disabled={createBookMutation.isPending || !newBookPrompt.trim()}
            className="w-full"
          >
            {createBookMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Book
          </Button>
        </CardContent>
      </Card>

      {/* Books List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Books</CardTitle>
          <CardDescription>
            {booksData ? `${booksData.total} books found` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {booksLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : booksError ? (
            <div className="text-center py-8">
              <p className="text-destructive">Failed to load books</p>
            </div>
          ) : booksData && booksData.books.length > 0 ? (
            <div className="space-y-4">
              {booksData.books.map((book) => (
                <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{book.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {book.genre} • {book.wordCount} words • {book.author}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created: {new Date(book.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={book.status === 'published' ? 'default' : 'secondary'}
                    >
                      {book.status}
                    </Badge>
                    <div className="flex gap-1">
                      {book.status === 'generated' && (
                        <Button 
                          size="sm" 
                          onClick={() => handlePublishBook(book.id)}
                          disabled={publishBookMutation.isPending}
                        >
                          Publish
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteBook(book.id)}
                        disabled={deleteBookMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {booksData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {booksData.totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(prev => Math.min(booksData.totalPages, prev + 1))}
                    disabled={page === booksData.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No books found</p>
              <p className="text-sm text-muted-foreground">
                Create your first book to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
