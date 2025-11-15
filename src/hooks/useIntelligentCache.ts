import { useCallback } from 'react';
import { queryCache, searchCache, cacheKeys } from '@/lib/intelligentCache';

/**
 * Hook for using intelligent cache in React components
 * Provides type-safe caching with automatic invalidation
 */
export function useIntelligentCache() {
  // Query cache operations
  const getCached = useCallback(<T>(key: string): T | null => {
    return queryCache.get(key) as T | null;
  }, []);

  const setCached = useCallback(<T>(key: string, data: T) => {
    queryCache.set(key, data);
  }, []);

  const invalidate = useCallback((key: string) => {
    queryCache.delete(key);
  }, []);

  const invalidatePattern = useCallback((pattern: RegExp) => {
    return queryCache.invalidatePattern(pattern);
  }, []);

  // Search cache operations
  const getCachedSearch = useCallback(<T>(term: string, context: string): T | null => {
    const key = cacheKeys.search(term, context);
    return searchCache.get(key) as T | null;
  }, []);

  const setCachedSearch = useCallback(<T>(term: string, context: string, data: T) => {
    const key = cacheKeys.search(term, context);
    searchCache.set(key, data);
  }, []);

  // Clear all caches
  const clearAll = useCallback(() => {
    queryCache.clear();
    searchCache.clear();
  }, []);

  // Get cache stats for debugging
  const getStats = useCallback(() => {
    return {
      query: queryCache.getStats(),
      search: searchCache.getStats(),
    };
  }, []);

  return {
    // Query cache
    getCached,
    setCached,
    invalidate,
    invalidatePattern,
    
    // Search cache
    getCachedSearch,
    setCachedSearch,
    
    // Utils
    clearAll,
    getStats,
    
    // Keys generator
    keys: cacheKeys,
  };
}
