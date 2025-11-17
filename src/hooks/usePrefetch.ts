/**
 * Data Prefetching Hook
 * Prefetch data before user navigates to improve perceived performance
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PrefetchConfig {
  queryKey: string[];
  queryFn: () => Promise<any>;
  staleTime?: number;
}

/**
 * Prefetch data on hover or focus
 */
export function usePrefetchOnHover(config: PrefetchConfig) {
  const queryClient = useQueryClient();
  const { queryKey, queryFn, staleTime = 5000 } = config;

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime,
    });
  };

  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}

/**
 * Prefetch data when component mounts
 */
export function usePrefetchOnMount(configs: PrefetchConfig[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    configs.forEach(({ queryKey, queryFn, staleTime = 5000 }) => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime,
      });
    });
  }, [queryClient, configs]);
}

/**
 * Prefetch next page data for pagination
 */
export function usePrefetchNextPage(
  currentPage: number,
  hasNextPage: boolean,
  fetchPage: (page: number) => Promise<any>,
  queryKeyPrefix: string[]
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (hasNextPage) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery({
        queryKey: [...queryKeyPrefix, nextPage],
        queryFn: () => fetchPage(nextPage),
        staleTime: 5000,
      });
    }
  }, [currentPage, hasNextPage, fetchPage, queryKeyPrefix, queryClient]);
}
