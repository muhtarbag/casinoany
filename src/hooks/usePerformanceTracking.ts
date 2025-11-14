/**
 * React Hook for Performance Tracking
 * Integrates performance monitoring into React components
 */

import { useEffect, useRef } from 'react';
import { trackComponentRender, measureAsync } from '@/lib/performanceMonitor';

/**
 * Track component render performance
 */
export const useRenderTracking = (componentName: string) => {
  const renderStart = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    trackComponentRender(componentName, renderTime);
  });
};

/**
 * Track component mount/unmount lifecycle
 */
export const useLifecycleTracking = (componentName: string) => {
  const mountTime = useRef(performance.now());

  useEffect(() => {
    const mountDuration = performance.now() - mountTime.current;
    
    trackComponentRender(`${componentName}_mount`, mountDuration);

    return () => {
      const unmountStart = performance.now();
      // Track cleanup time
      requestAnimationFrame(() => {
        const unmountDuration = performance.now() - unmountStart;
        trackComponentRender(`${componentName}_unmount`, unmountDuration);
      });
    };
  }, [componentName]);
};

/**
 * Wrap async operation with performance tracking
 */
export const useAsyncTracking = () => {
  return <T>(name: string, operation: () => Promise<T>) => {
    return measureAsync(name, operation);
  };
};
