/**
 * Centralized Betting Sites Queries
 * All betting site data fetching in one place
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_CONFIG, QUERY_KEYS } from '@/lib/queryConfig';

interface UseSitesOptions {
  isActive?: boolean;
  isFeatured?: boolean;
  limit?: number;
  orderBy?: 'rating' | 'display_order';
}

/**
 * Fetch all active betting sites
 */
export const useBettingSites = (options: UseSitesOptions = {}) => {
  const {
    isActive = true,
    isFeatured,
    limit,
    orderBy = 'display_order',
  } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.bettingSites, 'active', { isActive, isFeatured, limit, orderBy }],
    queryFn: async () => {
      let query = supabase
        .from('betting_sites')
        .select('id, name, logo_url, rating, bonus, features, affiliate_link, slug, email, whatsapp, telegram, twitter, instagram, facebook, youtube, is_active, display_order, review_count, avg_rating');

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      if (isFeatured !== undefined) {
        query = query.eq('is_featured', isFeatured);
      }

      if (orderBy === 'rating') {
        query = query.order('rating', { ascending: false });
      } else {
        query = query.order('display_order', { ascending: true });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    ...QUERY_CONFIG.static, // Static data - sites don't change often
  });
};

/**
 * Fetch featured sites
 */
export const useFeaturedSites = (limit = 3) => {
  return useQuery({
    queryKey: [QUERY_KEYS.featuredSites, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('name, slug, logo_url, rating, bonus, review_count, avg_rating')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    ...QUERY_CONFIG.static,
  });
};

/**
 * Fetch site stats
 */
export const useSiteStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.siteStats],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_stats')
        .select('*')
        .order('views', { ascending: false });

      if (error) throw error;
      return data;
    },
    ...QUERY_CONFIG.dynamic, // Stats change more frequently
  });
};

/**
 * Fetch ad banners by location
 * Uses RPC function for active banners
 */
export const useSiteBanners = (location: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.banners, location],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_active_banner', { 
          p_location: location,
          p_limit: 10 
        });

      if (error) throw error;
      return data || [];
    },
    ...QUERY_CONFIG.static,
  });
};

/**
 * Fetch search history
 */
export const useSearchHistory = (limit = 8) => {
  return useQuery({
    queryKey: [QUERY_KEYS.searchHistory, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_history')
        .select('search_term, search_count')
        .order('search_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    ...QUERY_CONFIG.dynamic,
  });
};
