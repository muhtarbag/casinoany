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
      
      // Fetch casino analytics for last 30 days
      const { data: casinoAnalytics } = await supabase
        .from('casino_content_analytics')
        .select('view_date, total_views, affiliate_clicks')
        .eq('site_id', siteId)
        .gte('view_date', thirtyDaysAgo)
        .order('view_date', { ascending: true });

      // Fetch affiliate metrics for last 30 days
      const { data: affiliateMetrics } = await supabase
        .from('affiliate_metrics')
        .select('metric_date, total_clicks, estimated_revenue')
        .eq('site_id', siteId)
        .gte('metric_date', thirtyDaysAgo)
        .order('metric_date', { ascending: true });

      // Create a map of dates for the last 30 days with full date for filtering
      const dailyMetrics: Record<string, DailyMetric> = {};
      for (let i = 29; i >= 0; i--) {
        const dateKey = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyMetrics[dateKey] = {
          date: dateKey, // Store full date for filtering
          views: 0,
          clicks: 0,
          affiliateClicks: 0,
          revenue: 0,
        };
      }

      // Merge casino analytics
      casinoAnalytics?.forEach(ca => {
        if (dailyMetrics[ca.view_date]) {
          dailyMetrics[ca.view_date].views = ca.total_views || 0;
          dailyMetrics[ca.view_date].affiliateClicks = ca.affiliate_clicks || 0;
        }
      });

      // Merge affiliate metrics
      affiliateMetrics?.forEach(am => {
        if (dailyMetrics[am.metric_date]) {
          dailyMetrics[am.metric_date].clicks = am.total_clicks || 0;
          dailyMetrics[am.metric_date].revenue = am.estimated_revenue || 0;
        }
      });

      return Object.values(dailyMetrics);
    },
    enabled: !!siteId,
  });
}
