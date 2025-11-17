/**
 * Lazy Component Wrapper with Loading State
 * Provides consistent loading UI for lazy-loaded components
 * ✅ FIX: Added ErrorBoundary to catch lazy component load failures
 */

import { Suspense, ComponentType, lazy as reactLazy } from 'react';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface LazyComponentProps {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
  [key: string]: any;
}

/**
 * Wrapper for lazy-loaded components with fallback UI
 * ✅ FIX: Wrapped with ErrorBoundary to catch chunk load failures
 */
export function LazyComponent({ 
  component: Component, 
  fallback,
  ...props 
}: LazyComponentProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || <LoadingState variant="skeleton" rows={5} />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Enhanced lazy with retry mechanism
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> {
  return reactLazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (retriesLeft: number) => {
        componentImport()
          .then(resolve)
          .catch((error) => {
            if (retriesLeft === 0) {
              reject(error);
              return;
            }
            
            // Retry after exponential backoff
            const delay = Math.pow(2, retries - retriesLeft) * 1000;
            setTimeout(() => attemptImport(retriesLeft - 1), delay);
          });
      };
      
      attemptImport(retries);
    })
  );
}

/**
 * Preload a lazy component
 */
export function preloadComponent<T extends ComponentType<any>>(
  lazyComponent: React.LazyExoticComponent<T>
): void {
  // Trigger preload by accessing the component
  // This works by causing React to start fetching the module
  const preloadPromise = (lazyComponent as any)._ctor;
  if (preloadPromise) {
    preloadPromise();
  }
}
