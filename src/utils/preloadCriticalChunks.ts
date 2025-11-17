/**
 * Preload critical chunks during idle time
 * This improves perceived performance by loading important code in background
 */

import { lazyWithPreload } from './lazyLoadRoutes';

// Define critical routes that should be preloaded
const criticalRoutes = {
  // Most visited pages
  home: () => import('../pages/Index'),
  casinoSites: () => import('../pages/CasinoSites'),
  blog: () => import('../pages/Blog'),
  siteDetail: () => import('../pages/SiteDetail'),
  
  // Auth pages (likely next navigation)
  login: () => import('../pages/Login'),
  signup: () => import('../pages/Signup'),
};

// Define critical components that should be preloaded
const criticalComponents = {
  header: () => import('../components/Header'),
  footer: () => import('../components/Footer'),
  notificationPopup: () => import('../components/OptimizedNotificationPopup'),
};

/**
 * Preload critical resources during browser idle time
 */
export const preloadCriticalChunks = () => {
  if (typeof window === 'undefined') return;

  const preloadQueue = [
    ...Object.values(criticalRoutes),
    ...Object.values(criticalComponents),
  ];

  const preloadNext = (index: number) => {
    if (index >= preloadQueue.length) return;

    const preloadFn = preloadQueue[index];
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(
        () => {
          preloadFn().catch(() => {
            // Silently fail - not critical
          });
          preloadNext(index + 1);
        },
        { timeout: 2000 }
      );
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        preloadFn().catch(() => {
          // Silently fail
        });
        preloadNext(index + 1);
      }, 100 * index);
    }
  };

  // Start preloading after initial render
  setTimeout(() => preloadNext(0), 1000);
};

/**
 * Preload route based on user interaction hints
 */
export const preloadOnHover = (routeName: keyof typeof criticalRoutes) => {
  const route = criticalRoutes[routeName];
  if (route) {
    route().catch(() => {
      // Silently fail
    });
  }
};
