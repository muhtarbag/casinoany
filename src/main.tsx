// CRITICAL FIX: Ensure single React instance globally BEFORE any imports
import React from 'react';
if (typeof window !== 'undefined') {
  window.React = React;
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/mobile-optimizations.css";
import { initWebVitalsTracking } from './utils/coreWebVitals';
import { initPerformanceObserver } from './lib/performanceMonitor';
import { initPerformanceOptimizations, requestIdleCallback } from './utils/performanceOptimizations';
import { setupRoutePreloading } from './utils/lazyLoadRoutes';

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
