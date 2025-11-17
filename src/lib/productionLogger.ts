/**
 * Production-safe logging utility
 * Only logs to console in development, sends to backend in production
 */

import { logger, type LogCategory } from './logger';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class ProductionLogger {
  private isDevelopment = import.meta.env.DEV;

  private mapToCategory(component?: string): LogCategory {
    switch (component) {
      case 'api': return 'api';
      case 'auth': return 'auth';
      case 'analytics': return 'analytics';
      case 'system': return 'system';
      case 'performance': return 'performance';
      default: return 'ui';
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (this.isDevelopment) {
      // In development, use console
      const logMethod = level === 'error' ? console.error : 
                       level === 'warn' ? console.warn : 
                       level === 'debug' ? console.debug : 
                       console.log;
      
      logMethod(`[${level.toUpperCase()}] ${message}`, context || '');
    } else {
      // In production, use centralized logger
      const category = this.mapToCategory(context?.component);
      
      if (level === 'error') {
        logger.error(category, message, undefined, context?.metadata);
      } else if (level === 'warn') {
        logger.warn(category, message, context?.metadata);
      } else if (level === 'info') {
        logger.info(category, message, context?.metadata);
      } else if (level === 'debug') {
        logger.debug(category, message, context?.metadata);
      }
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const err = error instanceof Error ? error : undefined;

    this.log('error', message, {
      ...context,
      metadata: {
        ...context?.metadata,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : error
      }
    });
    
    // Also send error to logger directly with proper signature
    if (!this.isDevelopment && err) {
      const category = this.mapToCategory(context?.component);
      logger.error(category, message, err, context?.metadata);
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  /**
   * Track user actions for analytics
   */
  trackAction(action: string, metadata?: Record<string, any>) {
    logger.action(action, metadata);
  }

  /**
   * Track API calls
   */
  trackAPI(endpoint: string, method: string, duration: number, statusCode: number) {
    logger.api(endpoint, method, duration, statusCode);
  }
}

export const prodLogger = new ProductionLogger();
