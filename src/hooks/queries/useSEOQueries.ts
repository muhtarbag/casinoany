import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// SEO metriklerini getir
export const useSEOMetrics = (siteId: string) => {
  return useQuery({
    queryKey: ['seo-metrics', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_seo_metrics')
        .select('*')
        .eq('site_id', siteId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!siteId,
  });
};

// Site keyword'lerini getir
export const useSiteKeywords = (siteId: string) => {
  return useQuery({
    queryKey: ['site-keywords', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_keywords')
        .select('*')
        .eq('site_id', siteId)
        .order('priority', { ascending: false })
        .order('current_rank', { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000,
    enabled: !!siteId,
  });
};

// SEO skoru hesapla
export const useCalculateSEOScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      const { data, error } = await supabase.rpc('calculate_seo_score', {
        p_site_id: siteId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, siteId) => {
      queryClient.invalidateQueries({ queryKey: ['seo-metrics', siteId] });
      toast.success('SEO skoru hesaplandı');
    },
    onError: () => {
      toast.error('SEO skoru hesaplanamadı');
    },
  });
};

// Keyword ekle/güncelle
export const useUpsertKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyword: any) => {
      const { data, error } = await supabase
        .from('site_keywords')
        .upsert(keyword)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['site-keywords', data.site_id] });
      toast.success('Keyword kaydedildi');
    },
    onError: () => {
      toast.error('Keyword kaydedilemedi');
    },
  });
};
