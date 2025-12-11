import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Disable browser's default scroll restoration to prevent conflicts
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Force scroll to top on all possible containers
    window.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);

    // Fallback for older browsers or specific CSS setups
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [pathname]);

  return null;
};
