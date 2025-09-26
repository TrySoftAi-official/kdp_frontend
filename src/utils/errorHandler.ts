import { toast } from './toast';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  url?: string;
  userAgent?: string;
  additionalData?: any;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'payment' | 'subscription' | 'authentication' | 'network' | 'validation' | 'unknown';
}

class ErrorHandler {
  private errorReports: ErrorReport[] = [];
  private maxReports = 100;

  generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  categorizeError(error: Error, context: ErrorContext): ErrorReport['category'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('payment') || message.includes('checkout') || message.includes('stripe')) {
      return 'payment';
    }
    if (message.includes('subscription') || message.includes('plan')) {
      return 'subscription';
    }
    if (message.includes('auth') || message.includes('login') || message.includes('unauthorized')) {
      return 'authentication';
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return 'validation';
    }
    
    return 'unknown';
  }

  determineSeverity(error: Error, context: ErrorContext): ErrorReport['severity'] {
    const message = error.message.toLowerCase();
    
    // Critical errors that prevent core functionality
    if (message.includes('payment') && (message.includes('failed') || message.includes('error'))) {
      return 'critical';
    }
    if (message.includes('authentication') && message.includes('failed')) {
      return 'critical';
    }
    
    // High severity errors
    if (message.includes('subscription') && message.includes('failed')) {
      return 'high';
    }
    if (message.includes('network') && message.includes('error')) {
      return 'high';
    }
    
    // Medium severity errors
    if (message.includes('validation') || message.includes('invalid')) {
      return 'medium';
    }
    
    // Low severity errors
    return 'low';
  }

  reportError(error: Error, context: ErrorContext = {}): ErrorReport {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      },
      severity: this.determineSeverity(error, context),
      category: this.categorizeError(error, context)
    };

    // Add to reports
    this.errorReports.unshift(errorReport);
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(0, this.maxReports);
    }

    // Log to console
    console.error('Error Report:', errorReport);

    // Send to external service (if configured)
    this.sendToExternalService(errorReport);

    return errorReport;
  }

  private async sendToExternalService(errorReport: ErrorReport) {
    try {
      // In production, you would send this to your error tracking service
      // e.g., Sentry, LogRocket, Bugsnag, etc.
      
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to your backend error tracking endpoint
        // await fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorReport)
        // });
      }
    } catch (error) {
      console.error('Failed to send error report to external service:', error);
    }
  }

  handlePaymentError(error: Error, context: ErrorContext = {}) {
    const errorReport = this.reportError(error, {
      ...context,
      component: context.component || 'PaymentSystem',
      action: context.action || 'PaymentProcessing'
    });

    // Show user-friendly error message
    let userMessage = 'Payment processing failed. Please try again.';
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      userMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
      userMessage = 'Authentication required. Please log in again.';
    } else if (error.message.includes('forbidden') || error.message.includes('403')) {
      userMessage = 'Access denied. Please contact support.';
    } else if (error.message.includes('validation') || error.message.includes('400')) {
      userMessage = 'Invalid request. Please check your information and try again.';
    } else if (error.message.includes('server') || error.message.includes('500')) {
      userMessage = 'Server error. Please try again later.';
    }

    toast.error(userMessage);

    return errorReport;
  }

  handleSubscriptionError(error: Error, context: ErrorContext = {}) {
    const errorReport = this.reportError(error, {
      ...context,
      component: context.component || 'SubscriptionSystem',
      action: context.action || 'SubscriptionManagement'
    });

    // Show user-friendly error message
    let userMessage = 'Subscription operation failed. Please try again.';
    
    if (error.message.includes('plan') && error.message.includes('not found')) {
      userMessage = 'Selected plan not found. Please refresh and try again.';
    } else if (error.message.includes('already') && error.message.includes('plan')) {
      userMessage = 'You are already on this plan.';
    } else if (error.message.includes('permission') || error.message.includes('access')) {
      userMessage = 'You do not have permission to perform this action.';
    }

    toast.error(userMessage);

    return errorReport;
  }

  handleNetworkError(error: Error, context: ErrorContext = {}) {
    const errorReport = this.reportError(error, {
      ...context,
      component: context.component || 'NetworkService',
      action: context.action || 'NetworkRequest'
    });

    toast.error('Network error. Please check your connection and try again.');

    return errorReport;
  }

  handleValidationError(error: Error, context: ErrorContext = {}) {
    const errorReport = this.reportError(error, {
      ...context,
      component: context.component || 'ValidationService',
      action: context.action || 'DataValidation'
    });

    toast.error(error.message || 'Validation error. Please check your input.');

    return errorReport;
  }

  getErrorReports(): ErrorReport[] {
    return [...this.errorReports];
  }

  getErrorReportsByCategory(category: ErrorReport['category']): ErrorReport[] {
    return this.errorReports.filter(report => report.category === category);
  }

  getErrorReportsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.errorReports.filter(report => report.severity === severity);
  }

  clearErrorReports() {
    this.errorReports = [];
  }

  exportErrorReports(): string {
    return JSON.stringify(this.errorReports, null, 2);
  }

  // Utility method to wrap async functions with error handling
  async withErrorHandling<T>(
    fn: () => Promise<T>,
    context: ErrorContext = {},
    errorHandler?: (error: Error, context: ErrorContext) => void
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      if (errorHandler) {
        errorHandler(errorObj, context);
      } else {
        this.reportError(errorObj, context);
      }
      
      return null;
    }
  }

  // Utility method to wrap sync functions with error handling
  withErrorHandlingSync<T>(
    fn: () => T,
    context: ErrorContext = {},
    errorHandler?: (error: Error, context: ErrorContext) => void
  ): T | null {
    try {
      return fn();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      if (errorHandler) {
        errorHandler(errorObj, context);
      } else {
        this.reportError(errorObj, context);
      }
      
      return null;
    }
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Export convenience functions
export const handlePaymentError = (error: Error, context?: ErrorContext) => 
  errorHandler.handlePaymentError(error, context);

export const handleSubscriptionError = (error: Error, context?: ErrorContext) => 
  errorHandler.handleSubscriptionError(error, context);

export const handleNetworkError = (error: Error, context?: ErrorContext) => 
  errorHandler.handleNetworkError(error, context);

export const handleValidationError = (error: Error, context?: ErrorContext) => 
  errorHandler.handleValidationError(error, context);

export const withErrorHandling = <T>(
  fn: () => Promise<T>,
  context?: ErrorContext,
  errorHandler?: (error: Error, context: ErrorContext) => void
) => errorHandler.withErrorHandling(fn, context, errorHandler);

export const withErrorHandlingSync = <T>(
  fn: () => T,
  context?: ErrorContext,
  errorHandler?: (error: Error, context: ErrorContext) => void
) => errorHandler.withErrorHandlingSync(fn, context, errorHandler);
