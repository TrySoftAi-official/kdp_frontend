import { UserRole, SubscriptionPlan } from '@/types';

export const ROLES: Record<UserRole, { label: string; permissions: string[] }> = {
  admin: {
    label: 'Administrator',
    permissions: ['read', 'write', 'delete', 'manage_users', 'view_analytics', 'manage_campaigns']
  },
  assistant: {
    label: 'Assistant',
    permissions: ['read', 'write', 'view_analytics']
  },
  marketer: {
    label: 'Marketer',
    permissions: ['read', 'view_analytics', 'manage_campaigns']
  },
  guest: {
    label: 'Guest',
    permissions: ['read']
  }
};

export const BOOK_STATUSES = {
  published: { label: 'Published', color: 'bg-green-100 text-green-800' },
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' }
};

export const EVENT_TYPES = {
  success: { color: 'bg-green-500', textColor: 'text-green-600' },
  error: { color: 'bg-red-500', textColor: 'text-red-600' },
  info: { color: 'bg-blue-500', textColor: 'text-blue-600' },
  warning: { color: 'bg-yellow-500', textColor: 'text-yellow-600' }
};

export const DATE_RANGES = {
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
  'ytd': { label: 'Year to date', days: null },
  'custom': { label: 'Custom range', days: null }
};

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' }
];

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    refresh: '/api/auth/refresh'
  },
  books: {
    list: '/api/books',
    create: '/api/books',
    update: '/api/books/:id',
    delete: '/api/books/:id',
    upload: '/api/books/upload'
  },
  analytics: {
    metrics: '/api/analytics/metrics',
    charts: '/api/analytics/charts',
    books: '/api/analytics/books'
  },
  campaigns: {
    list: '/api/campaigns',
    create: '/api/campaigns',
    update: '/api/campaigns/:id',
    delete: '/api/campaigns/:id'
  },
  niches: {
    list: '/api/niches',
    create: '/api/niches',
    update: '/api/niches/:id',
    delete: '/api/niches/:id'
  }
};

export const CHART_COLORS = {
  primary: '#2563eb',
  secondary: '#9333ea',
  accent: '#f59e0b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
  limitOptions: [10, 25, 50, 100]
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingCycle: 'monthly',
    features: [
      '1 book per month',
      'Basic templates',
      'Community support',
      'Standard publishing'
    ],
    limits: {
      booksPerMonth: 1,
      analyticsAccess: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false
    }
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    billingCycle: 'monthly',
    features: [
      '5 books per month',
      'Premium templates',
      'Email support',
      'Advanced publishing tools',
      'Basic analytics'
    ],
    limits: {
      booksPerMonth: 5,
      analyticsAccess: true,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    billingCycle: 'monthly',
    popular: true,
    features: [
      'Unlimited books',
      'All templates',
      'Priority support',
      'Custom branding',
      'Advanced analytics',
      'API access'
    ],
    limits: {
      booksPerMonth: -1, // unlimited
      analyticsAccess: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    billingCycle: 'monthly',
    features: [
      'Everything in Pro',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee'
    ],
    limits: {
      booksPerMonth: -1,
      analyticsAccess: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true
    }
  }
];

export const ROLE_PERMISSIONS = {
  admin: {
    canCreateBooks: true,
    canAccessAnalytics: true,
    canManageUsers: true,
    canAccessAllFeatures: true,
    requiredPlan: 'pro'
  },
  assistant: {
    canCreateBooks: true,
    canAccessAnalytics: true,
    canManageUsers: false,
    canAccessAllFeatures: false,
    requiredPlan: 'basic'
  },
  marketer: {
    canCreateBooks: true,
    canAccessAnalytics: true,
    canManageUsers: false,
    canAccessAllFeatures: false,
    requiredPlan: 'basic'
  },
  guest: {
    canCreateBooks: false,
    canAccessAnalytics: false,
    canManageUsers: false,
    canAccessAllFeatures: false,
    requiredPlan: 'basic'
  }
};
