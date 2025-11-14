import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initWebVitalsTracking } from './utils/coreWebVitals';
import { initPerformanceObserver } from './lib/performanceMonitor';
import { initPerformanceOptimizations } from './utils/performanceOptimizations';

// Initialize Performance Optimizations
initPerformanceOptimizations();

// Initialize Core Web Vitals tracking for SEO
initWebVitalsTracking();

// Initialize Performance Monitoring
initPerformanceObserver();

createRoot(document.getElementById("root")!).render(<App />);
