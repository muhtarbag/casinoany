import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

export interface DailyMetric {
  date: string;
  views: number;
  clicks: number;
  affiliateClicks: number;
  revenue: number;
}

export function useSiteDetailedAnalytics(siteId: string | null) {
  return useQuery({
    queryKey: ['site-detailed-analytics', siteId],
    queryFn: async () => {
      if (!siteId) return null;

      const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
      
      // ✅ OPTIMIZED: Single query using aggregation table
      // Replaces 2 separate queries + manual merge with 1 pre-aggregated query
      const { data, error } = await supabase
        .from('analytics_daily_summary')
        .select('metric_date, total_views, total_clicks, affiliate_clicks, estimated_revenue')
        .eq('site_id', siteId)
        .gte('metric_date', thirtyDaysAgo)
        .order('metric_date', { ascending: true });

      if (error) throw error;

      // Create a map of dates for the last 30 days
      const dailyMetrics: Record<string, DailyMetric> = {};
      for (let i = 29; i >= 0; i--) {
        const dateKey = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyMetrics[dateKey] = {
          date: dateKey,
          views: 0,
          clicks: 0,
          affiliateClicks: 0,
          revenue: 0,
        };
      }

      // Fill in actual data from aggregated summary
      data?.forEach(row => {
        if (dailyMetrics[row.metric_date]) {
          dailyMetrics[row.metric_date] = {
            date: row.metric_date,
            views: row.total_views || 0,
            clicks: row.total_clicks || 0,
            affiliateClicks: row.affiliate_clicks || 0,
            revenue: Number(row.estimated_revenue) || 0,
          };
        }
      });

      return Object.values(dailyMetrics);
    },
    enabled: !!siteId,
  });
}
