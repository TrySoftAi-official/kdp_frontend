# API Integration Guide

This guide provides comprehensive documentation for integrating all backend REST APIs into the React frontend using React Query hooks.

## Overview

The integration includes:
- **Authentication**: Google OAuth, Magic Link, 2FA, JWT token management
- **User Management**: Profile, preferences, statistics, activity tracking
- **Books**: CRUD operations, AI generation, publishing, analytics
- **Payments**: Stripe integration, subscriptions, billing
- **React Query**: Caching, background updates, optimistic updates

## Architecture

```
Frontend (React + TypeScript)
├── Services Layer (API calls)
│   ├── authService.ts
│   ├── userService.ts
│   ├── bookService.ts
│   └── paymentService.ts
├── Hooks Layer (React Query)
│   ├── useAuthQuery.ts
│   ├── useUserQuery.ts
│   ├── useBooksQuery.ts
│   └── usePaymentQuery.ts
└── Components (UI Integration)
    ├── ApiIntegrationExample.tsx
    ├── BooksIntegrationExample.tsx
    └── AccountIntegrationExample.tsx
```

## Quick Start

### 1. Setup React Query

The QueryClient is already configured in `main.tsx`:

```tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/queryClient'

// App is wrapped with QueryClientProvider
```

### 2. Use the Comprehensive Hook

```tsx
import { useApi } from '@/hooks/useApi';

function MyComponent() {
  const { auth, user, books, payments } = useApi();
  
  // Use individual service hooks
  const { data: currentUser } = auth.useCurrentUser();
  const { data: books } = books.useBooks();
  const createBookMutation = books.useCreateBook();

  return (
    // Your component JSX
  );
}
```

### 3. Use Individual Service Hooks

```tsx
import { useAuthQuery, useBooksQuery, useUserQuery, usePaymentQuery } from '@/hooks/useApi';

function MyComponent() {
  // Auth
  const { data: user } = useAuthQuery().useCurrentUser();
  const loginMutation = useAuthQuery().useLogin();
  
  // Books
  const { data: books } = useBooksQuery().useBooks();
  const createBookMutation = useBooksQuery().useCreateBook();
  
  // User
  const { data: stats } = useUserQuery().useUserStats();
  const updateProfileMutation = useUserQuery().useUpdateProfile();
  
  // Payments
  const createPaymentMutation = usePaymentQuery().useCreateCheckoutSession();
}
```

## Service Documentation

### Authentication Service

**Location**: `ui/src/api/authService.ts`

**Features**:
- Google OAuth integration
- Magic link authentication
- JWT token management with automatic refresh
- Two-factor authentication (2FA)
- Password management
- Security status and audit logs

**Key Methods**:
```typescript
// Google OAuth
AuthService.getGoogleAuthUrl()
AuthService.googleLogin(data)
AuthService.googleCallback(code, state)

// Magic Link
AuthService.requestPasswordlessLogin(data)
AuthService.passwordlessLogin(data)

// Token Management
AuthService.refresh(data)
AuthService.logout(data)
AuthService.getCurrentUser()

// 2FA
AuthService.setup2FA()
AuthService.verify2FA(data)
AuthService.login2FA(data)
AuthService.disable2FA(data)
```

**React Query Hooks**:
```typescript
const auth = useAuthQuery();

// Queries
const { data: user } = auth.useCurrentUser();
const { data: authUrl } = auth.useGoogleAuthUrl();

// Mutations
const loginMutation = auth.useLogin();
const logoutMutation = auth.useLogout();
const refreshMutation = auth.useRefreshToken();
const passwordlessMutation = auth.useRequestPasswordlessLogin();
```

### User Service

**Location**: `ui/src/api/userService.ts`

**Features**:
- Profile management
- User statistics and analytics
- Preferences and settings
- Activity tracking
- Avatar management
- Subscription management

**Key Methods**:
```typescript
// Profile
UserService.getCurrentUser()
UserService.updateProfile(data)
UserService.updatePassword(data)
UserService.deleteAccount()

// Statistics
UserService.getUserStats()

// Preferences
UserService.getUserPreferences()
UserService.updateUserPreferences(data)

// Activity
UserService.getUserActivity(limit, offset)

// Subscription
UserService.getSubscription()
UserService.updateSubscription(plan)
UserService.cancelSubscription()
```

**React Query Hooks**:
```typescript
const user = useUserQuery();

// Queries
const { data: profile } = user.useUserProfile();
const { data: stats } = user.useUserStats();
const { data: preferences } = user.useUserPreferences();
const { data: subscription } = user.useUserSubscription();

// Mutations
const updateProfileMutation = user.useUpdateProfile();
const updatePreferencesMutation = user.useUpdateUserPreferences();
const uploadAvatarMutation = user.useUploadAvatar();
```

### Books Service

**Location**: `ui/src/api/bookService.ts`

