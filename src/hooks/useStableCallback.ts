import { useRef, useCallback, useEffect } from 'react';

/**
 * STABLE CALLBACK HOOK
 * Creates a stable callback reference that doesn't cause re-renders
 * Use this when you need to pass callbacks to useEffect dependencies
 * 
 * @example
 * const stableHandler = useStableCallback(handleSomething);
 * useEffect(() => {
 *   // Won't cause infinite loops
 *   stableHandler();
 * }, [stableHandler]);
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  // Keep the callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Return a stable function that calls the latest callback
  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    []
  );
}

