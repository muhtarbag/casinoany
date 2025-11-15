import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/mobile-optimizations.css";
import { initWebVitalsTracking } from './utils/coreWebVitals';
import { initPerformanceObserver } from './lib/performanceMonitor';
import { initPerformanceOptimizations, requestIdleCallback } from './utils/performanceOptimizations';
import { setupRoutePreloading } from './utils/lazyLoadRoutes';

// CRITICAL FIX: Force single React instance globally to prevent dispatcher null errors
// This must run BEFORE any other code
if (typeof window !== 'undefined') {
  // Check if React is already loaded from different source
  if (window.React && window.React !== React) {
    console.warn('⚠️ Multiple React instances detected - forcing single instance');
  }
  // Set our React as THE global React instance (read-only)
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
