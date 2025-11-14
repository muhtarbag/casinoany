/**
 * Optimized lazy loading with preloading strategy
 * Improves performance by preloading routes on hover/focus
 */

import { lazy, ComponentType } from 'react';

type PreloadableComponent<T = any> = ComponentType<T> & {
  preload?: () => Promise<{ default: ComponentType<T> }>;
};

/**
 * Create a lazy component with preload capability
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): PreloadableComponent<React.ComponentProps<T>> {
  const LazyComponent = lazy(factory) as PreloadableComponent<React.ComponentProps<T>>;
  LazyComponent.preload = factory;
  return LazyComponent;
}

/**
 * Preload route components on link hover
 */
export function setupRoutePreloading() {
  if (typeof window === 'undefined') return;

  // Track preloaded routes
  const preloadedRoutes = new Set<string>();

  // Add hover listeners to navigation links
  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href^="/"]') as HTMLAnchorElement;
    
    if (link && !preloadedRoutes.has(link.pathname)) {
      const route = link.pathname;
      preloadedRoutes.add(route);
      
      // Trigger route preload based on path
      preloadRouteForPath(route);
    }
  }, { passive: true, capture: true });
}

/**
 * Preload specific route component
 */
function preloadRouteForPath(path: string) {
  // Map routes to their lazy loaders
  // This will be called when hovering over links
  const routeMap: Record<string, () => Promise<any>> = {
    '/': () => import('../pages/Index'),
    '/admin': () => import('../pages/admin'),
    '/blog': () => import('../pages/Blog'),
    '/news': () => import('../pages/News'),
    '/casino-siteleri': () => import('../pages/CasinoSites'),
    '/spor-bahisleri': () => import('../pages/SportsBetting'),
    '/canli-casino': () => import('../pages/LiveCasino'),
  };

  // Match route and preload
  for (const [route, preloader] of Object.entries(routeMap)) {
    if (path.startsWith(route)) {
      preloader().catch(() => {
        // Silently fail preloading
      });
      break;
    }
  }
}
