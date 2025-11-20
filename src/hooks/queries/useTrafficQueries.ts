import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subDays } from 'date-fns';

// Trafik kaynakları
export const useTrafficSources = (siteId: string, dateRange?: { start: Date; end: Date }) => {
  return useQuery({
    queryKey: ['traffic-sources', siteId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('site_traffic_sources')
        .select('*')
        .eq('site_id', siteId);

      if (dateRange) {
        query = query
          .gte('metric_date', dateRange.start.toISOString().split('T')[0])
          .lte('metric_date', dateRange.end.toISOString().split('T')[0]);
      }

      const { data, error } = await query.order('metric_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!siteId,
  });
};

// Kullanıcı davranış metrikleri
export const useUserBehavior = (siteId: string, dateRange?: { start: Date; end: Date }) => {
  return useQuery({
    queryKey: ['user-behavior', siteId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('site_user_behavior')
        .select('*')
        .eq('site_id', siteId);

      if (dateRange) {
        query = query
          .gte('metric_date', dateRange.start.toISOString().split('T')[0])
          .lte('metric_date', dateRange.end.toISOString().split('T')[0]);
      }

      const { data, error } = await query.order('metric_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!siteId,
  });
};

// Popülerlik metrikleri
export const usePopularityMetrics = (siteId: string) => {
  return useQuery({
    queryKey: ['popularity-metrics', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_popularity_metrics')
        .select('*')
        .eq('site_id', siteId)
        .order('metric_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 dakika
    enabled: !!siteId,
  });
};

// Günün popülerlik metrikleri
export const useTodayPopularity = (siteId: string) => {
  return useQuery({
    queryKey: ['today-popularity', siteId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('site_popularity_metrics')
        .select('*')
        .eq('site_id', siteId)
        .eq('metric_date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    staleTime: 60 * 1000, // 1 dakika
    refetchInterval: 60 * 1000, // Her dakika güncelle
    enabled: !!siteId,
  });
};

// Review highlights
export const useReviewHighlights = (siteId: string) => {
  return useQuery({
    queryKey: ['review-highlights', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_review_highlights')
        .select(`
          *,
          review:review_id (
            id,
            user_id,
            rating,
            comment,
            created_at,
            is_verified,
            profiles:user_id (
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
        .eq('site_id', siteId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!siteId,
  });
};
