/**
 * Query Prefetching Utilities
 * Intelligent prefetching for better user experience
 */

import { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, CACHE_TIMES } from '@/lib/queryClient';

/**
 * Prefetch critical data on app load
 */
export const prefetchCriticalData = async (queryClient: QueryClient) => {
  // Prefetch featured sites (shown on homepage)
  await queryClient.prefetchQuery({
    queryKey: queryKeys.sites.featured(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.VERY_LONG,
  });

  // Prefetch active sites list (commonly accessed)
  await queryClient.prefetchQuery({
    queryKey: queryKeys.sites.list({ isActive: true }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.VERY_LONG,
  });

  // Prefetch categories (used in navigation)
  await queryClient.prefetchQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.VERY_LONG,
  });
};

/**
 * Prefetch data for specific route
 */
export const prefetchForRoute = async (
  queryClient: QueryClient,
  route: string
) => {
  // Homepage
  if (route === '/' || route === '/index') {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.sites.featured(),
      queryFn: async () => {
        const { data } = await supabase
          .from('betting_sites')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('rating', { ascending: false })
          .limit(6);
        return data || [];
      },
    });
  }

  // Blog page
  if (route === '/blog') {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blog.list({ isPublished: true, limit: 10 }),
      queryFn: async () => {
        const { data } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(10);
        return data || [];
      },
    });
  }

  // Casino sites page
  if (route === '/casino-siteleri') {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.sites.list({ isActive: true }),
      queryFn: async () => {
        const { data } = await supabase
          .from('betting_sites')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        return data || [];
      },
    });
  }
};

/**
 * Warm up cache with most accessed data
 */
export const warmUpCache = async (queryClient: QueryClient) => {
  try {
    // Run prefetch in background without blocking
    Promise.all([
      prefetchCriticalData(queryClient),
      // Add more prefetch calls as needed
    ]).catch(() => {
      // Silent fail - prefetching is not critical
    });
  } catch (error) {
    // Silent fail - prefetching is not critical
  }
};

/**
 * Prefetch next page in pagination
 */
export const prefetchNextPage = async (
  queryClient: QueryClient,
  queryKey: any[],
  currentPage: number,
  pageSize: number,
  fetcher: (page: number) => Promise<any>
) => {
  const nextPageKey = [...queryKey, currentPage + 1];
  
  await queryClient.prefetchQuery({
    queryKey: nextPageKey,
    queryFn: () => fetcher(currentPage + 1),
    staleTime: CACHE_TIMES.MEDIUM,
  });
};

/**
 * Optimistic cache warming on hover
 */
export const prefetchOnHover = (
  queryClient: QueryClient,
  queryKey: any[],
  fetcher: () => Promise<any>
) => {
  // Only prefetch if not already cached
  const cachedData = queryClient.getQueryData(queryKey);
  if (cachedData) return;

  queryClient.prefetchQuery({
    queryKey,
    queryFn: fetcher,
    staleTime: CACHE_TIMES.MEDIUM,
  });
};
