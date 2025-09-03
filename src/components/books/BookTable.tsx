import React, { useState, useEffect } from 'react';
import { 
  MoreHorizontal, 
  RefreshCw, 
  Eye, 
  Edit,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from './StatusBadge';
import { Book, FilterOptions, SortOptions } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { booksApi } from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/hooks/useAuth';

interface BookTableProps {
  filters?: FilterOptions;
  onBookSelect?: (book: Book) => void;
}

export const BookTable: React.FC<BookTableProps> = ({ 
  filters,
  onBookSelect 
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOptions>({ field: 'date', direction: 'desc' });
  const { addNotification } = useUIStore();
  const { canWrite } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, [filters, sort]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await booksApi.getBooks(filters, sort);
      if (response.success) {
        setBooks(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to load books',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRetry = async (book: Book) => {
    try {
      const response = await booksApi.retryPublication(book.id);
      if (response.success) {
        setBooks(prev => 
          prev.map(b => b.id === book.id ? response.data : b)
        );
        addNotification({
          title: 'Retry Initiated',
          message: `Publication retry started for "${book.title}"`,
          type: 'info'
        });
      }
    } catch (error) {
      addNotification({
        title: 'Retry Failed',
        message: 'Failed to retry book publication',
        type: 'error'
      });
    }
  };

  const getSortIcon = (field: string) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sort.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('title')}
                  className="h-auto p-0 font-medium"
                >
                  Title
                  {getSortIcon('title')}
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('revenue')}
                  className="h-auto p-0 font-medium"
                >
                  Revenue
                  {getSortIcon('revenue')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('adSpend')}
                  className="h-auto p-0 font-medium"
                >
                  Ad Spend
                  {getSortIcon('adSpend')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('roas')}
                  className="h-auto p-0 font-medium"
                >
                  ROAS
                  {getSortIcon('roas')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('acos')}
                  className="h-auto p-0 font-medium"
                >
                  ACOS
                  {getSortIcon('acos')}
                </Button>
              </TableHead>
              <TableHead>KENP</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('date')}
                  className="h-auto p-0 font-medium"
                >
                  Date
                  {getSortIcon('date')}
                </Button>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No books found
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow 
                  key={book.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onBookSelect?.(book)}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{book.title}</p>
                      {book.author && (
                        <p className="text-sm text-muted-foreground">
                          by {book.author}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={book.status} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(book.revenue)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(book.adSpend)}
                  </TableCell>
                  <TableCell>
                    <span className={book.roas >= 4 ? 'text-green-600' : 'text-red-600'}>
                      {book.roas.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={book.acos <= 20 ? 'text-green-600' : 'text-red-600'}>
                      {book.acos.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>{book.kenp.toLocaleString()}</TableCell>
                  <TableCell>{book.country}</TableCell>
                  <TableCell>{formatDate(book.date)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onBookSelect?.(book);
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {canWrite() && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {book.status === 'failed' && canWrite() && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleRetry(book);
                          }}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Publication
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {books.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>Showing {books.length} books</p>
          <Button variant="outline" size="sm" onClick={fetchBooks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
};
