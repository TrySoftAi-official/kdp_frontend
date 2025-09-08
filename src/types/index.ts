import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'assistant' | 'marketer' | 'guest';
  avatar?: string;
  subscription?: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'expired' | 'cancelled';
    expiresAt?: string;
    features: string[];
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    booksPerMonth: number;
    analyticsAccess: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
  popular?: boolean;
}

export interface Book {
  id: string;
  title: string;
  status: 'published' | 'processing' | 'failed' | 'saved' | 'generated' | 'draft';
  revenue: number;
  adSpend: number;
  roas: number;
  acos: number;
  kenp: number;
  country: string;
  date: string;
  author?: string;
  genre?: string;
  publishedAt?: string;
  lastUpdated?: string;
}

export interface Metric {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  color: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'success' | 'error' | 'info' | 'warning';
  icon?: LucideIcon;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'ended';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  startDate: string;
  endDate?: string;
}

export interface Niche {
  id: string;
  name: string;
  category: string;
  competitionLevel: 'low' | 'medium' | 'high';
  avgRevenue: number;
  bookCount: number;
  trendDirection: 'up' | 'down' | 'stable';
  keywords: string[];
}

export interface ChartData {
  date: string;
  revenue: number;
  adSpend: number;
  roas: number;
  [key: string]: string | number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterOptions {
  status?: Book['status'];
  dateRange?: {
    start: string;
    end: string;
  };
  country?: string;
  search?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export type UserRole = User['role'];
export type BookStatus = Book['status'];
export type EventType = Event['type'];
export type DateRange = '7d' | '30d' | '90d' | 'ytd' | 'custom';
