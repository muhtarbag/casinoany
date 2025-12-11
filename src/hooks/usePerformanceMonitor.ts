/**
 * Performance Monitoring Hook
 * React hook for tracking component performance
 */

import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '@/lib/performance';
import { logger } from '@/lib/logger';

interface UsePerformanceOptions {
  componentName: string;
  trackMount?: boolean;
  trackRender?: boolean;
  warnThreshold?: number; // ms
}

export const usePerformanceMonitor = (options: UsePerformanceOptions) => {
  const { componentName, trackMount = true, trackRender = true, warnThreshold = 100 } = options;
  
  const mountTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const lastRenderRef = useRef<number>(0);

  // Track component mount
  useEffect(() => {
    if (!trackMount) return;

    const mountTime = performance.now();
    mountTimeRef.current = mountTime;
    performanceMonitor.mark(`${componentName}-mount-start`);

    return () => {
      const unmountTime = performance.now();
      const lifetime = unmountTime - mountTime;
      
      logger.metric(`${componentName} lifetime`, lifetime, {
        renderCount: renderCountRef.current,
      });
    };
  }, [componentName, trackMount]);

  // Track render performance
  useEffect(() => {
    if (!trackRender) return;

    const now = performance.now();
    renderCountRef.current++;

    if (lastRenderRef.current > 0) {
      const renderTime = now - lastRenderRef.current;
      
      if (renderTime > warnThreshold) {
        performanceMonitor.trackComponentRender(componentName, renderTime);
      }
    }

    lastRenderRef.current = now;
  });

  // Manual performance tracking
  const startMeasure = useCallback((measureName: string) => {
    const markName = `${componentName}-${measureName}-start`;
    performanceMonitor.mark(markName);
    return markName;
  }, [componentName]);

  const endMeasure = useCallback((measureName: string, startMark: string) => {
    const endMark = `${componentName}-${measureName}-end`;
    performanceMonitor.mark(endMark);
    return performanceMonitor.measure(`${componentName}-${measureName}`, startMark, endMark);
  }, [componentName]);

  // Track async operations
  const trackAsync = useCallback(async <T,>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const startMark = startMeasure(operationName);
    const startTime = performance.now();

    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      endMeasure(operationName, startMark);
      
      logger.metric(`${componentName}: ${operationName}`, duration);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error('performance', `${componentName}: ${operationName} failed`, error as Error, {
        duration,
      });
      throw error;
    }
  }, [componentName, startMeasure, endMeasure]);

  return {
    startMeasure,
    endMeasure,
    trackAsync,
    renderCount: renderCountRef.current,
  };
};

// Hook for tracking page load performance
export const usePageLoadPerformance = (pageName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    console.log(`[Performance] ${pageName} - Component mounted`);

    // Track when component becomes interactive
    const timeoutId = setTimeout(() => {
      const duration = performance.now() - startTime;
      console.log(`[Performance] ${pageName} - Load complete in ${duration.toFixed(2)}ms`);
      
      if (duration > 3000) {
        logger.warn('performance', `Slow page load: ${pageName}`, { duration });
        console.warn(`⚠️ Slow page load detected: ${pageName} took ${duration.toFixed(2)}ms`);
      } else if (duration > 1000) {
        console.log(`⏱️ Page load: ${pageName} took ${duration.toFixed(2)}ms`);
      } else {
        console.log(`✅ Fast page load: ${pageName} took ${duration.toFixed(2)}ms`);
      }
    }, 100); // Small delay to ensure rendering is complete

    return () => clearTimeout(timeoutId);
  }, [pageName]);
};

// Hook for tracking user interactions
export const useInteractionTracking = (componentName: string) => {
  const trackInteraction = useCallback((
    action: string,
    metadata?: Record<string, unknown>
  ) => {
    logger.action(`${componentName}: ${action}`, metadata);
  }, [componentName]);

  return { trackInteraction };
};
