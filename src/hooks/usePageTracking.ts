import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, analytics } from '@/lib/analytics';

export const usePageTracking = () => {
  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const scrollDepthRef = useRef<number>(0);

  useEffect(() => {
    // Track page view on mount and route change
    startTimeRef.current = Date.now();
    trackPageView();

    // Scroll depth tracking
    const handleScroll = () => {
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
    };

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
