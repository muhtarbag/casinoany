import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initWebVitalsTracking } from './utils/coreWebVitals';

// Initialize Core Web Vitals tracking for SEO
initWebVitalsTracking();

createRoot(document.getElementById("root")!).render(<App />);
