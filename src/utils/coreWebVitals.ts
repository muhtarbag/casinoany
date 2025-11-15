/**
 * Core Web Vitals Monitoring for iGaming Platform
 * Tracks LCP, CLS, INP, FCP, TTFB for SEO optimization
 */

interface WebVitalMetric {
  name: 'LCP' | 'CLS' | 'INP' | 'FCP' | 'TTFB' | 'FID';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

type VitalHandler = (metric: WebVitalMetric) => void;

/**
 * Rating thresholds based on Google's Core Web Vitals
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },  // Largest Contentful Paint
  CLS: { good: 0.1, poor: 0.25 },   // Cumulative Layout Shift
  INP: { good: 200, poor: 500 },     // Interaction to Next Paint
  FCP: { good: 1800, poor: 3000 },   // First Contentful Paint
  TTFB: { good: 800, poor: 1800 },   // Time to First Byte
  FID: { good: 100, poor: 300 }      // First Input Delay (deprecated, use INP)
};

/**
 * Get rating based on metric value and thresholds
 */
const getRating = (
  name: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

/**
 * Track Core Web Vitals - Optimized version
 */
export const trackWebVitals = (onMetric: VitalHandler) => {
  if (!('PerformanceObserver' in window)) return;

  // Debounce mechanism to prevent excessive tracking
  const debounce = (fn: Function, delay: number) => {
    let timeoutId: number;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => fn(...args), delay);
    };
  };

  // LCP - Largest Contentful Paint (optimized)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const value = lastEntry.startTime;
      
      onMetric({
        name: 'LCP',
        value,
        rating: getRating('LCP', value),
        delta: value,
        id: `lcp-${Date.now()}`
      });
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    // Silently fail in production
    if (process.env.NODE_ENV === 'development') {
      console.warn('LCP observer failed:', e);
    }
  }

  // CLS - Cumulative Layout Shift (debounced)
  try {
    let clsValue = 0;
    const debouncedCLS = debounce((value: number) => {
      onMetric({
        name: 'CLS',
        value,
        rating: getRating('CLS', value),
        delta: value,
        id: `cls-${Date.now()}`
      });
    }, 500);

    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      debouncedCLS(clsValue);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('CLS observer failed:', e);
    }
  }

  // INP - Interaction to Next Paint (optimized)
  try {
    let maxINP = 0;
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const inp = (entry as any).duration || 0;
        if (inp > maxINP && inp > 40) { // Only track significant interactions
          maxINP = inp;
          onMetric({
            name: 'INP',
            value: inp,
            rating: getRating('INP', inp),
            delta: inp,
            id: `inp-${Date.now()}`
          });
        }
      }
    });
    inpObserver.observe({ type: 'event', buffered: true });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('INP observer failed:', e);
    }
  }

  // FCP - First Contentful Paint (once only)
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];
      const value = firstEntry.startTime;
      
      onMetric({
        name: 'FCP',
        value,
        rating: getRating('FCP', value),
        delta: value,
        id: `fcp-${Date.now()}`
      });
      
      fcpObserver.disconnect(); // Disconnect after first paint
    });
    fcpObserver.observe({ type: 'paint', buffered: true });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('FCP observer failed:', e);
    }
  }

  // TTFB - Time to First Byte (once only)
  try {
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    if (navigation) {
      const value = navigation.responseStart - navigation.requestStart;
      
      onMetric({
        name: 'TTFB',
        value,
        rating: getRating('TTFB', value),
        delta: value,
        id: `ttfb-${Date.now()}`
      });
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('TTFB measurement failed:', e);
    }
  }
};

/**
 * Send vitals to database - Throttled to prevent excessive calls
 */
import { trackWebVitals as recordWebVital } from '@/lib/performanceMonitor';

// Throttle metrics per page - only send once per metric per page
const sentMetrics = new Set<string>();
let currentPage = '';

export const sendVitalsToAnalytics = (metric: WebVitalMetric) => {
  // Reset on page change
  const pagePath = window.location.pathname;
  if (pagePath !== currentPage) {
    sentMetrics.clear();
    currentPage = pagePath;
  }

  // Only send each metric once per page
  const metricKey = `${metric.name}-${pagePath}`;
  if (sentMetrics.has(metricKey)) {
    return;
  }
  sentMetrics.add(metricKey);

  // Log for development only
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: `${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'}`,
      rating: metric.rating
    });
  }

  // Send to performance monitor for database recording
  recordWebVital({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id
  });
};

/**
 * Initialize Core Web Vitals tracking
 */
export const initWebVitalsTracking = () => {
  if (typeof window !== 'undefined') {
    trackWebVitals(sendVitalsToAnalytics);
  }
};

/**
 * Get performance summary
 */
export const getPerformanceSummary = (): {
  lcp?: number;
  cls?: number;
  inp?: number;
  fcp?: number;
  ttfb?: number;
} => {
  const summary: any = {};

  try {
    // LCP
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      summary.lcp = lcpEntries[lcpEntries.length - 1].startTime;
    }

    // Navigation timing for TTFB
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    if (navigation) {
      summary.ttfb = navigation.responseStart - navigation.requestStart;
    }

    // Paint timing for FCP
    const paintEntries = performance.getEntriesByName('first-contentful-paint');
    if (paintEntries.length > 0) {
      summary.fcp = paintEntries[0].startTime;
    }
  } catch (error) {
    console.warn('Failed to get performance summary:', error);
  }

  return summary;
};

/**
 * Diagnostic: Check for performance issues
 */
export const diagnosePerformanceIssues = (): string[] => {
  const issues: string[] = [];
  const summary = getPerformanceSummary();

  if (summary.lcp && summary.lcp > THRESHOLDS.LCP.poor) {
    issues.push('LCP too slow: Optimize images, reduce render-blocking resources');
  }

  if (summary.ttfb && summary.ttfb > THRESHOLDS.TTFB.poor) {
    issues.push('TTFB too slow: Check server response time, CDN configuration');
  }

  if (summary.fcp && summary.fcp > THRESHOLDS.FCP.poor) {
    issues.push('FCP too slow: Reduce JavaScript execution time, inline critical CSS');
  }

  return issues;
};
