# Universal Cookies Implementation

This implementation provides a secure and universal way to store authentication tokens and user data using cookies instead of localStorage.

## Features

- **Universal Cookie Support**: Works across different environments (browser, SSR, etc.)
- **Secure Configuration**: Cookies are configured with proper security settings
- **Automatic Expiration**: Tokens have appropriate expiration times
- **Type Safety**: Full TypeScript support
- **Easy Integration**: Simple API for all authentication operations

## Usage

### Basic Operations

```typescript
import CookieManager from '@/utils/cookies';

// Set authentication data
CookieManager.setAuthData({
  accessToken: 'your-access-token',
  refreshToken: 'your-refresh-token',
  user: { id: 1, email: 'user@example.com' }
});

// Get authentication data
const authData = CookieManager.getAuthData();
console.log(authData.isAuthenticated); // true/false

// Check if user is authenticated
if (CookieManager.isAuthenticated()) {
  // User is logged in
}

// Clear all authentication data
CookieManager.clearAuthData();
```

### Individual Token Operations

```typescript
// Set individual tokens
CookieManager.setAccessToken('access-token');
CookieManager.setRefreshToken('refresh-token');
CookieManager.setUserData({ id: 1, email: 'user@example.com' });
CookieManager.setAuthState(true);

// Get individual tokens
const accessToken = CookieManager.getAccessToken();
const refreshToken = CookieManager.getRefreshToken();
const userData = CookieManager.getUserData();
const isAuthenticated = CookieManager.getAuthState();

// Update access token (for token refresh)
CookieManager.updateAccessToken('new-access-token');
```

## Cookie Configuration

### Security Settings
- **Path**: `/` (available across entire domain)
- **Secure**: `true` in production, `false` in development
- **SameSite**: `lax` (CSRF protection)
- **HttpOnly**: `false` (allows client-side access)

### Expiration Times
- **Access Token**: 1 day
- **Refresh Token**: 7 days
- **User Data**: 7 days
- **Auth State**: 1 day

## Integration with Authentication Flow

### Passwordless Login
```typescript
// In passwordless callback
const data = await passwordlessVerifyApi({ token });
CookieManager.setAuthData({
  accessToken: data.access_token,
  refreshToken: data.refresh_token,
  user: data.user,
});
```

### Google OAuth
```typescript
// In Google OAuth callback
CookieManager.setAuthData({
  accessToken: accessToken,
  refreshToken: refreshToken,
  user: userData,
});
```

### API Client Integration
```typescript
// Request interceptor automatically adds token from cookies
apiClient.interceptors.request.use((config) => {
  const token = CookieManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Benefits Over localStorage

1. **Universal Compatibility**: Works in SSR environments
2. **Automatic Expiration**: Cookies expire automatically
3. **Security**: Better security configuration options
4. **Cross-Tab Synchronization**: Changes are reflected across tabs
5. **Server-Side Access**: Can be accessed on the server if needed

## Migration from localStorage

The implementation automatically handles migration from localStorage to cookies. All existing localStorage-based authentication will continue to work while new logins will use cookies.

## Testing

```typescript
import CookieManager from '@/utils/cookies';

// Test authentication flow
test('should store and retrieve auth data', () => {
  const authData = {
    accessToken: 'token',
    refreshToken: 'refresh',
    user: { id: 1, email: 'test@example.com' }
  };
  
  CookieManager.setAuthData(authData);
  expect(CookieManager.isAuthenticated()).toBe(true);
  
  CookieManager.clearAuthData();
  expect(CookieManager.isAuthenticated()).toBe(false);
});
```

## Error Handling

The cookie manager includes built-in error handling for:
- Invalid JSON parsing
- Missing cookies
- Expired tokens
- Network errors

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills)
- Mobile browsers
- SSR environments (Next.js, Nuxt.js, etc.)
