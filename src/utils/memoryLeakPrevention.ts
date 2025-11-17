/**
 * Memory Leak Prevention Utilities
 * Helpers to prevent common memory leak patterns
 */

import { useEffect, useRef } from 'react';

/**
 * Safe setTimeout hook with automatic cleanup
 */
export const useSafeTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    timeoutRef.current = setTimeout(() => savedCallback.current(), delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);
};

/**
 * Safe setInterval hook with automatic cleanup
 */
export const useSafeInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    intervalRef.current = setInterval(() => savedCallback.current(), delay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [delay]);
};

/**
 * Safe event listener hook with automatic cleanup
 */
export const useSafeEventListener = <K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement = window
) => {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: Event) => savedHandler.current(event as WindowEventMap[K]);
    element.addEventListener(event, eventListener);

    return () => {
      element.removeEventListener(event, eventListener);
    };
  }, [event, element]);
};

/**
 * Memory leak detection helper
 */
export const detectPotentialLeaks = () => {
  if (import.meta.env.DEV && 'memory' in performance) {
    const memory = (performance as any).memory;
    console.log('Memory Usage:', {
      usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB`,
      totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB`,
      jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB`,
    });
  }
};
