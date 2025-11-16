/**
 * Error Tracking Service
 * Centralized error handling and reporting
 */

import { logger } from './logger';
import { supabase } from '@/integrations/supabase/client';

interface ErrorContext {
  componentStack?: string;
  errorBoundary?: string;
  userAction?: string;
  route?: string;
  [key: string]: unknown;
}

interface TrackedError {
  id: string;
  message: string;
  stack?: string;
  timestamp: string;
  count: number;
  lastOccurrence: string;
  context: ErrorContext;
}

class ErrorTracker {
  private errorMap: Map<string, TrackedError> = new Map();
  private errorQueue: TrackedError[] = [];
  private flushInterval: number = 10000; // 10 seconds
  private maxQueueSize: number = 20;
  private flushTimer?: number;

  constructor() {
    this.setupGlobalErrorHandlers();
    this.startAutoFlush();
  }

  private setupGlobalErrorHandlers() {
    if (typeof window === 'undefined') return;

    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), {
        type: 'unhandled',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      this.trackError(error, {
        type: 'unhandled-rejection',
      });
    });

    // Catch React errors via error boundary
    window.addEventListener('react-error', ((event: CustomEvent) => {
      this.trackError(event.detail.error, {
        type: 'react',
        componentStack: event.detail.componentStack,
        errorBoundary: event.detail.boundaryName,
      });
    }) as EventListener);
  }

  private startAutoFlush() {
    if (typeof window !== 'undefined') {
      this.flushTimer = window.setInterval(() => {
        if (this.errorQueue.length > 0) {
          this.flush();
        }
      }, this.flushInterval);
    }
  }

  private generateErrorId(error: Error, context?: ErrorContext): string {
    // Create a unique ID based on error message and stack
    const stack = error.stack?.split('\n').slice(0, 3).join('\n') || '';
    const contextStr = context ? JSON.stringify(context) : '';
    return `${error.name}_${error.message}_${stack}_${contextStr}`.replace(/\s+/g, '_');
  }

  private async flush() {
    if (this.errorQueue.length === 0) return;

    const errorsToFlush = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // Send to Supabase system_logs
      await supabase.from('system_logs').insert(
        errorsToFlush.map(err => ({
          log_type: 'system',
          severity: 'error',
          action: 'Error occurred',
          resource: err.context.route || (typeof window !== 'undefined' ? window.location.pathname : null),
          details: JSON.parse(JSON.stringify({
            errorId: err.id,
            message: err.message,
            stack: err.stack,
            count: err.count,
            context: err.context,
          })),
          error_message: err.message,
          session_id: this.getSessionId(),
        }))
      );

      logger.info('system', `Flushed ${errorsToFlush.length} errors to database`);
    } catch (error) {
      // Silent fail - don't want error tracking to break the app
      logger.warn('system', 'Failed to flush errors', { error });
    }
  }

  private getSessionId(): string {
    if (typeof sessionStorage === 'undefined') return 'unknown';
    let sessionId = sessionStorage.getItem('error_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error_session_id', sessionId);
    }
    return sessionId;
  }

  // Public API
  trackError(error: Error, context?: ErrorContext) {
    const errorId = this.generateErrorId(error, context);
    const now = new Date().toISOString();

    // Check if error already tracked
    const existing = this.errorMap.get(errorId);
    
    if (existing) {
      // Update existing error
      existing.count++;
      existing.lastOccurrence = now;
      logger.warn('system', `Recurring error (${existing.count}x): ${error.message}`);
    } else {
      // Track new error
      const trackedError: TrackedError = {
        id: errorId,
        message: error.message,
        stack: error.stack,
        timestamp: now,
        count: 1,
        lastOccurrence: now,
        context: {
          ...context,
          route: window.location.pathname,
          userAgent: navigator.userAgent,
        },
      };

      this.errorMap.set(errorId, trackedError);
      this.errorQueue.push(trackedError);

      // Log to console/database
      logger.error('system', error.message, error, context);

      // Auto-flush if queue is full
      if (this.errorQueue.length >= this.maxQueueSize) {
        this.flush();
      }
    }
  }

  // Track API errors
  trackApiError(
    endpoint: string,
    method: string,
    status: number,
    error: Error,
    context?: Record<string, unknown>
  ) {
    this.trackError(error, {
      ...context,
      type: 'api',
      endpoint,
      method,
      status,
    });
  }

  // Track component errors
  trackComponentError(
    componentName: string,
    error: Error,
    errorInfo?: { componentStack?: string }
  ) {
    this.trackError(error, {
      type: 'component',
      component: componentName,
      componentStack: errorInfo?.componentStack,
    });
  }

  // Get error statistics
  getErrorStats() {
    const errors = Array.from(this.errorMap.values());
    return {
      total: errors.reduce((sum, err) => sum + err.count, 0),
      unique: errors.length,
      recent: errors.filter(err => {
        const hourAgo = Date.now() - 3600000;
        return new Date(err.lastOccurrence).getTime() > hourAgo;
      }).length,
    };
  }

  // Get top errors
  getTopErrors(limit: number = 10): TrackedError[] {
    return Array.from(this.errorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Manual flush
  async forceFlush() {
    await this.flush();
  }

  // Clear error history
  clearErrors() {
    this.errorMap.clear();
    this.errorQueue = [];
  }

  // Cleanup
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Export for testing
export { ErrorTracker };
