import React, { useState, useEffect } from 'react';
import { Upload, Filter, Search, Eye, Edit, Trash2, BookOpen, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/types';



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
  const [books, setBooks] = useState<ExtendedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');


  // Sample books data
  const sampleBooks: ExtendedBook[] = [
    {
      id: '1',
      title: 'The Complete Guide to Healthy Eating',
      status: 'published',
      revenue: 2450.50,
      adSpend: 850.00,
      roas: 2.88,
      acos: 34.7,
      kenp: 1250,
      country: 'US',
      date: '2024-01-15',
      author: 'AI Author',
      genre: 'Health & Fitness',
      publishedAt: '2024-01-15T10:30:00Z',
      lastUpdated: '2024-01-20T14:22:00Z',
      coverUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=600&fit=crop&crop=center',
      niche: 'Health & Fitness',
      targetAudience: 'Beginners',
      wordCount: 8500,
      content: 'A comprehensive guide to maintaining a healthy diet...'
    },
    {
      id: '2',
      title: 'Business Success Blueprint',
      status: 'published',
      revenue: 3890.75,
      adSpend: 1200.00,
      roas: 3.24,
      acos: 30.8,
      kenp: 2100,
      country: 'US',
      date: '2024-01-10',
      author: 'AI Author',
      genre: 'Business',
      publishedAt: '2024-01-10T09:15:00Z',
      lastUpdated: '2024-01-18T16:45:00Z',
      coverUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=600&fit=crop&crop=center',
      niche: 'Business & Entrepreneurship',
      targetAudience: 'Entrepreneurs',
      wordCount: 12000,
      content: 'Essential strategies for building a successful business...'
    },
    {
      id: '3',
      title: 'Mindful Parenting Techniques',
      status: 'saved',
      revenue: 0,
      adSpend: 0,
      roas: 0,
      acos: 0,
      kenp: 0,
      country: 'US',
      date: '2024-01-25',
      author: 'AI Author',
      genre: 'Parenting',
      savedAt: '2024-01-25T11:20:00Z',
      coverUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=600&fit=crop&crop=center',
      niche: 'Parenting & Family',
      targetAudience: 'Parents',
      wordCount: 6500,
      content: 'Modern approaches to raising happy and confident children...'
    },
    {
      id: '4',
      title: 'Digital Marketing Mastery',
      status: 'generated',
      revenue: 0,
      adSpend: 0,
      roas: 0,
      acos: 0,
      kenp: 0,
      country: 'US',
      date: '2024-01-28',
      author: 'AI Author',
      genre: 'Marketing',
      coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop&crop=center',
      niche: 'Business & Entrepreneurship',
      targetAudience: 'Professionals',
      wordCount: 9500,
      content: 'Complete guide to modern digital marketing strategies...'
    },
    {
      id: '5',
      title: 'Quick & Easy Recipes for Busy Families',
      status: 'processing',
      revenue: 0,
      adSpend: 0,
      roas: 0,
      acos: 0,
      kenp: 0,
      country: 'US',
      date: '2024-01-30',
      author: 'AI Author',
      genre: 'Cooking',
      coverUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=600&fit=crop&crop=center',
      niche: 'Cooking & Recipes',
      targetAudience: 'Parents',
      wordCount: 7200,
      content: 'Delicious meals that can be prepared in 30 minutes or less...'
    },
    {
      id: '6',
      title: 'Financial Freedom Roadmap',
      status: 'failed',
      revenue: 0,
      adSpend: 0,
      roas: 0,
      acos: 0,
      kenp: 0,
      country: 'US',
      date: '2024-01-29',
      author: 'AI Author',
      genre: 'Finance',
      coverUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop&crop=center',
      niche: 'Finance & Investment',
      targetAudience: 'Young Adults',
      wordCount: 8800,
      content: 'Step-by-step guide to achieving financial independence...'
    }
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Load saved books from localStorage
        const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
        
        // Combine saved books with sample data
        const allBooks = [...sampleBooks, ...savedBooks];
        setBooks(allBooks);
      } catch (error) {
        console.error('Failed to fetch books:', error);
        // Fallback to sample data
        setBooks(sampleBooks);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (book.niche && book.niche.toLowerCase().includes(searchTerm.toLowerCase()));
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

  const handleViewBook = (book: ExtendedBook) => {
    // Implement view book functionality
    console.log('Viewing book:', book.title);
  };

  const handleEditBook = (book: ExtendedBook) => {
    // Implement edit book functionality
    console.log('Editing book:', book.title);
  };

  const handleDeleteBook = (book: ExtendedBook) => {
    // Implement delete book functionality
    console.log('Deleting book:', book.title);
  };

  const handlePublishBook = (book: ExtendedBook) => {
    // Implement publish book functionality
    console.log('Publishing book:', book.title);
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
          <Button asChild>
            <a href="/create">Create New Book</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/publish">Publish Books</a>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Books</p>
                <p className="text-2xl font-bold">{books.length}</p>
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
          <CardTitle>Book Catalog ({filteredBooks.length} books)</CardTitle>
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
                       src={book.coverUrl || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center'} 
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
                      
                      {book.niche && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{book.niche}</span>
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
        </CardContent>
      </Card>
    </div>
  );
};
