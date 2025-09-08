# API Integration Guide

This document describes how to use the integrated APIs in the KDP Frontend application.

## Base Configuration

The API client is configured with:
- **Base URL**: `http://127.0.0.1:8000`
- **Authentication**: Bearer token (stored in localStorage as `access_token`)
- **Interceptors**: Automatic token injection and 401 error handling

## Available API Modules

### 1. Authentication API (`authApi`)

#### Google Authentication
```typescript
import { authApi } from '@/api';

// Initiate Google OAuth
authApi.googleLogin();

// Handle Google OAuth callback
authApi.googleCallback();

// Google login with data
authApi.googleLoginApi(data);
```

#### Standard Authentication
```typescript
// User registration
const registerData = {
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
};
await authApi.register(registerData);

// User login
const credentials = {
  email: 'user@example.com',
  password: 'password123'
};
await authApi.login(credentials);

// Refresh token
await authApi.refresh();

// Logout
await authApi.logout();
```

#### Password Management
```typescript
// Forgot password
await authApi.forgotPassword({ email: 'user@example.com' });

// Passwordless login request
await authApi.passwordlessLoginRequest('user@example.com');

// Passwordless login with token
await authApi.passwordlessLogin('token123');

// Reset password
await authApi.resetPassword({
  token: 'reset_token',
  newPassword: 'newpassword123'
});
```

#### Two-Factor Authentication
```typescript
// Setup 2FA
await authApi.setup2FA({
  secret: '2fa_secret',
  code: '123456'
});

// Verify 2FA
await authApi.verify2FA({ code: '123456' });

// Login with 2FA
await authApi.login2FA({ code: '123456' });

// Disable 2FA
await authApi.disable2FA({ code: '123456' });
```

#### Security
```typescript
// Get account security status
const securityStatus = await authApi.getAccountSecurityStatus();

// Get audit log
const auditLog = await authApi.getAuditLog();
```

### 2. Admin API (`adminApi`)

```typescript
import { adminApi } from '@/api';

// Admin login
await adminApi.login({
  email: 'admin@example.com',
  password: 'adminpass'
});

// Get admin info
const adminInfo = await adminApi.me();

// Admin 2FA operations (same as user 2FA)
await adminApi.setup2FA(data);
await adminApi.verify2FA(data);
await adminApi.login2FA(data);
await adminApi.disable2FA(data);
```

### 3. User API (`userApi`)

```typescript
import { userApi } from '@/api';

// Get current user info
const userInfo = await userApi.me();

// Get maintenance status
const maintenanceStatus = await userApi.maintenanceStatus();

// Update password
await userApi.updatePassword('oldpass', 'newpass');

// Send notification
await userApi.sendNotification('Hello from the app!');
```

### 4. Payment API (`paymentApi`)

```typescript
import { paymentApi } from '@/api';

// Create Stripe checkout session
const checkoutSession = await paymentApi.createCheckoutSession({
  amount: 1000,
  currency: 'usd',
  description: 'Book purchase'
});

// Create payment intent
const paymentIntent = await paymentApi.createPaymentIntent({
  amount: 1000,
  currency: 'usd'
});

// Get payment status
const status = await paymentApi.paymentStatus('pi_123456');

// Calculate tax
const taxInfo = await paymentApi.calculateTax({
  amount: 1000,
  country: 'US',
  state: 'CA'
});

// Create refund
await paymentApi.refund('pi_123456');

// Handle webhooks
await paymentApi.webhook(webhookData);

// Retry failed webhooks
await paymentApi.retryWebhook();
```

### 5. Media API (`mediaApi`)

```typescript
import { mediaApi } from '@/api';

// Get bucket contents
const bucketContents = await mediaApi.getBucket('my-bucket');

// Upload image
const file = new File(['image data'], 'image.jpg', { type: 'image/jpeg' });
const uploadResult = await mediaApi.uploadImage(file);
```

## Using the APIs in Components

### Example: Login Component
```typescript
import { authApi } from '@/api';

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await authApi.login({ email, password });
    
    // Store token
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    
    // Handle successful login
    console.log('Login successful:', response.data);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Example: File Upload
```typescript
import { mediaApi } from '@/api';

const handleFileUpload = async (file: File) => {
  try {
    const result = await mediaApi.uploadImage(file);
    console.log('Upload successful:', result.data);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Example: Payment Processing
```typescript
import { paymentApi } from '@/api';

const handlePayment = async (amount: number) => {
  try {
    const session = await paymentApi.createCheckoutSession({
      amount,
      currency: 'usd',
      description: 'Book purchase'
    });
    
    // Redirect to Stripe checkout
    window.location.href = session.data.url;
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

## Error Handling

The API client includes automatic error handling:

```typescript
try {
  const result = await authApi.login(credentials);
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
    console.log('Please log in again');
  } else if (error.response?.status === 400) {
    // Handle validation errors
    console.log('Validation error:', error.response.data);
  } else {
    // Handle other errors
    console.log('Unexpected error:', error.message);
  }
}
```

## Token Management

The API client automatically:
- Injects the `Authorization: Bearer <token>` header for authenticated requests
- Handles 401 responses (you can extend this to refresh tokens)
- Stores tokens in localStorage

## Environment Variables

You can configure the API base URL using environment variables:

```bash
# .env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## TypeScript Support

All API functions include TypeScript interfaces for request/response data:

```typescript
import { LoginCredentials, RegisterData } from '@/api';

const credentials: LoginCredentials = {
  email: 'user@example.com',
  password: 'password123'
};

const registerData: RegisterData = {
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
};
```

## Testing

To test the APIs:

1. Ensure your backend is running on `http://127.0.0.1:8000`
2. Use the login form to authenticate
3. Check the browser's Network tab to see API calls
4. Verify tokens are stored in localStorage

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend allows requests from your frontend domain
2. **401 Errors**: Check if the token is valid and not expired
3. **Network Errors**: Verify the backend is running and accessible

### Debug Mode

Enable debug logging by checking the browser console for API request/response details.
