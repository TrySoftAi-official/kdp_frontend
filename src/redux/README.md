# Redux State Management

This project uses Redux Toolkit for centralized state management with a clean, scalable architecture.

## 📁 Folder Structure

```
/redux/
├── store.ts                 # Redux store configuration
├── ReduxProvider.tsx        # Redux provider component
├── hooks.ts                 # Typed Redux hooks
├── hooks/                   # Custom hooks for each slice
│   ├── index.ts            # Export all hooks
│   ├── useAuth.ts          # Authentication hook
│   ├── useSubscription.ts  # Subscription management hook
│   ├── useUser.ts          # User profile hook
│   ├── useBooks.ts         # Books management hook
│   └── useUI.ts            # UI state hook
└── slices/                  # Redux slices
    ├── authSlice.ts        # Authentication state
    ├── subscriptionSlice.ts # Subscription state
    ├── userSlice.ts        # User profile state
    ├── bookSlice.ts        # Books state
    └── uiSlice.ts          # UI state
```

## 🏗️ Architecture

### Store Configuration
- **Redux Toolkit**: Uses `configureStore` for optimal performance
- **Redux Persist**: Persists auth and user data across sessions
- **DevTools**: Enabled in development mode
- **Middleware**: Configured with serializable check for persist actions

### Slices
Each slice follows Redux Toolkit best practices:
- **createSlice**: For reducers and actions
- **createAsyncThunk**: For async API calls
- **Immer**: Automatic immutable updates
- **TypeScript**: Fully typed state and actions

### API Integration
- **Centralized API Client**: Single axios instance with interceptors
- **Error Handling**: Consistent error handling across all API calls
- **Token Management**: Automatic token refresh and auth error handling
- **Loading States**: Proper loading states for all async operations

## 🎯 Usage

### Basic Usage
```tsx
import { useAuth, useSubscription } from '@/redux/hooks';

function MyComponent() {
  const { user, isAuthenticated, login } = useAuth();
  const { currentSubscription, fetchAll } = useSubscription();
  
  // Use the state and actions
}
```

### Available Hooks

#### useAuth
- `user`: Current user data
- `isAuthenticated`: Authentication status
- `isLoading`: Loading state
- `login()`: Login function
- `logout()`: Logout function
- `initialize()`: Initialize auth state

#### useSubscription
- `currentSubscription`: Current subscription data
- `plans`: Available subscription plans
- `isLoading`: Loading state
- `fetchAll()`: Fetch all subscription data
- `createCheckout()`: Create checkout session
- `upgrade()`: Upgrade subscription

#### useUser
- `profile`: User profile data
- `preferences`: User preferences
- `updateProfile()`: Update profile
- `changePassword()`: Change password

#### useBooks
- `books`: List of books
- `currentBook`: Currently selected book
- `fetchBooks()`: Fetch books list
- `createBook()`: Create new book
- `generateBook()`: Generate book with AI

#### useUI
- `sidebarOpen`: Sidebar state
- `modals`: Modal states
- `notifications`: Notification queue
- `setSidebar()`: Toggle sidebar
- `addNotification()`: Add notification

## 🔄 State Flow

1. **Component** dispatches action via hook
2. **Async Thunk** handles API call
3. **Slice** updates state with result
4. **Component** re-renders with new state

## 🛡️ Error Handling

- All API calls wrapped in try/catch
- Consistent error messages
- Loading states for better UX
- Automatic retry for network errors
- Circuit breaker for consecutive failures

## 📦 Persistence

- **Auth data**: Persisted across sessions
- **User preferences**: Persisted across sessions
- **Subscription data**: Cached with TTL
- **UI state**: Not persisted (resets on reload)

## 🚀 Performance

- **Selective re-renders**: Components only re-render when their data changes
- **Memoized selectors**: Expensive computations are memoized
- **Lazy loading**: Data fetched only when needed
- **Cache management**: Intelligent caching with TTL

## 🔧 Development

### Adding New Slices
1. Create slice file in `/slices/`
2. Add to store configuration
3. Create custom hook in `/hooks/`
4. Export from hooks index

### Adding New API Calls
1. Add to appropriate service file
2. Create async thunk in slice
3. Handle loading/error states
4. Add to custom hook

## 📝 Best Practices

1. **Use custom hooks**: Don't use `useSelector` directly in components
2. **Handle loading states**: Always show loading indicators
3. **Error boundaries**: Wrap components with error boundaries
4. **Type safety**: Use TypeScript for all state and actions
5. **Clean up**: Remove unused state and actions
6. **Testing**: Write tests for slices and hooks

## 🐛 Debugging

- **Redux DevTools**: Available in development
- **Console logging**: Detailed logs for debugging
- **Error tracking**: Comprehensive error information
- **State inspection**: Easy state inspection via DevTools
