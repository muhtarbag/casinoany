/**
 * Performance Monitoring Service
 * Tracks Web Vitals and custom performance metrics
 */

import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
}

// Web Vitals thresholds
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
  FID: { good: 100, poor: 300 },        // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 },      // Time to First Byte
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
  INP: { good: 200, poor: 500 },        // Interaction to Next Paint
};

class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private navigationTiming: PerformanceNavigationTiming | null = null;

  constructor() {
    if (typeof window === 'undefined') return;

    this.initializeObserver();
    this.trackNavigationTiming();
    this.trackResourceTiming();
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private initializeObserver() {
    if (!('PerformanceObserver' in window)) {
      logger.warn('performance', 'PerformanceObserver not supported');
      return;
    }

    try {
      // Observe LCP
      this.observeMetric('largest-contentful-paint', (entry: PerformanceEntry) => {
        const lcpEntry = entry as PerformanceEntry & { renderTime: number; loadTime: number };
        const value = lcpEntry.renderTime || lcpEntry.loadTime;
        this.reportMetric('LCP', value);
      });

      // Observe FID
      this.observeMetric('first-input', (entry: PerformanceEntry) => {
        const fidEntry = entry as PerformanceEntry & { processingStart: number; startTime: number };
        const value = fidEntry.processingStart - fidEntry.startTime;
        this.reportMetric('FID', value);
      });

      // Observe CLS
      let clsValue = 0;
      this.observeMetric('layout-shift', (entry: PerformanceEntry) => {
        const clsEntry = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
          this.reportMetric('CLS', clsValue);
        }
      });

      // Observe INP (if supported)
      this.observeMetric('event', (entry: PerformanceEntry) => {
        const eventEntry = entry as PerformanceEntry & { duration: number };
        if (eventEntry.duration > 40) { // Only track slow interactions
          this.reportMetric('INP', eventEntry.duration);
        }
      });
    } catch (error) {
      logger.error('performance', 'Failed to initialize PerformanceObserver', error as Error);
    }
  }

  private observeMetric(type: string, callback: (entry: PerformanceEntry) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ type, buffered: true } as PerformanceObserverInit);
    } catch (error) {
      // Some browsers don't support all entry types
      logger.debug('performance', `PerformanceObserver type ${type} not supported`);
    }
  }

  private trackNavigationTiming() {
    if (!('performance' in window)) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (!navigation) return;

        this.navigationTiming = navigation;

        // TTFB
        const ttfb = navigation.responseStart - navigation.requestStart;
        this.reportMetric('TTFB', ttfb);

        // FCP
        const fcp = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcp) {
          this.reportMetric('FCP', fcp.startTime);
        }

        // DOM Content Loaded
        const dcl = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        this.reportMetric('DCL', dcl);

        // Page Load Time
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        this.reportMetric('Load', loadTime);

        // DNS Lookup Time
        const dnsTime = navigation.domainLookupEnd - navigation.domainLookupStart;
        logger.metric('DNS Lookup', dnsTime, { page: window.location.pathname });

        // TCP Connection Time
        const tcpTime = navigation.connectEnd - navigation.connectStart;
        logger.metric('TCP Connection', tcpTime, { page: window.location.pathname });
      }, 0);
    });
  }

  private trackResourceTiming() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Track slow resources (>500ms)
          if (resourceEntry.duration > 500) {
            logger.warn('performance', `Slow resource: ${resourceEntry.name}`, {
              duration: Math.round(resourceEntry.duration),
              type: resourceEntry.initiatorType,
              size: resourceEntry.transferSize,
            });
          }
        });
      });

      resourceObserver.observe({ type: 'resource', buffered: true } as PerformanceObserverInit);
    } catch (error) {
      logger.debug('performance', 'Resource timing not supported');
    }
  }

  private reportMetric(name: string, value: number) {
    const rating = this.getRating(name, value);
    const metric: PerformanceMetric = {
      name,
      value: Math.round(value),
      rating,
    };

    this.metrics.set(name, metric);

    // Log the metric
    logger.metric(name, metric.value, {
      rating,
      page: window.location.pathname,
    });

    // Warn on poor performance
    if (rating === 'poor') {
      logger.warn('performance', `Poor ${name} performance detected`, {
        value: metric.value,
        threshold: THRESHOLDS[name as keyof typeof THRESHOLDS]?.poor,
      });
    }
  }

  // Track custom timing
  mark(name: string) {
    if ('performance' in window && performance.mark) {
      performance.mark(name);
    }
  }

  measure(name: string, startMark: string, endMark?: string) {
    if (!('performance' in window) || !performance.measure) return 0;

    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      
      if (measure) {
        logger.metric(name, Math.round(measure.duration), {
          page: window.location.pathname,
        });
        return measure.duration;
      }
    } catch (error) {
      logger.debug('performance', `Failed to measure ${name}`);
    }

    return 0;
  }

  // Get current metrics
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  // Get specific metric
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  // Track component render time
  trackComponentRender(componentName: string, renderTime: number) {
    if (renderTime > 100) { // Only log slow renders
      logger.warn('performance', `Slow component render: ${componentName}`, {
        renderTime: Math.round(renderTime),
      });
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for testing
export { PerformanceMonitor };
