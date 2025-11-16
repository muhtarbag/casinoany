import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSiteAnalytics } from '@/hooks/queries/useAnalyticsQueries';
import { SiteAnalyticsDetailDialog } from '@/components/analytics/SiteAnalyticsDetailDialog';
import { BarChart3, TrendingUp, Eye, MousePointer } from 'lucide-react';
import { subDays, startOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export function SitePerformanceSummary() {
  const [selectedSite, setSelectedSite] = useState<{
    id: string;
    name: string;
    logo: string | null;
    rating: number | null;
  } | null>(null);
  
  const dateRange = useMemo(
    () => ({
      start: startOfDay(subDays(new Date(), 30)),
      end: startOfDay(new Date()),
    }),
    []
  );

  const handleSiteClick = (siteId: string, siteName: string, logoUrl: string | null, rating: number | null) => {
    console.log('Site clicked:', siteId, siteName);
    setSelectedSite({
      id: siteId,
      name: siteName,
      logo: logoUrl,
      rating: rating,
    });
  };

  const { data: sites, isLoading } = useSiteAnalytics(dateRange);

  // Get all sites sorted by different metrics
  const sortedSites = useMemo(() => {
    if (!sites) return { byViews: [], byClicks: [], byRevenue: [] };

    return {
      byViews: [...sites].sort((a, b) => b.views - a.views),
      byClicks: [...sites].sort((a, b) => b.clicks - a.clicks),
      byRevenue: [...sites].sort((a, b) => b.revenue - a.revenue),
    };
  }, [sites]);

  const totalStats = useMemo(() => {
    if (!sites) return { views: 0, clicks: 0, ctr: 0, revenue: 0 };

    const totalViews = sites.reduce((sum, s) => sum + s.views, 0);
    const totalClicks = sites.reduce((sum, s) => sum + s.clicks, 0);
    const totalRevenue = sites.reduce((sum, s) => sum + s.revenue, 0);

    return {
      views: totalViews,
      clicks: totalClicks,
      ctr: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0,
      revenue: totalRevenue,
    };
  }, [sites]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Site Performans Analizi
          </CardTitle>
          <CardDescription>Son 30 günlük tüm siteler - detaylı performans özeti</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Toplam Görüntülenme
            </p>
            <p className="text-2xl font-bold">{totalStats.views.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MousePointer className="w-3 h-3" />
              Toplam Tıklama
            </p>
            <p className="text-2xl font-bold">{totalStats.clicks.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Ortalama CTR
            </p>
            <p className="text-2xl font-bold">{totalStats.ctr.toFixed(2)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              💰 Toplam Gelir
            </p>
            <p className="text-2xl font-bold text-success">${totalStats.revenue.toFixed(0)}</p>
          </div>
        </div>

        {/* All Sites by Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* All Sites by Views */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Görüntülenmeye Göre ({sortedSites.byViews.length})</h3>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {sortedSites.byViews.map((site, index) => (
                <div
                  key={site.site_id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => handleSiteClick(site.site_id, site.site_name, site.logo_url, site.rating)}
                >
                  <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                  {site.logo_url ? (
                    <img
                      src={site.logo_url}
                      alt={site.site_name}
                      className="w-8 h-8 rounded object-contain bg-background p-1"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-background flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {site.site_name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{site.site_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {site.views.toLocaleString()} görüntülenme
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Sites by Clicks */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Tıklamaya Göre ({sortedSites.byClicks.length})</h3>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {sortedSites.byClicks.map((site, index) => (
                <div
                  key={site.site_id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => handleSiteClick(site.site_id, site.site_name, site.logo_url, site.rating)}
                >
                  <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                  {site.logo_url ? (
                    <img
                      src={site.logo_url}
                      alt={site.site_name}
                      className="w-8 h-8 rounded object-contain bg-background p-1"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-background flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {site.site_name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{site.site_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {site.clicks.toLocaleString()} tıklama ({site.ctr.toFixed(1)}% CTR)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Sites by Revenue */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">💰</span>
              <h3 className="font-semibold text-sm">Gelire Göre ({sortedSites.byRevenue.length})</h3>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {sortedSites.byRevenue.map((site, index) => (
                <div
                  key={site.site_id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => handleSiteClick(site.site_id, site.site_name, site.logo_url, site.rating)}
                >
                  <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                  {site.logo_url ? (
                    <img
                      src={site.logo_url}
                      alt={site.site_name}
                      className="w-8 h-8 rounded object-contain bg-background p-1"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-background flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {site.site_name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{site.site_name}</p>
                    <p className="text-xs text-success font-semibold">
                      ${site.revenue.toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Detail Dialog */}
      <SiteAnalyticsDetailDialog
        open={!!selectedSite}
        onOpenChange={(open) => {
          console.log('Dialog onOpenChange:', open);
          if (!open) setSelectedSite(null);
        }}
        siteId={selectedSite?.id || null}
        siteName={selectedSite?.name || ''}
        logoUrl={selectedSite?.logo || null}
        rating={selectedSite?.rating || null}
        dateRange={dateRange}
      />
    </Card>
  );
}
