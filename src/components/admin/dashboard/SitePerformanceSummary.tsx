import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSiteAnalytics } from '@/hooks/queries/useAnalyticsQueries';
import { BarChart3, TrendingUp, Eye, MousePointer, ArrowRight } from 'lucide-react';
import { subDays, startOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export function SitePerformanceSummary() {
  const navigate = useNavigate();
  
  const dateRange = useMemo(
    () => ({
      start: startOfDay(subDays(new Date(), 30)),
      end: startOfDay(new Date()),
    }),
    []
  );

  const { data: sites, isLoading } = useSiteAnalytics(dateRange);

  // Get top 3 sites by different metrics
  const topSites = useMemo(() => {
    if (!sites) return { byViews: [], byClicks: [], byRevenue: [] };

    return {
      byViews: [...sites].sort((a, b) => b.views - a.views).slice(0, 3),
      byClicks: [...sites].sort((a, b) => b.clicks - a.clicks).slice(0, 3),
      byRevenue: [...sites].sort((a, b) => b.revenue - a.revenue).slice(0, 3),
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
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Site Performans Analizi
            </CardTitle>
            <CardDescription>Son 30 günlük performans özeti</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/admin/sites?tab=analytics')}
            className="gap-2"
          >
            Tümünü Gör
            <ArrowRight className="w-4 h-4" />
          </Button>
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

        {/* Top Performers */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Top by Views */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">En Çok Görüntülenen</h3>
            </div>
            <div className="space-y-2">
              {topSites.byViews.map((site, index) => (
                <div
                  key={site.site_id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
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

          {/* Top by Clicks */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">En Çok Tıklanan</h3>
            </div>
            <div className="space-y-2">
              {topSites.byClicks.map((site, index) => (
                <div
                  key={site.site_id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
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

          {/* Top by Revenue */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">💰</span>
              <h3 className="font-semibold text-sm">En Yüksek Gelir</h3>
            </div>
            <div className="space-y-2">
              {topSites.byRevenue.map((site, index) => (
                <div
                  key={site.site_id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
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
    </Card>
  );
}
