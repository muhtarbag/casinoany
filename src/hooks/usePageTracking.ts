import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, analytics } from '@/lib/analytics';

// Throttle fonksiyonu
const throttle = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastRan = 0;
  
  return function(this: any, ...args: any[]) {
    const now = Date.now();
    
    if (now - lastRan >= delay) {
      func.apply(this, args);
      lastRan = now;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastRan = Date.now();
      }, delay - (now - lastRan));
    }
  };
};

export const usePageTracking = () => {
  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const scrollDepthRef = useRef<number>(0);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Reset scroll depth on route change
    scrollDepthRef.current = 0;
    
    // Only track on initial mount, not on every route change
    if (isInitialMount.current) {
      startTimeRef.current = Date.now();
      trackPageView();
      isInitialMount.current = false;
    }

    // Throttled scroll depth tracking (500ms)
    const handleScroll = throttle(() => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
      
      if (scrollPercentage > scrollDepthRef.current && scrollPercentage % 25 === 0) {
        scrollDepthRef.current = scrollPercentage;
        analytics.trackScroll(scrollPercentage);
      }
    }, 500);

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);
};
