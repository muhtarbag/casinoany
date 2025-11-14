import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initWebVitalsTracking } from './utils/coreWebVitals';
import { initPerformanceObserver } from './lib/performanceMonitor';

// Initialize Core Web Vitals tracking for SEO
initWebVitalsTracking();

// Initialize Performance Monitoring (Phase 9/10)
initPerformanceObserver();

createRoot(document.getElementById("root")!).render(<App />);
