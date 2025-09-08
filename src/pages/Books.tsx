import React, { useState, useEffect } from 'react';
import { Upload, Filter, Search, Eye, Edit, Trash2, BookOpen, DollarSign, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/types';
import { useDynamicApi } from '@/hooks/useDynamicApi';
import { useApi } from '@/hooks/useApi';
import { ApiErrorHandler } from '@/components/ApiErrorHandler';
import { toast } from '@/lib/toast';

// Extended Book interface to include more fields
interface ExtendedBook extends Book {
  coverUrl?: string;
  niche?: string;
  targetAudience?: string;
  wordCount?: number;
  content?: string;
  savedAt?: string;
  publishedAt?: string;
}

export const Books: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Initialize dynamic API
  const {
    isLoading,
    isError,
    error,
    isRefetching,
    books: booksApi,
    retry
  } = useDynamicApi({
    enableAutoRefresh: true,
    refreshInterval: 30000,
    enableErrorNotifications: true,
    enableSuccessNotifications: true
  });

  // Get real-time data using React Query hooks
  const { books: booksHooks } = useApi();
  const { 
    data: booksData, 
    isLoading: booksLoading, 
    error: booksError,
    refetch: refetchBooks 
  } = booksHooks.useBooks(page, limit, {}, { field: 'createdAt', direction: 'desc' });

  // Get books from API data
  const books = booksData?.books || [];
  const totalBooks = booksData?.pagination?.total || 0;
  const totalPages = booksData?.pagination?.totalPages || 1;
  const loading = booksLoading || isLoading;

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchBooks();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchBooks]);

  const filteredBooks = books.filter(book => {
    const extendedBook = book as ExtendedBook;
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (extendedBook.niche && extendedBook.niche.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'saved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'generated': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return '✓';
      case 'saved': return '💾';
      case 'generated': return '✨';
      case 'processing': return '⏳';
      case 'failed': return '❌';
      default: return '•';
    }
  };

  const handleViewBook = async (book: ExtendedBook) => {
    try {
      // Implement view book functionality
      console.log('Viewing book:', book.title);
      toast.success(`Opening ${book.title}`);
    } catch (error) {
      toast.error('Failed to open book');
    }
  };

  const handleEditBook = async (book: ExtendedBook) => {
    try {
      // Implement edit book functionality
      console.log('Editing book:', book.title);
      toast.success(`Editing ${book.title}`);
    } catch (error) {
      toast.error('Failed to edit book');
    }
  };

  const handleDeleteBook = async (book: ExtendedBook) => {
    try {
      // Use the original hooks for delete operation
      const deleteMutation = booksHooks.useDeleteBook();
      await deleteMutation.mutateAsync(book.id);
      toast.success(`Deleted ${book.title}`);
      refetchBooks();
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const handlePublishBook = async (book: ExtendedBook) => {
    try {
      await booksApi.publishBook(book.id, 'kdp');
      toast.success(`Publishing ${book.title}`);
      refetchBooks();
    } catch (error) {
      toast.error('Failed to publish book');
    }
  };

  const handleRefresh = async () => {
    try {
      await refetchBooks();
      toast.success('Books refreshed');
    } catch (error) {
      toast.error('Failed to refresh books');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Books</h1>
          <p className="text-muted-foreground">
            View and manage your AI-generated books
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button asChild>
            <a href="/create">Create New Book</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/publish">Publish Books</a>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {(isError || booksError) && (
        <ApiErrorHandler
          error={error || booksError}
          onRetry={retry}
          title="Failed to load books"
          description="Unable to fetch your books. Please try again."
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Books</p>
                <p className="text-2xl font-bold">{totalBooks}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{books.filter(b => b.status === 'published').length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${books.reduce((sum, b) => sum + b.revenue, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg ROAS</p>
                <p className="text-2xl font-bold">
                  {books.filter(b => b.roas > 0).length > 0 
                    ? (books.filter(b => b.roas > 0).reduce((sum, b) => sum + b.roas, 0) / books.filter(b => b.roas > 0).length).toFixed(2)
                    : '0.00'}x
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search books by title, author, or niche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="saved">Saved</option>
              <option value="generated">Generated</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Book Catalog ({filteredBooks.length} books)</span>
            {isRefetching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={(book as ExtendedBook).coverUrl || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center'} 
                      alt={book.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={`${getStatusColor(book.status)} border`}>
                        {getStatusIcon(book.status)} {book.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{book.title}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>By {book.author || 'AI Author'}</span>
                      </div>
                      
                      {(book as ExtendedBook).niche && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{(book as ExtendedBook).niche}</span>
                        </div>
                      )}
                      
                      {book.wordCount && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{book.wordCount.toLocaleString()} words</span>
                        </div>
                      )}
                    </div>

                    {book.status === 'published' && (
                      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-semibold">${book.revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ROAS</p>
                          <p className="font-semibold">{book.roas.toFixed(2)}x</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewBook(book)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {book.status === 'saved' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handlePublishBook(book)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Publish
                        </Button>
                      )}
                      
                      {book.status === 'generated' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditBook(book)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteBook(book)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {!loading && filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No books match your current filters.'
                  : 'You haven\'t created any books yet.'
                }
              </p>
              <Button asChild>
                <a href="/create">Create Your First Book</a>
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};