**Features**:
- Book CRUD operations
- AI-powered book generation
- Genre and niche management
- Book suggestions and analytics
- Publishing and export
- Book prompts management

**Key Methods**:
```typescript
// CRUD
BookService.getBooks(page, limit, filters, sort)
BookService.getBook(bookId)
BookService.createBook(data)
BookService.updateBook(bookId, data)
BookService.deleteBook(bookId)

// Generation
BookService.generateBook(data)
BookService.getGenerationStatus(generationId)
BookService.cancelGeneration(generationId)

// Genres & Niches
BookService.getGenres()
BookService.getHotSellingGenres(limit)
BookService.getNiches()
BookService.getPopularNiches(limit)

// Suggestions
BookService.getBookSuggestions(limit)
BookService.getSuggestionsByGenre(genre, limit)
BookService.getSuggestionsByNiche(niche, limit)

// Analytics
BookService.getBookAnalytics(bookId, period)
BookService.getBooksAnalytics(period)

// Publishing
BookService.publishBook(bookId, platform)
BookService.unpublishBook(bookId)
BookService.exportBook(bookId, format)

// Prompts
BookService.getBookPrompts(page, limit)
BookService.createBookPrompt(data)
BookService.updateBookPrompt(promptId, data)
BookService.deleteBookPrompt(promptId)
```

**React Query Hooks**:
```typescript
const books = useBooksQuery();

// Queries
const { data: books } = books.useBooks(page, limit, filters, sort);
const { data: genres } = books.useGenres();
const { data: hotGenres } = books.useHotSellingGenres(5);
const { data: suggestions } = books.useBookSuggestions(10);
const { data: analytics } = books.useBooksAnalytics('30d');

// Mutations
const createBookMutation = books.useCreateBook();
const generateBookMutation = books.useGenerateBook();
const publishBookMutation = books.usePublishBook();
const createPromptMutation = books.useCreateBookPrompt();
```

### Payment Service

**Location**: `ui/src/api/paymentService.ts`

**Features**:
- Stripe integration
- Checkout sessions and payment intents
- Tax calculation
- Refund management
- Webhook handling

**Key Methods**:
```typescript
// Checkout
PaymentService.createCheckoutSession(data)
PaymentService.createPaymentIntent(data)

// Status & Tax
PaymentService.getPaymentStatus(paymentId)
PaymentService.calculateTax(data)

// Refunds
PaymentService.createRefund(paymentId, data)

// Webhooks
PaymentService.retryWebhooks()
```

**React Query Hooks**:
```typescript
const payments = usePaymentQuery();

// Queries
const { data: paymentStatus } = payments.usePaymentStatus(paymentId);
const { data: taxCalculation } = payments.useTaxCalculation(amount, currency, country);

// Mutations
const createCheckoutMutation = payments.useCreateCheckoutSession();
const createPaymentMutation = payments.useCreatePaymentIntent();
const createRefundMutation = payments.useCreateRefund();
```

## Usage Examples

### 1. Complete Authentication Flow

```tsx
import { useAuthQuery } from '@/hooks/useApi';

function LoginComponent() {
  const auth = useAuthQuery();
  const { data: user, isLoading } = auth.useCurrentUser();
  const loginMutation = auth.useLogin();
  const passwordlessMutation = auth.useRequestPasswordlessLogin();

  const handleEmailLogin = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleMagicLink = async (email: string) => {
    try {
      await passwordlessMutation.mutateAsync({ email });
      // Show success message
    } catch (error) {
      console.error('Magic link failed:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {user.email}!</div>;

  return (
    <div>
      {/* Login form */}
    </div>
  );
}
```

### 2. Book Management with Real-time Updates

```tsx
import { useBooksQuery } from '@/hooks/useApi';

function BooksPage() {
  const books = useBooksQuery();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  // Queries with automatic caching and background updates
  const { data: booksData, isLoading } = books.useBooks(page, 10, filters);
  const { data: genres } = books.useGenres();
  const { data: hotGenres } = books.useHotSellingGenres(5);

  // Mutations with optimistic updates
  const createBookMutation = books.useCreateBook();
  const publishBookMutation = books.usePublishBook();

  const handleCreateBook = async (bookData) => {
    try {
      await createBookMutation.mutateAsync(bookData);
      // Query cache is automatically updated
    } catch (error) {
      console.error('Failed to create book:', error);
    }
  };

  const handlePublishBook = async (bookId) => {
    try {
      await publishBookMutation.mutateAsync({ bookId, platform: 'kdp' });
    } catch (error) {
      console.error('Failed to publish book:', error);
    }
  };

  return (
    <div>
      {/* Books list with real-time updates */}
      {booksData?.books.map(book => (
        <BookCard 
          key={book.id} 
          book={book} 
          onPublish={() => handlePublishBook(book.id)}
        />
      ))}
    </div>
  );
}
```

