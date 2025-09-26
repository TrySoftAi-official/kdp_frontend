import CookieManager from '../cookies';

// Mock universal-cookie
jest.mock('universal-cookie', () => {
  const mockCookies = new Map();
  
  return jest.fn().mockImplementation(() => ({
    set: jest.fn((name: string, value: string, options?: any) => {
      mockCookies.set(name, value);
    }),
    get: jest.fn((name: string) => {
      return mockCookies.get(name) || null;
    }),
    remove: jest.fn((name: string, options?: any) => {
      mockCookies.delete(name);
    }),
  }));
});

describe('CookieManager', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    CookieManager.clearAuthData();
  });

  test('should set and get access token', () => {
    const token = 'test-access-token';
    CookieManager.setAccessToken(token);
    expect(CookieManager.getAccessToken()).toBe(token);
  });

  test('should set and get refresh token', () => {
    const token = 'test-refresh-token';
    CookieManager.setRefreshToken(token);
    expect(CookieManager.getRefreshToken()).toBe(token);
  });

  test('should set and get user data', () => {
    const userData = { id: 1, email: 'test@example.com', name: 'Test User' };
    CookieManager.setUserData(userData);
    expect(CookieManager.getUserData()).toEqual(userData);
  });

  test('should set and get auth state', () => {
    CookieManager.setAuthState(true);
    expect(CookieManager.getAuthState()).toBe(true);
    
    CookieManager.setAuthState(false);
    expect(CookieManager.getAuthState()).toBe(false);
  });

  test('should set all auth data at once', () => {
    const authData = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 1, email: 'test@example.com' }
    };
    
    CookieManager.setAuthData(authData);
    
    expect(CookieManager.getAccessToken()).toBe(authData.accessToken);
    expect(CookieManager.getRefreshToken()).toBe(authData.refreshToken);
    expect(CookieManager.getUserData()).toEqual(authData.user);
    expect(CookieManager.getAuthState()).toBe(true);
  });

  test('should get all auth data', () => {
    const authData = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 1, email: 'test@example.com' }
    };
    
    CookieManager.setAuthData(authData);
    const retrievedData = CookieManager.getAuthData();
    
    expect(retrievedData.accessToken).toBe(authData.accessToken);
    expect(retrievedData.refreshToken).toBe(authData.refreshToken);
    expect(retrievedData.user).toEqual(authData.user);
    expect(retrievedData.isAuthenticated).toBe(true);
  });

  test('should clear all auth data', () => {
    const authData = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 1, email: 'test@example.com' }
    };
    
    CookieManager.setAuthData(authData);
    CookieManager.clearAuthData();
    
    expect(CookieManager.getAccessToken()).toBeNull();
    expect(CookieManager.getRefreshToken()).toBeNull();
    expect(CookieManager.getUserData()).toBeNull();
    expect(CookieManager.getAuthState()).toBe(false);
  });

  test('should check if user is authenticated', () => {
    expect(CookieManager.isAuthenticated()).toBe(false);
    
    CookieManager.setAccessToken('token');
    CookieManager.setAuthState(true);
    
    expect(CookieManager.isAuthenticated()).toBe(true);
  });

  test('should update access token', () => {
    const oldToken = 'old-token';
    const newToken = 'new-token';
    
    CookieManager.setAccessToken(oldToken);
    expect(CookieManager.getAccessToken()).toBe(oldToken);
    
    CookieManager.updateAccessToken(newToken);
    expect(CookieManager.getAccessToken()).toBe(newToken);
  });
});
