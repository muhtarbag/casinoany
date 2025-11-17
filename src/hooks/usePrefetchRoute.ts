/**
 * Route Prefetching Hook
 * Intelligently prefetches route data on hover to improve perceived performance
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, CACHE_TIMES } from '@/lib/queryClient';
import { devLogger } from '@/lib/devLogger';

interface PrefetchOptions {
  delay?: number; // Delay before prefetching (ms)
  enabled?: boolean; // Enable/disable prefetching
}

/**
 * Hook to prefetch site detail data on hover
 */
export function usePrefetchSiteDetail(siteSlug: string | undefined, options: PrefetchOptions = {}) {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<number>();
  const { delay = 200, enabled = true } = options;

  const prefetch = useCallback(() => {
    if (!enabled || !siteSlug) return;

    // Clear any pending prefetch
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Delay prefetch to avoid excessive requests on quick mouse movements
    timeoutRef.current = setTimeout(() => {
      // Check if already cached
      const cachedData = queryClient.getQueryData(queryKeys.sites.detail(siteSlug));
      if (cachedData) {
        devLogger.prefetch(siteSlug, 'cached');
        return;
      }

      devLogger.prefetch(siteSlug, 'start');

      // Prefetch site detail
      queryClient.prefetchQuery({
        queryKey: queryKeys.sites.detail(siteSlug),
        queryFn: async () => {
          const { data, error } = await supabase
            .from('betting_sites')
            .select('*')
            .eq('slug', siteSlug)
            .single();

          if (error) throw error;
          return data;
        },
        staleTime: CACHE_TIMES.VERY_LONG,
      });

      // Prefetch site reviews
      queryClient.prefetchQuery({
        queryKey: ['site-reviews', siteSlug],
        queryFn: async () => {
          const { data: site } = await supabase
            .from('betting_sites')
            .select('id')
            .eq('slug', siteSlug)
            .single();

          if (!site) return [];

          const { data, error } = await supabase
            .from('site_reviews')
            .select('*')
            .eq('site_id', site.id)
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) throw error;
          return data || [];
        },
        staleTime: CACHE_TIMES.MEDIUM,
      });
    }, delay) as unknown as number;
  }, [queryClient, siteSlug, delay, enabled]);

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { prefetch, cancelPrefetch };
}

/**
 * Hook to prefetch blog post data on hover
 */
export function usePrefetchBlogPost(postSlug: string | undefined, options: PrefetchOptions = {}) {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<number>();
  const { delay = 200, enabled = true } = options;

  const prefetch = useCallback(() => {
    if (!enabled || !postSlug) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const cachedData = queryClient.getQueryData(['blog-post', postSlug]);
      if (cachedData) return;

      devLogger.prefetch(postSlug, 'start');

      queryClient.prefetchQuery({
        queryKey: ['blog-post', postSlug],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', postSlug)
            .eq('is_published', true)
            .single();

          if (error) throw error;
          return data;
        },
        staleTime: CACHE_TIMES.MEDIUM,
      });
    }, delay) as unknown as number;
  }, [queryClient, postSlug, delay, enabled]);

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { prefetch, cancelPrefetch };
}

/**
 * Hook to prefetch category data on hover
 */
export function usePrefetchCategory(categorySlug: string | undefined, options: PrefetchOptions = {}) {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<number>();
  const { delay = 200, enabled = true } = options;

  const prefetch = useCallback(() => {
    if (!enabled || !categorySlug) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const cachedData = queryClient.getQueryData(['category', categorySlug]);
      if (cachedData) return;

      devLogger.prefetch(categorySlug, 'start');

      queryClient.prefetchQuery({
        queryKey: ['category', categorySlug],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', categorySlug)
            .eq('is_active', true)
            .single();

          if (error) throw error;
          return data;
        },
        staleTime: CACHE_TIMES.VERY_LONG,
      });

      // Also prefetch sites in this category
      queryClient.prefetchQuery({
        queryKey: ['category-sites', categorySlug],
        queryFn: async () => {
          const { data: category } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single();

          if (!category) return [];

          const { data, error } = await supabase
            .from('site_categories')
            .select('site_id, betting_sites(*)')
            .eq('category_id', category.id)
            .limit(20);

          if (error) throw error;
          return data || [];
        },
        staleTime: CACHE_TIMES.LONG,
      });
    }, delay) as unknown as number;
  }, [queryClient, categorySlug, delay, enabled]);

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { prefetch, cancelPrefetch };
}
