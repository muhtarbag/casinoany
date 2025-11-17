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

// Site stats
export const useSiteStats = () => {
  return useQuery({
    queryKey: queryKeys.sites.stats(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_stats_with_details')
        .select('*')
        .order('views', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ✅ DÜZELTILDI: Thread-safe UPSERT kullanıyor (race condition yok)
export const useUpdateSiteStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      siteId, 
      type 
    }: { 
      siteId: string; 
      type: 'view' | 'click' | 'email_click' | 'whatsapp_click' | 'telegram_click' | 'twitter_click' | 'instagram_click' | 'facebook_click' | 'youtube_click';
    }) => {
      const { error } = await supabase.rpc('increment_site_stats', {
        p_site_id: siteId,
        p_metric_type: type
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
