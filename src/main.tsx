// CRITICAL FIX: Ensure single React instance globally BEFORE any imports
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

// Force single React instance globally
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;
  
  // Ensure React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED is consistent
  if (React && (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    (window as any).__REACT_INTERNALS__ = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  }
}

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

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
