import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/mobile-optimizations.css";
import "./styles/mobile-touch.css";

createRoot(document.getElementById("root")!).render(<App />);

// Dispatch render event for prerendering (SSG optimization)
// This signals that React has finished rendering and the page is ready
if (typeof window !== 'undefined') {
  // Wait for next tick to ensure DOM is fully updated
  setTimeout(() => {
    window.dispatchEvent(new Event('render-event'));
  }, 0);
}
