import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initWebVitalsTracking } from './utils/coreWebVitals';
import { initPerformanceObserver } from './lib/performanceMonitor';
import { initPerformanceOptimizations } from './utils/performanceOptimizations';
import { setupRoutePreloading } from './utils/lazyLoadRoutes';

// Initialize Performance Optimizations
initPerformanceOptimizations();

// Initialize Route Preloading
requestIdleCallback(() => {
  setupRoutePreloading();
}, { timeout: 2000 });

// Initialize Core Web Vitals tracking for SEO
initWebVitalsTracking();

// Initialize Performance Monitoring
initPerformanceObserver();

createRoot(document.getElementById("root")!).render(<App />);
