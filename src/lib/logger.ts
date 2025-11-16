/**
 * Centralized Logger Service
 * Production-ready, type-safe logging infrastructure
 */

import { supabase } from '@/integrations/supabase/client';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type LogCategory = 'api' | 'ui' | 'auth' | 'analytics' | 'system' | 'performance';

interface LogContext {
  userId?: string;
  sessionId?: string;
  page?: string;
  component?: string;
  userAgent?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  timestamp: string;
  context?: LogContext;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;
  private sessionId: string;
  private buffer: LogEntry[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private maxBufferSize: number = 50;
  private flushTimer?: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startAutoFlush();
    
    // Listen for page unload to flush logs
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startAutoFlush() {
    if (typeof window !== 'undefined') {
      this.flushTimer = window.setInterval(() => {
        if (this.buffer.length > 0) {
          this.flush();
        }
      }, this.flushInterval);
    }
  }

  private getContext(): LogContext {
    const context: LogContext = {
      sessionId: this.sessionId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    if (typeof window !== 'undefined') {
      context.page = window.location.pathname;
    }

    return context;
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      level,
      category,
      message,
      timestamp: new Date().toISOString(),
      context: this.getContext(),
      metadata,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private shouldLog(level: LogLevel): boolean {
    // Always log in development
    if (this.isDevelopment) return true;

    // In production, only log warn, error, critical
    const productionLevels: LogLevel[] = ['warn', 'error', 'critical'];
    return productionLevels.includes(level);
  }

  private addToBuffer(entry: LogEntry) {
    this.buffer.push(entry);

    // Auto-flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.buffer.length === 0) return;

    const logsToFlush = [...this.buffer];
    this.buffer = [];

    try {
      // Send to Supabase system_logs
      await supabase.from('system_logs').insert(
        logsToFlush.map(log => ({
          log_type: log.category,
          severity: log.level,
          action: log.message,
          resource: log.context?.page || null,
          details: JSON.parse(JSON.stringify({
            ...log.context,
            ...log.metadata,
            error: log.error,
          })),
          session_id: log.context?.sessionId || null,
          error_message: log.error?.message || null,
        }))
      );
    } catch (error) {
      // Silent fail - don't want logging to break the app
      if (this.isDevelopment) {
        console.error('Failed to flush logs:', error);
      }
    }
  }

  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>,
    error?: Error
  ) {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, category, message, metadata, error);

    // Console output in development
    if (this.isDevelopment) {
      const consoleMethod = level === 'critical' || level === 'error' ? console.error 
        : level === 'warn' ? console.warn 
        : console.log;

      consoleMethod(
        `[${level.toUpperCase()}] [${category}]`,
        message,
        metadata || '',
        error || ''
      );
    }

    // Add to buffer for batch sending
    if (this.isProduction && (level === 'error' || level === 'critical' || level === 'warn')) {
      this.addToBuffer(entry);
    }
  }

  // Public API
  debug(category: LogCategory, message: string, metadata?: Record<string, unknown>) {
    this.log('debug', category, message, metadata);
  }

  info(category: LogCategory, message: string, metadata?: Record<string, unknown>) {
    this.log('info', category, message, metadata);
  }

  warn(category: LogCategory, message: string, metadata?: Record<string, unknown>) {
    this.log('warn', category, message, metadata);
  }

  error(category: LogCategory, message: string, error?: Error, metadata?: Record<string, unknown>) {
    this.log('error', category, message, metadata, error);
  }

  critical(category: LogCategory, message: string, error?: Error, metadata?: Record<string, unknown>) {
    this.log('critical', category, message, metadata, error);
    // Immediately flush critical errors
    this.flush();
  }

  // Performance logging
  metric(name: string, value: number, metadata?: Record<string, unknown>) {
    this.info('performance', `Metric: ${name}`, {
      metric: name,
      value,
      unit: 'ms',
      ...metadata,
    });
  }

  // User action tracking
  action(action: string, metadata?: Record<string, unknown>) {
    this.info('ui', `User action: ${action}`, metadata);
  }

  // API call tracking
  api(method: string, endpoint: string, status: number, duration: number, error?: Error) {
    const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    this.log(level, 'api', `${method} ${endpoint}`, {
      method,
      endpoint,
      status,
      duration,
    }, error);
  }

  // Manual flush
  async forceFlush() {
    await this.flush();
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
export const logger = new Logger();

// Export for testing
export { Logger };
