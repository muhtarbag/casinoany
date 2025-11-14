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
 * Track Core Web Vitals
 */
export const trackWebVitals = (onMetric: VitalHandler) => {
  // Use web-vitals library if available
  if ('PerformanceObserver' in window) {
    // LCP - Largest Contentful Paint
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
      console.warn('LCP observer failed:', e);
    }

    // CLS - Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        onMetric({
          name: 'CLS',
          value: clsValue,
          rating: getRating('CLS', clsValue),
          delta: clsValue,
          id: `cls-${Date.now()}`
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('CLS observer failed:', e);
    }

    // INP - Interaction to Next Paint
    try {
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        const value = lastEntry.processingStart - lastEntry.startTime;
        
        onMetric({
          name: 'INP',
          value,
          rating: getRating('INP', value),
          delta: value,
          id: `inp-${Date.now()}`
        });
      });
      inpObserver.observe({ type: 'event', buffered: true });
    } catch (e) {
      console.warn('INP observer failed:', e);
    }

    // FCP - First Contentful Paint
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
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.warn('FCP observer failed:', e);
    }

    // TTFB - Time to First Byte
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
      console.warn('TTFB measurement failed:', e);
    }
  }
};

/**
 * Send vitals to analytics endpoint
 */
export const sendVitalsToAnalytics = (metric: WebVitalMetric) => {
  // Log for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: `${Math.round(metric.value)}ms`,
      rating: metric.rating,
      id: metric.id
    });
  }

  // Send to analytics (Google Analytics, custom endpoint, etc.)
  try {
    // Example: Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
        metric_rating: metric.rating
      });
    }

    // Example: Custom analytics endpoint
    fetch('/api/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.href,
        timestamp: Date.now()
      })
    }).catch(err => console.warn('Failed to send vitals:', err));
  } catch (error) {
    console.warn('Analytics error:', error);
  }
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
