/**
 * Cache Optimization Utilities
 * Advanced caching strategies and helpers
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Deduplicate in-flight requests
 * Automatically handled by React Query, but we can optimize it further
 */
export const deduplicateRequests = (queryClient: QueryClient) => {
  // React Query already deduplicates by default
  // This function is here for documentation purposes
  const cache = queryClient.getQueryCache();
  console.log('Request deduplication is enabled by default in React Query');
  console.log('Total queries in cache:', cache.getAll().length);
};

/**
 * Cache invalidation strategy
 * Smart invalidation based on data relationships
 */
export const invalidateRelatedQueries = async (
  queryClient: QueryClient,
  entity: 'site' | 'blog' | 'news' | 'category',
  action: 'create' | 'update' | 'delete'
) => {
  switch (entity) {
    case 'site':
      await queryClient.invalidateQueries({ queryKey: ['sites'] });
      await queryClient.invalidateQueries({ queryKey: ['site-stats'] });
      break;

    case 'blog':
      await queryClient.invalidateQueries({ queryKey: ['blog'] });
      await queryClient.invalidateQueries({ queryKey: ['blog-stats'] });
      break;

    case 'news':
      await queryClient.invalidateQueries({ queryKey: ['news'] });
      break;

    case 'category':
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      // Also invalidate site lists as they may be filtered by category
      await queryClient.invalidateQueries({ queryKey: ['sites'] });
      break;
  }
};

/**
 * Optimistic update helper
 */
export const optimisticUpdate = <T>(
  queryClient: QueryClient,
  queryKey: any[],
  updater: (old: T) => T
) => {
  const previousData = queryClient.getQueryData<T>(queryKey);

  // Optimistically update
  if (previousData) {
    queryClient.setQueryData<T>(queryKey, updater(previousData));
  }

  return { previousData };
};

/**
 * Revert optimistic update on error
 */
export const revertOptimisticUpdate = <T>(
  queryClient: QueryClient,
  queryKey: any[],
  previousData: T | undefined
) => {
  if (previousData) {
    queryClient.setQueryData<T>(queryKey, previousData);
  }
};

/**
 * Cache preloading for link hover
 */
export const preloadOnLinkHover = (
  queryClient: QueryClient,
  queryKey: any[],
  fetcher: () => Promise<any>
) => {
  // Check if already cached
  const cached = queryClient.getQueryState(queryKey);
  
  // Only prefetch if not cached or stale
  if (!cached || cached.isInvalidated) {
    queryClient.prefetchQuery({
      queryKey,
      queryFn: fetcher,
    });
  }
};

/**
 * Clear old cache entries to free memory
 */
export const clearStaleCache = (queryClient: QueryClient, olderThan: number = 60 * 60 * 1000) => {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();
  
  queries.forEach((query) => {
    const lastUpdated = query.state.dataUpdatedAt;
    const now = Date.now();
    
    if (now - lastUpdated > olderThan) {
      queryClient.removeQueries({ queryKey: query.queryKey });
    }
  });
};

/**
 * Log cache statistics (development only)
 */
export const logCacheStats = (queryClient: QueryClient) => {
  if (import.meta.env.DEV) {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const stats = {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      cachedQueries: queries.filter(q => q.state.data !== undefined).length,
    };
    
    console.log('📊 Query Cache Stats:', stats);
  }
};
