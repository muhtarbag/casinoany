// CRITICAL FIX: Ensure single React instance globally BEFORE any imports
import React from 'react';
if (typeof window !== 'undefined') {
  window.React = React;
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/mobile-optimizations.css";
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
