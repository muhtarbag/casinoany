/**
 * Performance Monitoring & Metrics Collection
 * Phase 9/10: Real-time performance tracking
 */

import { supabase } from '@/integrations/supabase/client';

export interface PerformanceMetric {
  metric_name: string;
  metric_value: number;
  metric_type: 'timing' | 'counter' | 'gauge';
  metadata?: Record<string, any>;
  status?: 'healthy' | 'warning' | 'critical';
}

export interface QueryPerformance {
  query_name: string;
  duration_ms: number;
  table_name: string;
  success: boolean;
  error?: string;
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  INP: { good: 200, needsImprovement: 500 },   // Interaction to Next Paint
};

/**
 * Get status based on metric value and thresholds
 */
const getMetricStatus = (
  value: number, 
  metric: keyof typeof THRESHOLDS
): 'healthy' | 'warning' | 'critical' => {
  const threshold = THRESHOLDS[metric];
  if (value <= threshold.good) return 'healthy';
  if (value <= threshold.needsImprovement) return 'warning';
  return 'critical';
};

/**
 * Track Core Web Vitals
 */
export const trackWebVitals = (metric: {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
}) => {
  const status = metric.rating === 'good' 
    ? 'healthy' 
    : metric.rating === 'needs-improvement' 
    ? 'warning' 
    : 'critical';

  recordMetric({
    metric_name: metric.name,
    metric_value: metric.value,
    metric_type: 'timing',
    status,
    metadata: {
      id: metric.id,
      rating: metric.rating,
      page: window.location.pathname,
    },
  });
};

/**
 * Track LCP (Largest Contentful Paint)
 */
export const trackLCP = (value: number) => {
  recordMetric({
    metric_name: 'LCP',
    metric_value: value,
    metric_type: 'timing',
    status: getMetricStatus(value, 'LCP'),
    metadata: { page: window.location.pathname },
  });
};

/**
 * Track FID (First Input Delay)
 */
export const trackFID = (value: number) => {
  recordMetric({
    metric_name: 'FID',
    metric_value: value,
    metric_type: 'timing',
    status: getMetricStatus(value, 'FID'),
    metadata: { page: window.location.pathname },
  });
};

/**
 * Track CLS (Cumulative Layout Shift)
 */
export const trackCLS = (value: number) => {
  recordMetric({
    metric_name: 'CLS',
    metric_value: value,
    metric_type: 'timing',
    status: getMetricStatus(value, 'CLS'),
    metadata: { page: window.location.pathname },
  });
};

/**
 * Track TTFB (Time to First Byte)
 */
export const trackTTFB = (value: number) => {
  recordMetric({
    metric_name: 'TTFB',
    metric_value: value,
    metric_type: 'timing',
    status: getMetricStatus(value, 'TTFB'),
    metadata: { page: window.location.pathname },
  });
};

/**
 * Track query performance
 */
export const trackQueryPerformance = async (
  queryName: string,
  tableName: string,
  startTime: number
) => {
  const duration = performance.now() - startTime;
  
  await recordMetric({
    metric_name: `query_${queryName}`,
    metric_value: duration,
    metric_type: 'timing',
    status: duration < 1000 ? 'healthy' : duration < 3000 ? 'warning' : 'critical',
    metadata: {
      table: tableName,
      query: queryName,
    },
  });
};

/**
 * Track component render time
 */
export const trackComponentRender = (
  componentName: string,
  renderTime: number
) => {
  recordMetric({
    metric_name: `render_${componentName}`,
    metric_value: renderTime,
    metric_type: 'timing',
    status: renderTime < 16 ? 'healthy' : renderTime < 50 ? 'warning' : 'critical',
    metadata: {
      component: componentName,
      page: window.location.pathname,
    },
  });
};

/**
 * Track memory usage
 */
export const trackMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    
    recordMetric({
      metric_name: 'memory_used',
      metric_value: memory.usedJSHeapSize,
      metric_type: 'gauge',
      status: memory.usedJSHeapSize < memory.jsHeapSizeLimit * 0.8 
        ? 'healthy' 
        : 'warning',
      metadata: {
        total: memory.jsHeapSizeLimit,
        used: memory.usedJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      },
    });
  }
};

/**
 * Track API call performance
 */
export const trackAPICall = async (
  endpoint: string,
  method: string,
  startTime: number,
  status: number
) => {
  const duration = performance.now() - startTime;
  
  await recordMetric({
    metric_name: `api_${method.toLowerCase()}_${endpoint}`,
    metric_value: duration,
    metric_type: 'timing',
    status: status < 400 && duration < 1000 
      ? 'healthy' 
      : status < 500 && duration < 3000 
      ? 'warning' 
      : 'critical',
    metadata: {
      endpoint,
      method,
      status,
    },
  });
};

/**
 * Record metric to database
 */
const recordMetric = async (metric: PerformanceMetric) => {
  try {
    await (supabase as any).rpc('record_health_metric', {
      p_metric_type: metric.metric_type,
      p_metric_name: metric.metric_name,
      p_metric_value: metric.metric_value,
      p_status: metric.status || 'healthy',
      p_metadata: metric.metadata || {},
    });
  } catch (error) {
    // Silent fail - don't break app for monitoring
    console.warn('Failed to record metric:', error);
  }
};

/**
 * Create performance observer for automatic tracking
 */
export const initPerformanceObserver = () => {
  // Track initial page load metrics
  if (window.performance && window.performance.timing) {
    // Wait for page load to complete
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const navigationStart = perfData.navigationStart;
        
        // Track TTFB
        const ttfb = perfData.responseStart - perfData.requestStart;
        if (ttfb > 0) {
          trackTTFB(ttfb);
        }
        
        // Track FCP if available
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find((entry: any) => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          recordMetric({
            metric_name: 'FCP',
            metric_value: fcpEntry.startTime,
            metric_type: 'timing',
            status: getMetricStatus(fcpEntry.startTime, 'FCP'),
            metadata: { page: window.location.pathname },
          });
        }
      }, 0);
    });
  }

  // Track Navigation Timing
  if ('PerformanceObserver' in window) {
    try {
      // Track LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        trackLCP(lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Track FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          trackFID(entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Track CLS
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let clsValue = 0;
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        trackCLS(clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Track long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          recordMetric({
            metric_name: 'long_task',
            metric_value: entry.duration,
            metric_type: 'timing',
            status: 'warning',
            metadata: {
              name: entry.name,
              page: window.location.pathname,
            },
          });
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Performance observer not fully supported');
    }
  }

  // Track memory every 30 seconds
  setInterval(trackMemoryUsage, 30000);
};

/**
 * Measure async operation performance
 */
export const measureAsync = async <T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    recordMetric({
      metric_name: `async_${name}`,
      metric_value: duration,
      metric_type: 'timing',
      status: duration < 1000 ? 'healthy' : duration < 3000 ? 'warning' : 'critical',
      metadata: { operation: name },
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    recordMetric({
      metric_name: `async_${name}`,
      metric_value: duration,
      metric_type: 'timing',
      status: 'critical',
      metadata: { 
        operation: name,
        error: (error as Error).message,
      },
    });
    
    throw error;
  }
};
