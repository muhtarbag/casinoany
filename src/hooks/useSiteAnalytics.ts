import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_DEFAULTS, queryKeys } from '@/lib/queryClient';

export interface SiteAnalytics {
  siteId: string;
  siteName: string;
  siteSlug: string;
  logoUrl: string | null;
  rating: number | null;
  isActive: boolean;
  totalViews: number;
  totalClicks: number;
  ctr: string;
  affiliateClicks: number;
  estimatedRevenue: number;
  last7DaysViews: number;
  last7DaysClicks: number;
  trend: 'up' | 'down' | 'stable';
  conversionRate: string;
}

export function useSiteAnalytics() {
  return useQuery({
    queryKey: [...queryKeys.analytics.all, 'site-analytics'],
    queryFn: async () => {
      // ✅ OPTIMIZED: Single query using pre-computed VIEW
      // Replaces 150+ operations (50 sites × 3 tables) with 1 query
      const { data, error } = await supabase
        .from('site_analytics_view')
        .select('*')
        .order('total_views', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      // Transform data to match interface
      const siteAnalytics: SiteAnalytics[] = data.map((site: any) => {
        // Calculate trend based on view comparison
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (site.previous_7_days_views > 0) {
          const changePercent = ((site.last_7_days_views - site.previous_7_days_views) / site.previous_7_days_views) * 100;
          if (changePercent > 10) trend = 'up';
          else if (changePercent < -10) trend = 'down';
        } else if (site.last_7_days_views > 0) {
          trend = 'up';
        }

        return {
          siteId: site.site_id,
          siteName: site.site_name,
          siteSlug: site.site_slug,
          logoUrl: site.logo_url,
          rating: site.rating,
          isActive: site.is_active,
          totalViews: site.total_views,
          totalClicks: site.total_clicks,
          ctr: site.ctr?.toFixed(2) || '0.00',
          affiliateClicks: site.affiliate_clicks,
          estimatedRevenue: site.estimated_revenue,
          last7DaysViews: site.last_7_days_views,
          last7DaysClicks: site.last_7_days_clicks,
          trend,
          conversionRate: site.conversion_rate?.toFixed(2) || '0.00',
        };
      });

      return siteAnalytics;
    },
    ...QUERY_DEFAULTS.analytics,
  });
}
