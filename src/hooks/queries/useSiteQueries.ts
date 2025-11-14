import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      let query = (supabase as any)
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
    staleTime: CACHE_TIMES.LONG,
    refetchInterval: REFETCH_INTERVALS.SLOW,
  });
};

// Tek site detay
export const useSite = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.sites.detail(slug),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('betting_sites')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

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
      const { data, error } = await (supabase as any)
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
      const { data, error } = await (supabase as any)
        .from('site_stats_with_details')
        .select('*')
        .order('views', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.MEDIUM,
    refetchInterval: REFETCH_INTERVALS.NORMAL,
  });
};

// Site istatistiği güncelleme
export const useUpdateSiteStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      siteId, 
      type 
    }: { 
      siteId: string; 
      type: 'view' | 'click';
    }) => {
      // Mevcut stats'ı al
      const { data: existingStats } = await (supabase as any)
        .from('site_stats')
        .select('*')
        .eq('site_id', siteId)
        .single();

      if (existingStats) {
        // Güncelle
        const update: any = type === 'view' 
          ? { views: existingStats.views + 1 }
          : { clicks: existingStats.clicks + 1 };

        const { error } = await (supabase as any)
          .from('site_stats')
          .update(update)
          .eq('site_id', siteId);

        if (error) throw error;
      } else {
        // Yeni oluştur
        const insert: any = {
          site_id: siteId,
          views: type === 'view' ? 1 : 0,
          clicks: type === 'click' ? 1 : 0,
        };

        const { error } = await (supabase as any)
          .from('site_stats')
          .insert(insert);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.stats() });
    },
    onError: () => {
      console.error('Site stats güncellenemedi');
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
      console.error('Casino analytics artırılamadı');
    },
  });
};
