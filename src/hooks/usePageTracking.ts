import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * MINIMAL PAGE TRACKING - Performance First!
 * Only tracks page views in console, no database writes
 */
export const usePageTracking = () => {
  const location = useLocation();
  const trackedRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Prevent duplicate tracking
    if (trackedRef.current === currentPath) return;
    trackedRef.current = currentPath;

    // Simple console tracking - no database load
    console.log('📍 Page:', currentPath);
  }, [location.pathname]);
};
