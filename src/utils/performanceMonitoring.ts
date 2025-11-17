/**
 * Performance Monitoring Utilities
 * Track and optimize runtime performance
 */

interface PerformanceMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

/**
 * Measure Core Web Vitals
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};

  /**
   * Initialize performance monitoring
   */
  init() {
    if (typeof window === 'undefined') return;

    // Measure FCP
    this.measureFCP();
    
    // Measure LCP
    this.measureLCP();
    
    // Measure FID
    this.measureFID();
    
    // Measure CLS
    this.measureCLS();
    
    // Measure TTFB
    this.measureTTFB();
  }

  private measureFCP() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.FCP = entry.startTime;
          this.logMetric('FCP', entry.startTime);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      // Browser doesn't support this API
    }
  }

  private measureLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
      
      this.metrics.LCP = lastEntry.renderTime || lastEntry.loadTime || 0;
      this.logMetric('LCP', this.metrics.LCP);
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Browser doesn't support this API
    }
  }

  private measureFID() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEntry & { processingStart?: number };
        this.metrics.FID = fidEntry.processingStart ? fidEntry.processingStart - entry.startTime : 0;
        this.logMetric('FID', this.metrics.FID);
      }
    });

    try {
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Browser doesn't support this API
    }
  }

  private measureCLS() {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value || 0;
          this.metrics.CLS = clsValue;
          this.logMetric('CLS', clsValue);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Browser doesn't support this API
    }
  }

  private measureTTFB() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.TTFB = navigation.responseStart - navigation.requestStart;
      this.logMetric('TTFB', this.metrics.TTFB);
    }
  }

  private logMetric(name: string, value: number) {
    if (import.meta.env.DEV) {
      const status = this.getMetricStatus(name, value);
      const emoji = status === 'good' ? '✅' : status === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`[Performance] ${emoji} ${name}: ${value.toFixed(2)}ms (${status})`);
    }
  }

  private getMetricStatus(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

/**
 * Track component render time
 */
export function measureComponentRender(componentName: string) {
  if (!import.meta.env.DEV) return () => {};

  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) { // Longer than 1 frame at 60fps
      console.warn(
        `[Performance] Component "${componentName}" took ${renderTime.toFixed(2)}ms to render` +
        ` (threshold: 16ms for 60fps)`
      );
    }
  };
}

/**
 * Detect memory leaks
 */
export function detectMemoryLeaks() {
  if (!import.meta.env.DEV || !('memory' in performance)) return;

  const initialMemory = (performance as any).memory.usedJSHeapSize;
  
  setInterval(() => {
    const currentMemory = (performance as any).memory.usedJSHeapSize;
    const increase = ((currentMemory - initialMemory) / initialMemory) * 100;
    
    if (increase > 50) {
      console.warn(
        `[Memory] Potential memory leak detected! ` +
        `Heap size increased by ${increase.toFixed(2)}%`
      );
    }
  }, 30000); // Check every 30 seconds
}

/**
 * Singleton instance
 */
export const performanceMonitor = new PerformanceMonitor();
