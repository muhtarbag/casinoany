/**
 * Performance Optimization Utilities
 * Collection of utilities to improve app performance
 */

/**
 * Preload critical resources
 */
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fonts = [
    '/fonts/inter-var.woff2',
  ];
  
  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = font;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Defer non-critical scripts
 */
export const deferNonCriticalScripts = () => {
  const scripts = document.querySelectorAll('script[data-defer]');
  scripts.forEach(script => {
    script.setAttribute('defer', '');
  });
};

/**
 * Request Idle Callback polyfill
 */
export const requestIdleCallback = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  // Fallback for browsers without requestIdleCallback
  return setTimeout(() => {
    const start = Date.now();
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    });
  }, 1) as any;
};

/**
 * Optimize image loading with Intersection Observer
 */
export const lazyLoadImages = () => {
  if (!('IntersectionObserver' in window)) return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (src) img.src = src;
        if (srcset) img.srcset = srcset;
        
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px', // Start loading 50px before entering viewport
    threshold: 0.01
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
};

/**
 * Prefetch links on hover
 */
export const prefetchOnHover = () => {
  const prefetchedLinks = new Set<string>();
  
  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.href && !prefetchedLinks.has(link.href)) {
      const url = new URL(link.href);
      
      // Only prefetch same-origin links
      if (url.origin === location.origin) {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = link.href;
        document.head.appendChild(prefetchLink);
        
        prefetchedLinks.add(link.href);
      }
    }
  }, { passive: true });
};

/**
 * Reduce layout shifts by reserving space
 */
export const preventLayoutShift = (selector: string) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    const el = element as HTMLElement;
    if (!el.style.minHeight && el.offsetHeight > 0) {
      el.style.minHeight = `${el.offsetHeight}px`;
    }
  });
};

/**
 * Debounce function for expensive operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll/resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Initialize all performance optimizations
 */
export const initPerformanceOptimizations = () => {
  // Run immediately
  preloadCriticalResources();
  deferNonCriticalScripts();
  
  // Run after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      requestIdleCallback(() => {
        lazyLoadImages();
        prefetchOnHover();
      });
    });
  } else {
    requestIdleCallback(() => {
      lazyLoadImages();
      prefetchOnHover();
    });
  }
};
