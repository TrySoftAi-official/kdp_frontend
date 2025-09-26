import React, { useState, useEffect } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/utils';
import { analyticsApi } from '@/utils/api';

interface BooksTableProps {
  dateRange: string;
}

export const BooksTable: React.FC<BooksTableProps> = ({ dateRange }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof Book>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchTopBooks();
  }, [dateRange]);

  const fetchTopBooks = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getTopBooks();
      if (response.success) {
        setBooks(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch top books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Book) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedBooks = [...books].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }

    return 0;
  });

  const getSortIcon = (field: keyof Book) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const getSortableHeader = (field: keyof Book, label: string) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      {label}
      {getSortIcon(field)}
    </Button>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded animate-pulse" />
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Books</CardTitle>
        <p className="text-sm text-muted-foreground">
          Books ranked by revenue for the selected period
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>{getSortableHeader('title', 'Title')}</TableHead>
                <TableHead>{getSortableHeader('revenue', 'Revenue')}</TableHead>
                <TableHead>{getSortableHeader('adSpend', 'Ad Spend')}</TableHead>
                <TableHead>{getSortableHeader('roas', 'ROAS')}</TableHead>
                <TableHead>{getSortableHeader('acos', 'ACOS')}</TableHead>
                <TableHead>{getSortableHeader('kenp', 'KENP')}</TableHead>
                <TableHead>{getSortableHeader('country', 'Country')}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No data available for the selected period
                  </TableCell>
                </TableRow>
              ) : (
                sortedBooks.map((book, index) => (
                  <TableRow key={book.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index < 3 
                          ? index === 0 ? 'bg-yellow-500 text-white' 
                            : index === 1 ? 'bg-gray-400 text-white'
                            : 'bg-orange-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                    </TableCell>
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
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(book.revenue)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(book.adSpend)}
                    </TableCell>
                    <TableCell>
                      <span className={
                        book.roas >= 4 
                          ? 'text-green-600 font-medium' 
                          : book.roas >= 2 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }>
                        {book.roas.toFixed(2)}x
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={
                        book.acos <= 20 
                          ? 'text-green-600 font-medium' 
                          : book.acos <= 35 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }>
                        {book.acos.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatNumber(book.kenp)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted">
                        {book.country}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {sortedBooks.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-muted-foreground">
            <p>Showing top {sortedBooks.length} books</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Good performance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>Average performance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Poor performance</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
