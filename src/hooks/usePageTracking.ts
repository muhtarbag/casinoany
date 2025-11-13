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

  useEffect(() => {
    // Track page view on mount and route change
    startTimeRef.current = Date.now();
    trackPageView();

    // Throttled scroll depth tracking (500ms)
    const handleScroll = throttle(() => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
      
      if (scrollPercentage > scrollDepthRef.current) {
        scrollDepthRef.current = scrollPercentage;
        if (scrollPercentage % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          analytics.trackScroll(scrollPercentage);
        }
      }
    }, 500); // 500ms throttle

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track page duration on unmount or route change
    return () => {
      window.removeEventListener('scroll', handleScroll);
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0) {
        trackPageView(location.pathname, document.title, duration);
      }
    };
  }, [location]);
};
