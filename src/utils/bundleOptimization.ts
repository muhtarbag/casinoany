/**
 * Bundle Optimization Utilities
 * Helps reduce bundle size and improve loading performance
 */

/**
 * Dynamically import large libraries only when needed
 * Example: Date formatting libraries, chart libraries, etc.
 */

export const lazyImports = {
  /**
   * Lazy load date-fns functions
   * Only imports when actually needed
   */
  dateFns: {
    format: () => import('date-fns').then(m => m.format),
    formatDistance: () => import('date-fns').then(m => m.formatDistance),
    formatRelative: () => import('date-fns').then(m => m.formatRelative),
    parseISO: () => import('date-fns').then(m => m.parseISO),
  },

  /**
   * Lazy load lodash utilities
   * Tree-shaking friendly imports
   */
  lodash: {
    debounce: () => import('lodash-es/debounce').then(m => m.default),
    throttle: () => import('lodash-es/throttle').then(m => m.default),
    groupBy: () => import('lodash-es/groupBy').then(m => m.default),
    sortBy: () => import('lodash-es/sortBy').then(m => m.default),
  },
};

/**
 * Preload critical resources
 * Hints browser to prioritize important assets
 */
export function preloadCriticalResources() {
  // Preload critical fonts
  const fonts = [
    '/fonts/inter-var.woff2',
    '/fonts/space-grotesk.woff2',
  ];

  fonts.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = href;
    document.head.appendChild(link);
  });
}

/**
 * Prefetch non-critical resources
 * Loads resources when browser is idle
 */
export function prefetchResources(urls: string[]) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      urls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    });
  }
}

/**
 * Code splitting helpers
 * Dynamically import heavy components
 */
export const splitComponents = {
  // Admin components (only load when accessing admin)
  AdminDashboard: () => import('@/pages/admin/Dashboard'),
  AdminSites: () => import('@/pages/admin/sites/index'),
  AdminReviews: () => import('@/pages/admin/Reviews'),
  
  // Heavy UI components
  RichTextEditor: () => import('@/components/RichTextEditor'),
  ChartComponents: () => import('recharts'),
};

/**
 * Remove unused code detection
 * Helps identify dead code for removal
 */
export function detectUnusedExports() {
  if (import.meta.env.DEV) {
    console.log('[Bundle Optimization] Run build analysis to detect unused exports');
    console.log('Run: npm run build -- --analyze');
  }
}

/**
 * Bundle analysis recommendations
 */
export const bundleOptimizationTips = {
  images: [
    'Use WebP format for better compression',
    'Implement lazy loading for below-fold images',
    'Use appropriate image sizes (responsive)',
    'Consider using CDN for image delivery',
  ],
  
  javascript: [
    'Use dynamic imports for route-based code splitting',
    'Lazy load heavy libraries (charts, editors)',
    'Remove unused dependencies',
    'Enable tree-shaking in build config',
  ],
  
  css: [
    'Remove unused CSS with PurgeCSS',
    'Use CSS-in-JS tree-shaking',
    'Split critical CSS for above-the-fold content',
    'Minify and compress CSS',
  ],
  
  fonts: [
    'Use variable fonts to reduce file count',
    'Subset fonts to include only used characters',
    'Use font-display: swap for better UX',
    'Preload critical fonts',
  ],
};

/**
 * Performance budget checker
 * Warns if bundle size exceeds limits
 */
export const performanceBudget = {
  maxBundleSize: 250 * 1024, // 250 KB
  maxChunkSize: 100 * 1024,  // 100 KB per chunk
  maxImageSize: 200 * 1024,  // 200 KB per image
  
  check(actualSize: number, type: 'bundle' | 'chunk' | 'image'): boolean {
    const limits = {
      bundle: this.maxBundleSize,
      chunk: this.maxChunkSize,
      image: this.maxImageSize,
    };
    
    const limit = limits[type];
    if (actualSize > limit) {
      console.warn(
        `[Performance Budget] ${type} size (${(actualSize / 1024).toFixed(2)} KB) ` +
        `exceeds limit (${(limit / 1024).toFixed(2)} KB)`
      );
      return false;
    }
    
    return true;
  },
};
