import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TypedDB } from '@/lib/supabase-extended';
import { queryKeys, CACHE_TIMES, REFETCH_INTERVALS } from '@/lib/queryClient';
import { toast } from 'sonner';

// Sites listesi
export const useSites = (filters?: {
  isActive?: boolean;
  isFeatured?: boolean;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.sites.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('betting_sites')
        .select('*')
        .order('display_order', { ascending: true });

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - sites rarely change
  });
};

// Tek site detay - normalized tables ile
export const useSite = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.sites.detail(slug),
    queryFn: async () => {
      const { data, error } = await TypedDB.bettingSiteBySlug(slug);

      if (error) throw error;
      return data;
    },
    staleTime: CACHE_TIMES.VERY_LONG,
    enabled: !!slug,
  });
};

// Featured sites
export const useFeaturedSites = () => {
  return useQuery({
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
};

// ✅ FIXED: Site stats combining site_stats + conversions tables
export const useSiteStats = () => {
  return useQuery({
    queryKey: queryKeys.sites.stats(),
    queryFn: async () => {
      // Get all sites with their site_stats data
      const { data: sites, error: sitesError } = await supabase
        .from('betting_sites')
        .select('id, name, slug')
        .eq('is_active', true);

      if (sitesError) throw sitesError;

      // Get site_stats (views and clicks)
      const { data: siteStats, error: statsError } = await supabase
        .from('site_stats')
        .select('site_id, views, clicks');

      if (statsError) throw statsError;

      // Get conversions for social media clicks
      const { data: conversions, error: convError } = await supabase
        .from('conversions')
        .select('site_id, conversion_type')
        .in('conversion_type', [
          'affiliate_click',
          'email_click',
          'whatsapp_click',
          'telegram_click',
          'twitter_click',
          'instagram_click',
          'facebook_click',
          'youtube_click'
        ]);

      if (convError) throw convError;

      // Create stats map
      const statsMap = new Map<string, {
        site_id: string;
        site_name: string;
        site_slug: string;
        views: number;
        clicks: number;
        email_clicks: number;
        whatsapp_clicks: number;
        telegram_clicks: number;
        twitter_clicks: number;
        instagram_clicks: number;
        facebook_clicks: number;
        youtube_clicks: number;
      }>();

      // Initialize all sites
      sites.forEach(site => {
        const siteStat = siteStats?.find(s => s.site_id === site.id);
        statsMap.set(site.id, {
          site_id: site.id,
          site_name: site.name,
          site_slug: site.slug,
          views: siteStat?.views || 0,
          clicks: siteStat?.clicks || 0,
          email_clicks: 0,
          whatsapp_clicks: 0,
          telegram_clicks: 0,
          twitter_clicks: 0,
          instagram_clicks: 0,
          facebook_clicks: 0,
          youtube_clicks: 0,
        });
      });

      // Add conversion counts (social media + additional affiliate clicks)
      conversions?.forEach(conv => {
        if (!conv.site_id) return;
        const stats = statsMap.get(conv.site_id);
        if (!stats) return;

        switch (conv.conversion_type) {
          case 'affiliate_click':
            stats.clicks++;
            break;
          case 'email_click':
            stats.email_clicks++;
            break;
          case 'whatsapp_click':
            stats.whatsapp_clicks++;
            break;
          case 'telegram_click':
            stats.telegram_clicks++;
            break;
          case 'twitter_click':
            stats.twitter_clicks++;
            break;
          case 'instagram_click':
            stats.instagram_clicks++;
            break;
          case 'facebook_click':
            stats.facebook_clicks++;
            break;
          case 'youtube_click':
            stats.youtube_clicks++;
            break;
        }
      });

      const result = Array.from(statsMap.values())
        .sort((a, b) => b.views - a.views);

      return result;
    },
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
  });
};

// ✅ FIXED: Track using conversions table
export const useUpdateSiteStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      siteId, 
      type 
    }: { 
      siteId: string; 
      type: 'page_view' | 'affiliate_click' | 'email_click' | 'whatsapp_click' | 'telegram_click' | 'twitter_click' | 'instagram_click' | 'facebook_click' | 'youtube_click';
    }) => {
      const sessionId = sessionStorage.getItem('analytics_session_id') || `session_${Date.now()}`;
      
      const { error } = await supabase.rpc('track_conversion', {
        p_conversion_type: type,
        p_page_path: window.location.pathname,
        p_site_id: siteId,
        p_conversion_value: 0,
        p_session_id: sessionId,
        p_metadata: {},
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.stats() });
    },
    onError: () => {
      // Silent fail for analytics
    },
  });
};

// Casino analytics artırma
export const useIncrementCasinoAnalytics = () => {
  return useMutation({
    mutationFn: async ({
      siteId,
      blockName,
      isAffiliateClick,
    }: {
      siteId: string;
      blockName?: string;
      isAffiliateClick?: boolean;
    }) => {
      const { error } = await (supabase as any)
        .rpc('increment_casino_analytics', {
          p_site_id: siteId,
          p_block_name: blockName || null,
          p_is_affiliate_click: isAffiliateClick || false,
        });

      if (error) throw error;
    },
    onError: () => {
      // Silent fail for analytics
    },
  });
};
