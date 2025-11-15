import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/mobile-optimizations.css";
import { initWebVitalsTracking } from './utils/coreWebVitals';
import { initPerformanceObserver } from './lib/performanceMonitor';
import { initPerformanceOptimizations, requestIdleCallback } from './utils/performanceOptimizations';
import { setupRoutePreloading } from './utils/lazyLoadRoutes';

// CRITICAL FIX: Ensure single React instance globally
if (typeof window !== 'undefined') {
  if (window.React && window.React !== React) {
    console.error('❌ Multiple React instances detected! Forcing single instance...');
  }
  window.React = React;
  window.ReactDOM = { ...window.ReactDOM }; // Preserve ReactDOM reference
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
