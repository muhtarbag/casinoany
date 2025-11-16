import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, format } from 'date-fns';

export interface SiteAnalytics {
  site_id: string;
  site_name: string;
  logo_url: string | null;
  rating: number | null;
  views: number;
  clicks: number;
  ctr: number;
  revenue: number;
  conversions: number;
  affiliate_clicks: number;
  trend_data: Array<{ date: string; views: number; clicks: number }>;
}

export const useSiteAnalytics = (dateRange: { start: Date; end: Date }) => {
  return useQuery({
    queryKey: ['site-analytics', dateRange],
    queryFn: async () => {
      // Fetch affiliate metrics for the date range
      const { data: metrics, error: metricsError } = await supabase
        .from('affiliate_metrics')
        .select(`
          site_id,
          metric_date,
          total_views,
          total_clicks,
          total_conversions,
          estimated_revenue,
          betting_sites!inner(name, logo_url, rating)
        `)
        .gte('metric_date', format(dateRange.start, 'yyyy-MM-dd'))
        .lte('metric_date', format(dateRange.end, 'yyyy-MM-dd'))
        .order('metric_date', { ascending: true });

      if (metricsError) throw metricsError;

      // Fetch conversion data (affiliate clicks)
      const { data: conversions, error: conversionsError } = await supabase
        .from('conversions')
        .select('site_id, conversion_type')
        .eq('conversion_type', 'affiliate_click')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      if (conversionsError) throw conversionsError;

      // Group by site
      const siteMap = new Map<string, SiteAnalytics>();

      metrics?.forEach((metric: any) => {
        const siteId = metric.site_id;
        const siteName = metric.betting_sites?.name || 'Unknown';
        const logoUrl = metric.betting_sites?.logo_url;
        const rating = metric.betting_sites?.rating;

        if (!siteMap.has(siteId)) {
          siteMap.set(siteId, {
            site_id: siteId,
            site_name: siteName,
            logo_url: logoUrl,
            rating: rating,
            views: 0,
            clicks: 0,
            ctr: 0,
            revenue: 0,
            conversions: 0,
            affiliate_clicks: 0,
            trend_data: [],
          });
        }

        const site = siteMap.get(siteId)!;
        site.views += metric.total_views || 0;
        site.clicks += metric.total_clicks || 0;
        site.conversions += metric.total_conversions || 0;
        site.revenue += metric.estimated_revenue || 0;

        // Add to trend data
        site.trend_data.push({
          date: metric.metric_date,
          views: metric.total_views || 0,
          clicks: metric.total_clicks || 0,
        });
      });

      // Add affiliate clicks from conversions
      conversions?.forEach((conv: any) => {
        if (siteMap.has(conv.site_id)) {
          siteMap.get(conv.site_id)!.affiliate_clicks += 1;
        }
      });

      // Calculate CTR
      siteMap.forEach((site) => {
        if (site.views > 0) {
          site.ctr = (site.clicks / site.views) * 100;
        }
      });

      return Array.from(siteMap.values());
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSiteDetailAnalytics = (siteId: string | null, dateRange: { start: Date; end: Date }) => {
  return useQuery({
    queryKey: ['site-detail-analytics', siteId, dateRange],
    queryFn: async () => {
      if (!siteId) return null;

      // Fetch detailed metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('affiliate_metrics')
        .select('*')
        .eq('site_id', siteId)
        .gte('metric_date', format(dateRange.start, 'yyyy-MM-dd'))
        .lte('metric_date', format(dateRange.end, 'yyyy-MM-dd'))
        .order('metric_date', { ascending: true });

      if (metricsError) throw metricsError;

      // Aggregate data
      const totalViews = metrics?.reduce((sum, m) => sum + (m.total_views || 0), 0) || 0;
      const totalClicks = metrics?.reduce((sum, m) => sum + (m.total_clicks || 0), 0) || 0;
      const totalConversions = metrics?.reduce((sum, m) => sum + (m.total_conversions || 0), 0) || 0;
      const totalRevenue = metrics?.reduce((sum, m) => sum + (m.estimated_revenue || 0), 0) || 0;

      // Trend data
      const trendData = metrics?.map((m) => ({
        date: format(new Date(m.metric_date), 'dd MMM'),
        views: m.total_views || 0,
        clicks: m.total_clicks || 0,
        revenue: m.estimated_revenue || 0,
      })) || [];

      return {
        totalViews,
        totalClicks,
        totalConversions,
        totalRevenue,
        ctr: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0,
        trendData,
      };
    },
    enabled: !!siteId,
    staleTime: 5 * 60 * 1000,
  });
};
