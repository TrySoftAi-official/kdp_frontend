# Backend Configuration Updates

## Issues to Fix in Backend

### 1. Google OAuth Client ID
The backend needs to be updated to use the correct Google OAuth client ID:

```json
{
  "client_id": "689538806669-43m7n7tg2c3vfrmt527k6nr51no72tmj.apps.googleusercontent.com",
  "client_secret": "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"
}
```

### 2. Magic Link URL Configuration
The backend is currently sending magic links to `localhost:3000` but your frontend runs on `localhost:5173`.

**Current backend configuration (needs to be changed):**
```
Magic link URL: http://localhost:3000/passwordless-login?token=...
```

**Should be changed to:**
```
Magic link URL: http://localhost:5173/passwordless-login?token=...
```

### 3. Google OAuth Redirect URIs
Update the Google OAuth configuration to include the correct redirect URI:

**Current redirect URIs:**
- `http://127.0.0.1:8000/auth/callback`
- `http://127.0.0.1:8000/auth/google/callback`

**Should also include:**
- `http://localhost:5173/auth/google/callback`

## Backend Code Changes Needed

### 1. Update Magic Link URL Generation
Find the code that generates magic link URLs and change:

```python
# OLD
magic_link_url = f"http://localhost:3000/passwordless-login?token={token}"

# NEW
magic_link_url = f"http://localhost:5173/passwordless-login?token={token}"
```

### 2. Update Google OAuth Configuration
Update the Google OAuth client configuration:

```python
# OLD
GOOGLE_CLIENT_ID = "your_old_client_id"
GOOGLE_CLIENT_SECRET = "your_old_client_secret"

# NEW
GOOGLE_CLIENT_ID = "689538806669-43m7n7tg2c3vfrmt527k6nr51no72tmj.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "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"
```

### 3. Update CORS Configuration
Make sure CORS is configured to allow requests from `localhost:5173`:

```python
# CORS configuration
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # Keep for backward compatibility
    "http://127.0.0.1:3000"   # Keep for backward compatibility
]
```

## Environment Variables
Add these to your backend `.env` file:

```env
# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=689538806669-43m7n7tg2c3vfrmt527k6nr51no72tmj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Magic Link Configuration
MAGIC_LINK_BASE_URL=http://localhost:5173
```

## Testing After Updates

1. **Test Passwordless Login:**
   - Enter email address
   - Check that magic link is sent to `localhost:5173`
   - Click magic link and verify it works

2. **Test Google OAuth:**
   - Click "Continue with Google"
   - Verify OAuth flow works with correct client ID
   - Check that callback redirects to correct URL

3. **Test CORS:**
   - Verify no CORS errors in browser console
   - Check that API calls work from `localhost:5173`

## Temporary Workaround

If you can't update the backend immediately, you can:

1. **Use the redirect page:** Place the `port-redirect.html` file in your backend's static files
2. **Update magic link URL:** Change backend to send links to `http://localhost:3000/port-redirect.html?token=...`
3. **The redirect page will automatically redirect to the correct port**

## Google OAuth Console Updates

Also update your Google OAuth console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add `http://localhost:5173/auth/google/callback` to Authorized redirect URIs
5. Add `http://localhost:5173` to Authorized JavaScript origins

## Summary

The main issues are:
1. ✅ **Google OAuth Client ID** - Updated in frontend
2. ❌ **Magic Link Port** - Needs backend update
3. ❌ **CORS Configuration** - Needs backend update
4. ❌ **Google OAuth Redirect URIs** - Needs Google Console update

Once these backend changes are made, the authentication should work perfectly!
