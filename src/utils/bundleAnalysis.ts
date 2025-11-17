/**
 * Bundle Size Analysis and Optimization Utilities
 * Development-only tools to identify large imports
 */

/**
 * Log component render times in development
 */
export const measureRenderTime = (componentName: string) => {
  if (import.meta.env.DEV) {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      if (duration > 16) { // More than one frame (60fps)
        console.warn(
          `⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`
        );
      }
    };
  }
  
  return () => {}; // No-op in production
};

/**
 * Analyze bundle size by measuring import times
 */
export const measureImportTime = async (
  importFn: () => Promise<any>,
  moduleName: string
) => {
  if (import.meta.env.DEV) {
    const start = performance.now();
    const module = await importFn();
    const duration = performance.now() - start;
    
    if (duration > 100) {
      console.warn(
        `⚠️ Slow import: ${moduleName} took ${duration.toFixed(2)}ms to load`
      );
    }
    
    return module;
  }
  
  return importFn();
};

/**
 * Tree-shaking optimization hints
 * These are dead code that helps webpack/vite identify unused exports
 */
export const optimizationHints = {
  // Mark heavy libraries for code splitting
  heavyLibraries: [
    'react-quill',
    'recharts',
    '@radix-ui',
  ],
  
  // Suggest lazy loading for these components
  heavyComponents: [
    'RichTextEditor',
    'BlogManagement',
    'CasinoContentEditor',
    'EnhancedReviewManagement',
  ],
  
  // Routes that should be split
  splitRoutes: [
    'admin/*',
    'panel/*',
    'profile/*',
  ],
};

/**
 * Memory leak detection
 */
export const detectMemoryLeaks = () => {
  if (import.meta.env.DEV && 'memory' in performance) {
    const memory = (performance as any).memory;
    const usedJSHeapSize = memory.usedJSHeapSize / 1048576; // Convert to MB
    
    if (usedJSHeapSize > 100) {
      console.warn(
        `⚠️ High memory usage: ${usedJSHeapSize.toFixed(2)}MB`
      );
    }
  }
};

// Run memory leak detection every 30 seconds in development
if (import.meta.env.DEV) {
  setInterval(detectMemoryLeaks, 30000);
}
