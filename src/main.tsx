import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initWebVitalsTracking } from './utils/coreWebVitals';
import { initPerformanceObserver } from './lib/performanceMonitor';
import { initPerformanceOptimizations, requestIdleCallback } from './utils/performanceOptimizations';
import { setupRoutePreloading } from './utils/lazyLoadRoutes';

// CRITICAL FIX: Validate single React instance
if (typeof window !== 'undefined' && window.React && window.React !== React) {
  console.error('Multiple React instances detected! This will cause createContext errors.');
}
if (typeof window !== 'undefined') {
  window.React = React;
}

// Initialize Performance Optimizations
initPerformanceOptimizations();

// Initialize Route Preloading with polyfilled requestIdleCallback
requestIdleCallback(() => {
  setupRoutePreloading();
}, { timeout: 2000 });

// Initialize Core Web Vitals tracking for SEO
initWebVitalsTracking();

// Initialize Performance Monitoring
initPerformanceObserver();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
