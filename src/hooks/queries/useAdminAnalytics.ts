import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

export interface AggregateAnalytics {
  totalViews: number;
  totalClicks: number;
  averageCTR: number;
  totalRevenue: number;
  totalConversions: number;
  activeSiteCount: number;
  revenuePerClick: number;
  conversionRate: number;
  trends: {
    viewsTrend: number;
    clicksTrend: number;
    ctrTrend: number;
    revenueTrend: number;
  };
}

export const useAdminAnalytics = (days: number = 30) => {
  return useQuery({
    queryKey: ['admin-analytics', days],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, days);
      const previousStartDate = subDays(startDate, days);

      // Current period metrics
      const { data: currentMetrics, error: currentError } = await supabase
        .from('affiliate_metrics')
        .select('total_views, total_clicks, total_conversions, estimated_revenue')
        .gte('metric_date', format(startDate, 'yyyy-MM-dd'))
        .lte('metric_date', format(endDate, 'yyyy-MM-dd'));

      if (currentError) throw currentError;

      // Previous period metrics for trend calculation
      const { data: previousMetrics, error: previousError } = await supabase
        .from('affiliate_metrics')
        .select('total_views, total_clicks, total_conversions, estimated_revenue')
        .gte('metric_date', format(previousStartDate, 'yyyy-MM-dd'))
        .lt('metric_date', format(startDate, 'yyyy-MM-dd'));

      if (previousError) throw previousError;

      // Active sites count
      const { count: activeSiteCount, error: siteCountError } = await supabase
        .from('betting_sites')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (siteCountError) throw siteCountError;

      // Calculate current totals
      const totalViews = currentMetrics?.reduce((sum, m) => sum + (m.total_views || 0), 0) || 0;
      const totalClicks = currentMetrics?.reduce((sum, m) => sum + (m.total_clicks || 0), 0) || 0;
      const totalConversions = currentMetrics?.reduce((sum, m) => sum + (m.total_conversions || 0), 0) || 0;
      const totalRevenue = currentMetrics?.reduce((sum, m) => sum + (m.estimated_revenue || 0), 0) || 0;

      const averageCTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
      const revenuePerClick = totalClicks > 0 ? totalRevenue / totalClicks : 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      // Calculate previous totals for trends
      const prevViews = previousMetrics?.reduce((sum, m) => sum + (m.total_views || 0), 0) || 0;
      const prevClicks = previousMetrics?.reduce((sum, m) => sum + (m.total_clicks || 0), 0) || 0;
      const prevRevenue = previousMetrics?.reduce((sum, m) => sum + (m.estimated_revenue || 0), 0) || 0;
      const prevCTR = prevViews > 0 ? (prevClicks / prevViews) * 100 : 0;

      // Calculate trend percentages
      const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const trends = {
        viewsTrend: calculateTrend(totalViews, prevViews),
        clicksTrend: calculateTrend(totalClicks, prevClicks),
        ctrTrend: calculateTrend(averageCTR, prevCTR),
        revenueTrend: calculateTrend(totalRevenue, prevRevenue),
      };

      const analytics: AggregateAnalytics = {
        totalViews,
        totalClicks,
        averageCTR,
        totalRevenue,
        totalConversions,
        activeSiteCount: activeSiteCount || 0,
        revenuePerClick,
        conversionRate,
        trends,
      };

      return analytics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
