import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';
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
      // Fetch all active sites
      const { data: sites, error: sitesError } = await supabase
        .from('betting_sites')
        .select('id, name, slug, logo_url, rating, is_active')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (sitesError) throw sitesError;
      if (!sites) return [];

      // Fetch site stats
      const { data: stats } = await supabase
        .from('site_stats')
        .select('site_id, views, clicks');

      // Fetch casino analytics for last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
      const { data: casinoAnalytics } = await supabase
        .from('casino_content_analytics')
        .select('site_id, total_views, affiliate_clicks, view_date')
        .gte('view_date', thirtyDaysAgo);

      // Fetch affiliate metrics for last 30 days
      const { data: affiliateMetrics } = await supabase
        .from('affiliate_metrics')
        .select('site_id, total_views, total_clicks, total_conversions, estimated_revenue, metric_date')
        .gte('metric_date', thirtyDaysAgo);

      // Process data for each site
      const sevenDaysAgo = subDays(new Date(), 7).toISOString().split('T')[0];
      const fourteenDaysAgo = subDays(new Date(), 14).toISOString().split('T')[0];

      const siteAnalytics: SiteAnalytics[] = sites.map(site => {
        // Get site stats
        const siteStats = stats?.find(s => s.site_id === site.id);
        const totalViews = siteStats?.views || 0;
        const totalClicks = siteStats?.clicks || 0;

        // Get casino analytics for this site
        const siteCasinoAnalytics = casinoAnalytics?.filter(ca => ca.site_id === site.id) || [];
        const affiliateClicks = siteCasinoAnalytics.reduce((sum, ca) => sum + (ca.affiliate_clicks || 0), 0);

        // Get last 7 days and previous 7 days data for trend
        const last7DaysData = siteCasinoAnalytics.filter(ca => ca.view_date >= sevenDaysAgo);
        const previous7DaysData = siteCasinoAnalytics.filter(
          ca => ca.view_date >= fourteenDaysAgo && ca.view_date < sevenDaysAgo
        );

        const last7DaysViews = last7DaysData.reduce((sum, ca) => sum + (ca.total_views || 0), 0);
        const previous7DaysViews = previous7DaysData.reduce((sum, ca) => sum + (ca.total_views || 0), 0);
        const last7DaysClicks = last7DaysData.reduce((sum, ca) => sum + (ca.affiliate_clicks || 0), 0);

        // Calculate trend
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (previous7DaysViews > 0) {
          const changePercent = ((last7DaysViews - previous7DaysViews) / previous7DaysViews) * 100;
          if (changePercent > 10) trend = 'up';
          else if (changePercent < -10) trend = 'down';
        } else if (last7DaysViews > 0) {
          trend = 'up';
        }

        // Get affiliate metrics for this site
        const siteAffiliateMetrics = affiliateMetrics?.filter(am => am.site_id === site.id) || [];
        const totalConversions = siteAffiliateMetrics.reduce((sum, am) => sum + (am.total_conversions || 0), 0);
        const estimatedRevenue = siteAffiliateMetrics.reduce((sum, am) => sum + (am.estimated_revenue || 0), 0);

        // Calculate CTR and conversion rate
        const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0';
        const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0';

        return {
          siteId: site.id,
          siteName: site.name,
          siteSlug: site.slug,
          logoUrl: site.logo_url,
          rating: site.rating,
          isActive: site.is_active,
          totalViews,
          totalClicks,
          ctr,
          affiliateClicks,
          estimatedRevenue,
          last7DaysViews,
          last7DaysClicks,
          trend,
          conversionRate,
        };
      });

      // Sort by total views descending
      return siteAnalytics.sort((a, b) => b.totalViews - a.totalViews);
    },
    // STANDARDIZED: Analytics pattern (2 dakika refetch)
    ...QUERY_DEFAULTS.analytics,
  });
}
