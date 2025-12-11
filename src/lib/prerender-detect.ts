/**
 * Prerender Detection Utility
 * Helps components detect if they're being prerendered for SSG
 */

export function isPrerendering(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if we're in prerender mode
  return !!(window as any).__PRERENDER_INJECTED?.prerendered;
}

/**
 * Hook to conditionally render content based on prerender status
 * Useful for skipping heavy computations during prerendering
 */
export function usePrerender() {
  return isPrerendering();
}
