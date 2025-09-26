import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Users, CreditCard, Settings } from 'lucide-react';

/**
 * Example component demonstrating how to use the integrated API hooks
 * This shows the complete flow for authentication, books, payments, and user management
 */
export const ApiIntegrationExample: React.FC = () => {
  const { auth, user, books, payments } = useApi();
  const [email, setEmail] = useState('');
  const [bookPrompt, setBookPrompt] = useState('');

  // Auth queries
  const { data: currentUser, isLoading: userLoading } = auth.useCurrentUser();
  
  // User queries
  const { data: userStats, isLoading: statsLoading } = user.useUserStats();
  const { data: userPreferences } = user.useUserPreferences();
  
  // Books queries
  const { data: booksData, isLoading: booksLoading } = books.useBooks(1, 10);
  const { data: hotGenres, isLoading: genresLoading } = books.useHotSellingGenres(5);
  const { data: bookSuggestions } = books.useBookSuggestions(3);
  
  // Mutations
  const loginMutation = auth.useLogin();
  const createBookMutation = books.useCreateBook();
  const createPaymentMutation = payments.useCreateCheckoutSession();

  const handleLogin = async () => {
    if (!email) return;
    
    try {
      await loginMutation.mutateAsync({
        email,
        password: 'demo-password' // In real app, this would come from a form
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleCreateBook = async () => {
    if (!bookPrompt) return;
    
    try {
      await createBookMutation.mutateAsync({
        prompt: bookPrompt,
        niche: 'technology',
        targetAudience: 'developers',
        wordCount: 5000,
        genre: 'non_fiction'
      });
      setBookPrompt('');
    } catch (error) {
      console.error('Book creation failed:', error);
    }
  };

  const handleCreatePayment = async () => {
    try {
      const result = await createPaymentMutation.mutateAsync({
        amount: 29.99,
        currency: 'USD',
        customer_email: currentUser?.email,
        description: 'Premium subscription',
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/cancel`,
        line_items: [{
          product_name: 'Premium Plan',
          product_description: 'Monthly premium subscription',
          quantity: 1,
          unit_amount: 2999,
          tax_amount: 0,
          tax_rate: 0
        }]
      });
      
      if (result?.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">API Integration Example</h1>
        <p className="text-muted-foreground">
          This component demonstrates the complete API integration with React Query hooks
        </p>
      </div>

      {/* Authentication Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            Login and user management functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentUser ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Logged in as: {currentUser.email}</p>
              <Badge variant="outline">{currentUser.role}</Badge>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleLogin}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Stats Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            User Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : userStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{userStats.total_books}</p>
                <p className="text-sm text-muted-foreground">Total Books</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{userStats.published_books}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">${userStats.total_revenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{userStats.average_roas.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Avg ROAS</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No stats available</p>
          )}
        </CardContent>
      </Card>

      {/* Books Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Books Management
          </CardTitle>
          <CardDescription>
            Create and manage books with AI generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Book Creation */}
          <div className="space-y-2">
            <Label htmlFor="book-prompt">Book Prompt</Label>
            <Textarea
              id="book-prompt"
              placeholder="Describe the book you want to create..."
              value={bookPrompt}
              onChange={(e) => setBookPrompt(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleCreateBook}
              disabled={createBookMutation.isPending || !bookPrompt}
              className="w-full"
            >
              {createBookMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Book
            </Button>
          </div>

          {/* Hot Selling Genres */}
          {genresLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : hotGenres && hotGenres.length > 0 ? (
            <div className="space-y-2">
              <Label>Hot Selling Genres</Label>
              <div className="flex flex-wrap gap-2">
                {hotGenres.map((genre) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name} ({genre.popularity})
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {/* Book Suggestions */}
          {bookSuggestions && bookSuggestions.length > 0 && (
            <div className="space-y-2">
              <Label>Book Suggestions</Label>
              <div className="space-y-2">
                {bookSuggestions.map((suggestion) => (
                  <div key={suggestion.title} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{suggestion.niche}</Badge>
                      <Badge variant="outline">{suggestion.targetAudience}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Processing
          </CardTitle>
          <CardDescription>
            Stripe payment integration for subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleCreatePayment}
            disabled={createPaymentMutation.isPending || !currentUser}
            className="w-full"
          >
            {createPaymentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Subscribe to Premium ($29.99/month)
          </Button>
        </CardContent>
      </Card>

      {/* Books List */}
      {booksLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      ) : booksData && booksData.books.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Books</CardTitle>
            <CardDescription>
              {booksData.total} books found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {booksData.books.map((book) => (
                <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{book.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {book.genre} • {book.wordCount} words
                    </p>
                  </div>
                  <Badge variant={book.status === 'published' ? 'default' : 'secondary'}>
                    {book.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