### 3. Payment Integration

```tsx
import { usePaymentQuery } from '@/hooks/useApi';

function SubscriptionComponent() {
  const payments = usePaymentQuery();
  const createCheckoutMutation = payments.useCreateCheckoutSession();

  const handleSubscribe = async (plan: string) => {
    try {
      const result = await createCheckoutMutation.mutateAsync({
        amount: 29.99,
        currency: 'USD',
        customer_email: user.email,
        description: `${plan} subscription`,
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/cancel`,
        line_items: [{
          product_name: `${plan} Plan`,
          product_description: `Monthly ${plan.toLowerCase()} subscription`,
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
      console.error('Payment failed:', error);
    }
  };

  return (
    <div>
      <Button onClick={() => handleSubscribe('Premium')}>
        Subscribe to Premium
      </Button>
    </div>
  );
}
```

### 4. User Profile Management

```tsx
import { useUserQuery } from '@/hooks/useApi';

function ProfileComponent() {
  const user = useUserQuery();
  const { data: profile } = user.useUserProfile();
  const { data: stats } = user.useUserStats();
  const updateProfileMutation = user.useUpdateProfile();
  const uploadAvatarMutation = user.useUploadAvatar();

  const handleUpdateProfile = async (profileData) => {
    try {
      await updateProfileMutation.mutateAsync(profileData);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      await uploadAvatarMutation.mutateAsync(file);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  return (
    <div>
      {/* Profile form with automatic updates */}
    </div>
  );
}
```

## Error Handling

All hooks include comprehensive error handling:

```tsx
const { data, error, isLoading } = useBooksQuery().useBooks();

if (error) {
  return <div>Error: {error.message}</div>;
}

if (isLoading) {
  return <div>Loading...</div>;
}

// Use data safely
return <div>{data?.books.map(book => ...)}</div>;
```

## Caching Strategy

React Query provides intelligent caching:

- **Stale Time**: Data remains fresh for 5 minutes
- **Cache Time**: Data stays in cache for 10 minutes
- **Background Updates**: Automatic refetching on window focus
- **Optimistic Updates**: Immediate UI updates with rollback on failure
- **Invalidation**: Smart cache invalidation on mutations

## TypeScript Support

All services and hooks are fully typed:

```typescript
// Type-safe API calls
const book: Book = await BookService.getBook(bookId);

// Type-safe hooks
const { data: books }: { data: Book[] | undefined } = useBooksQuery().useBooks();

// Type-safe mutations
const mutation = useBooksQuery().useCreateBook();
mutation.mutateAsync({
  prompt: "string", // Required
  niche: "string",  // Optional
  // ... other typed fields
});
```

## Best Practices

1. **Use the comprehensive hook** for most cases:
   ```tsx
   const { auth, user, books, payments } = useApi();
   ```

2. **Handle loading and error states**:
   ```tsx
   const { data, isLoading, error } = books.useBooks();
   ```

3. **Use mutations for data changes**:
   ```tsx
   const createBookMutation = books.useCreateBook();
   await createBookMutation.mutateAsync(bookData);
   ```

4. **Leverage automatic cache invalidation**:
   ```tsx
   // Cache is automatically updated after mutations
   const updateBookMutation = books.useUpdateBook();
   ```

5. **Use optimistic updates for better UX**:
   ```tsx
   // UI updates immediately, rolls back on error
   const deleteBookMutation = books.useDeleteBook();
   ```

## Example Components

See the example components for complete implementations:

- `ui/src/components/examples/ApiIntegrationExample.tsx` - Complete integration demo
- `ui/src/components/examples/BooksIntegrationExample.tsx` - Books management
- `ui/src/components/examples/AccountIntegrationExample.tsx` - User account management

## Testing

The integration includes comprehensive error handling and can be tested by:

1. **Network failures**: Disconnect internet to test error states
2. **Invalid data**: Send malformed requests to test validation
3. **Authentication**: Test token expiration and refresh
4. **Real-time updates**: Test background refetching and cache invalidation

## Troubleshooting

### Common Issues

1. **Token expiration**: Automatic refresh is handled by interceptors
2. **Network errors**: Comprehensive error handling with user-friendly messages
3. **Cache issues**: Use React Query DevTools to inspect cache state
4. **Type errors**: Ensure all API responses match TypeScript interfaces

### Debug Tools

- **React Query DevTools**: Available in development mode
- **Network tab**: Monitor API calls and responses
- **Console logs**: Detailed error information for debugging

## Conclusion

This integration provides a complete, type-safe, and performant way to interact with all backend APIs. The React Query hooks handle caching, background updates, and error states automatically, while the service layer provides a clean abstraction over the HTTP calls.

The existing Google OAuth and Magic Link integrations are preserved and enhanced with the new React Query functionality, ensuring backward compatibility while adding powerful new features.