import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/mobile-optimizations.css";
import "./styles/mobile-touch.css";
import { setupRoutePreloading } from './utils/lazyLoadRoutes';

// Initialize Route Preloading
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  requestIdleCallback(() => {
    setupRoutePreloading();
  }, { timeout: 2000 });
} else {
  // Fallback for browsers without requestIdleCallback
  setTimeout(() => {
    setupRoutePreloading();
  }, 100);
}

createRoot(document.getElementById("root")!).render(<App />);
