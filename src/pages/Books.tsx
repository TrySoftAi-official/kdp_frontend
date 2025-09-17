import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, BookOpen, DollarSign, TrendingUp, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDynamicApi } from '@/hooks/useDynamicApi';
import { useApi } from '@/hooks/useApi';
import { toast } from '@/lib/toast';
import { 
  AdditionalService, 
  DatabaseBook
} from '@/api/additionalService';

export const Books: React.FC = () => {
  const [limit] = useState(12);

  // Database books states - now the primary source
  const [databaseBooks, setDatabaseBooks] = useState<DatabaseBook[]>([]);
  const [isLoadingDatabaseBooks, setIsLoadingDatabaseBooks] = useState(false);
  const [databaseBooksError, setDatabaseBooksError] = useState<string | null>(null);

  // Initialize dynamic API (keeping for potential future use)
  const {
    isRefetching
  } = useDynamicApi({
    enableAutoRefresh: true,
    refreshInterval: 30000,
    enableErrorNotifications: true,
    enableSuccessNotifications: true
  });

  // Get real-time data using React Query hooks (keeping for potential future use)
  const { books: booksHooks } = useApi();
  booksHooks.useBooks(1, limit, {}, { field: 'createdAt', direction: 'desc' });

  // Auto-load database books on component mount
  useEffect(() => {
    handleFetchDatabaseBooks();
  }, []);

  // Auto-refresh database books every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleFetchDatabaseBooks();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Display all books without filtering
  const filteredBooks = databaseBooks;

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'saved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'generated': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'uploaded': return 'bg-green-100 text-green-800 border-green-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'published': return '✓';
      case 'saved': return '💾';
      case 'generated': return '✨';
      case 'processing': return '⏳';
      case 'failed': return '❌';
      case 'uploaded': return '📤';
      case 'review': return '👀';
      default: return '•';
    }
  };

  const handleFetchDatabaseBooks = async () => {
    setIsLoadingDatabaseBooks(true);
    setDatabaseBooksError(null);
    try {
      const response = await AdditionalService.getBooksFromDatabase();
      console.log('API Response:', response.data);
      console.log('Books array:', response.data.books);
      console.log('Books count:', response.data.books?.length);
      setDatabaseBooks(response.data.books);
      toast.success(`Loaded ${response.data.books.length} books from database`);
    } catch (error) {
      console.error('Error fetching database books:', error);
      setDatabaseBooksError('Failed to fetch books from database');
      toast.error('Failed to fetch books from database');
    } finally {
      setIsLoadingDatabaseBooks(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Books</h1>
          <p className="text-gray-600">Manage your book collection</p> 
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleFetchDatabaseBooks}
            disabled={isLoadingDatabaseBooks}
          >
            {isLoadingDatabaseBooks ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
      {databaseBooksError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Error loading books</span>
            </div>
            <p className="text-red-700 mt-1">{databaseBooksError}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={handleFetchDatabaseBooks}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-gray-900">{databaseBooks.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uploaded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {databaseBooks.filter(book => book.status.toLowerCase() === 'uploaded').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${databaseBooks.reduce((sum, book) => sum + (book.book_price || 0), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(databaseBooks.map(book => book.primary_category)).size}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

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
          {isLoadingDatabaseBooks ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const dbBook = book as DatabaseBook;
                return (
                  <Card key={dbBook.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={dbBook.cover_path || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center'} 
                        alt={dbBook.book_title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={`${getStatusColor(dbBook.status)} border`}>
                          {getStatusIcon(dbBook.status)} {dbBook.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{dbBook.book_title}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>by {dbBook.author_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{dbBook.primary_category}</span>
                          {dbBook.secondary_category && (
                            <span>• {dbBook.secondary_category}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>${dbBook.book_price}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => console.log('View database book:', dbBook.book_title)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => console.log('Edit database book:', dbBook.book_title)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => console.log('Delete database book:', dbBook.book_title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {!isLoadingDatabaseBooks && filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground mb-4">
                No books found in database. Click "Refresh" to fetch books.
              </p>
              {databaseBooks.length === 0 && (
                <Button onClick={handleFetchDatabaseBooks} disabled={isLoadingDatabaseBooks}>
                  {isLoadingDatabaseBooks ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Load Database Books
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};