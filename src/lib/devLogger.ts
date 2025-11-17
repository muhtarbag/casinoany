/**
 * Development Logger Utility
 * Conditionally logs only in development mode
 * Prevents console spam in production
 */

const isDevelopment = import.meta.env.DEV;

export const devLogger = {
  /**
   * Log general information (development only)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEV]', ...args);
    }
  },

  /**
   * Log warnings (development only)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[DEV]', ...args);
    }
  },

  /**
   * Log errors (always logged, but with context in dev)
   */
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error('[DEV]', ...args);
    } else {
      // In production, only log critical errors
      console.error(...args);
    }
  },

  /**
   * Log performance metrics (development only)
   */
  performance: (label: string, time: number) => {
    if (isDevelopment) {
      const color = time > 100 ? 'red' : time > 50 ? 'orange' : 'green';
      console.log(
        `%c[PERF] ${label}: ${time.toFixed(2)}ms`,
        `color: ${color}; font-weight: bold`
      );
    }
  },

  /**
   * Log React Query cache operations (development only)
   */
  cache: (operation: string, queryKey: any[]) => {
    if (isDevelopment) {
      console.log(
        '%c[CACHE]',
        'color: purple; font-weight: bold',
        operation,
        queryKey
      );
    }
  },

  /**
   * Log prefetch operations (development only)
   */
  prefetch: (resource: string, status: 'start' | 'cached' | 'complete') => {
    if (isDevelopment) {
      const emoji = status === 'start' ? '🔄' : status === 'cached' ? '✅' : '✨';
      console.log(`${emoji} [PREFETCH] ${resource}:`, status);
    }
  },

  /**
   * Group related logs (development only)
   */
  group: (label: string, callback: () => void) => {
    if (isDevelopment) {
      console.group(`[DEV] ${label}`);
      callback();
      console.groupEnd();
    }
  },
};
