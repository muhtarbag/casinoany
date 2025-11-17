import { useEffect } from 'react';
import { errorTracker } from '@/lib/errorTracking';
import { prodLogger } from '@/lib/productionLogger';

/**
 * Global Error Tracking Provider
 * Sets up unhandled error tracking for the entire application
 */
export const ErrorTrackingProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Global unhandled error handler
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      errorTracker.trackError(new Error(event.message), {
        source: 'window.onerror',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      prodLogger.error('Unhandled error', event.error, {
        component: 'GlobalErrorHandler',
        metadata: {
          filename: event.filename,
          lineno: event.lineno
        }
      });
    };

    // Global unhandled promise rejection handler
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      errorTracker.trackError(error, {
        source: 'unhandledrejection',
        promise: true
      });
      
      prodLogger.error('Unhandled promise rejection', error, {
        component: 'GlobalErrorHandler'
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
      errorTracker.destroy();
    };
  }, []);

  return <>{children}</>;
};
