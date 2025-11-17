/**
 * Intersection Observer Hook for Lazy Loading
 * Efficiently detects when elements enter the viewport
 */

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Skip if already triggered and triggerOnce is true
    if (isVisible && triggerOnce) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          if (triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, triggerOnce, isVisible]);

  return [elementRef, isVisible];
}

/**
 * Hook to preload images when they're about to enter viewport
 */
export function useImagePreload(src: string, distance: string = '200px'): boolean {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ref] = useIntersectionObserver({
    rootMargin: distance,
    triggerOnce: true,
  });

  useEffect(() => {
    if (ref.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        { rootMargin: distance }
      );

      observer.observe(ref.current);

      return () => observer.disconnect();
    }
  }, [src, distance, ref]);

  return shouldLoad;
}
