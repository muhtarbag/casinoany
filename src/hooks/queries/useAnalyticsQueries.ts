import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, CACHE_TIMES, REFETCH_INTERVALS } from '@/lib/queryClient';

interface DateRange {
  start: Date;
  end: Date;
}

// Analytics dashboard - tüm veriler birlikte
export const useAnalyticsDashboard = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(),
    queryFn: async () => {
      const startDate = dateRange?.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = dateRange?.end || new Date();

      // Tüm sorguları paralel çalıştır
      const [pageViewsRes, eventsRes, conversionsRes, sessionsRes] = await Promise.all([
        (supabase as any)
          .from('page_views')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        (supabase as any)
          .from('user_events')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        (supabase as any)
          .from('conversions')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        (supabase as any)
          .from('analytics_sessions')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
      ]);

      if (pageViewsRes.error) throw pageViewsRes.error;
      if (eventsRes.error) throw eventsRes.error;
      if (conversionsRes.error) throw conversionsRes.error;
      if (sessionsRes.error) throw sessionsRes.error;

      return {
        pageViews: pageViewsRes.data || [],
        events: eventsRes.data || [],
        conversions: conversionsRes.data || [],
        sessions: sessionsRes.data || [],
      };
    },
    staleTime: CACHE_TIMES.SHORT,
    refetchInterval: REFETCH_INTERVALS.NORMAL,
  });
};

// Page views
export const usePageViews = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: queryKeys.analytics.pageViews(dateRange),
    queryFn: async () => {
      let query = (supabase as any)
        .from('page_views')
        .select('*')
        .order('created_at', { ascending: false });

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.SHORT,
  });
};

// User events
export const useUserEvents = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: queryKeys.analytics.userEvents(dateRange),
    queryFn: async () => {
      let query = (supabase as any)
        .from('user_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.SHORT,
  });
};

// Casino content analytics
export const useCasinoTopSites = () => {
  return useQuery({
    queryKey: queryKeys.casino.topSites(),
    queryFn: async () => {
      const { data: analytics, error: analyticsError } = await (supabase as any)
        .from('casino_content_analytics')
        .select('site_id, total_views, affiliate_clicks');

      if (analyticsError) throw analyticsError;

      const { data: sites, error: sitesError } = await (supabase as any)
        .from('betting_sites')
        .select('id, name, slug, logo_url')
        .eq('is_active', true);

      if (sitesError) throw sitesError;

      // Sitelere analytics verilerini ekle ve sırala
      const siteStats = (sites || []).map((site: any) => {
        const siteAnalytics = (analytics || []).filter(
          (a: any) => a.site_id === site.id
        );

        const totalViews = siteAnalytics.reduce(
          (sum: number, a: any) => sum + (a.total_views || 0),
          0
        );
        const totalClicks = siteAnalytics.reduce(
          (sum: number, a: any) => sum + (a.affiliate_clicks || 0),
          0
        );

        return {
          ...site,
          views: totalViews,
          clicks: totalClicks,
          conversion_rate: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0,
        };
      });

      return siteStats
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, 10);
    },
    staleTime: CACHE_TIMES.MEDIUM,
  });
};

// Block interactions stats
export const useCasinoBlockStats = () => {
  return useQuery({
    queryKey: queryKeys.casino.blockStats(),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('casino_content_analytics')
        .select('block_interactions');

      if (error) throw error;

      // Tüm block_interactions'ları birleştir
      const allInteractions: Record<string, number> = {};
      (data || []).forEach((record: any) => {
        if (record.block_interactions) {
          Object.entries(record.block_interactions).forEach(([key, value]) => {
            allInteractions[key] = (allInteractions[key] || 0) + (value as number);
          });
        }
      });

      // Array'e çevir ve sırala
      return Object.entries(allInteractions)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    },
    staleTime: CACHE_TIMES.MEDIUM,
  });
};
