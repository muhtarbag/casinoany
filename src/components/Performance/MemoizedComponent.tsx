/**
 * Performance Optimization Utilities
 * HOCs and utilities for component optimization
 */

import { memo, ComponentType } from 'react';

/**
 * Deep comparison memo for complex props
 */
export function deepMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return memo(Component, propsAreEqual);
}

/**
 * Shallow comparison for simple props (default React.memo behavior)
 */
export function shallowMemo<P extends object>(Component: ComponentType<P>) {
  return memo(Component);
}

/**
 * Custom comparison that ignores certain props
 */
export function memoIgnoringProps<P extends object>(
  Component: ComponentType<P>,
  ignoredProps: (keyof P)[]
) {
  return memo(Component, (prevProps, nextProps) => {
    const keysToCompare = Object.keys(prevProps).filter(
      (key) => !ignoredProps.includes(key as keyof P)
    ) as (keyof P)[];

    return keysToCompare.every(
      (key) => prevProps[key] === nextProps[key]
    );
  });
}

/**
 * Memo for components that only re-render on specific prop changes
 */
export function memoOnlyOn<P extends object>(
  Component: ComponentType<P>,
  watchedProps: (keyof P)[]
) {
  return memo(Component, (prevProps, nextProps) => {
    return watchedProps.every(
      (key) => prevProps[key] === nextProps[key]
    );
  });
}

/**
 * Performance measurement wrapper
 */
export function withPerformanceTracking<P extends object>(
  Component: ComponentType<P>,
  componentName: string
) {
  if (import.meta.env.DEV) {
    return memo((props: P) => {
      const start = performance.now();
      
      const result = <Component {...props} />;
      
      const end = performance.now();
      const renderTime = end - start;
      
      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
      
      return result;
    });
  }
  
  return memo(Component);
}
