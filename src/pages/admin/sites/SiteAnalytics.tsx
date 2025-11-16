import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSiteAnalytics } from '@/hooks/queries/useAnalyticsQueries';
import { SiteAnalyticsCard } from '@/components/analytics/SiteAnalyticsCard';
import { SiteAnalyticsDetailDialog } from '@/components/analytics/SiteAnalyticsDetailDialog';
import { LoadingState } from '@/components/ui/loading-state';
import { subDays, startOfDay } from 'date-fns';
import { BarChart3, TrendingUp, Eye, MousePointer } from 'lucide-react';

type SortOption = 'views' | 'clicks' | 'ctr' | 'revenue';

export default function SiteAnalytics() {
  const [sortBy, setSortBy] = useState<SortOption>('views');
  const [selectedSite, setSelectedSite] = useState<{
    id: string;
    name: string;
    logo: string | null;
    rating: number | null;
  } | null>(null);

  // Last 30 days by default
  const dateRange = useMemo(
    () => ({
      start: startOfDay(subDays(new Date(), 30)),
      end: startOfDay(new Date()),
    }),
    []
  );

  const { data: sites, isLoading } = useSiteAnalytics(dateRange);

  // Sort sites
  const sortedSites = useMemo(() => {
    if (!sites) return [];
    
    const sorted = [...sites].sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.views - a.views;
        case 'clicks':
          return b.clicks - a.clicks;
        case 'ctr':
          return b.ctr - a.ctr;
        case 'revenue':
          return b.revenue - a.revenue;
        default:
          return 0;
      }
    });

    return sorted;
  }, [sites, sortBy]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!sites || sites.length === 0) {
      return {
        totalViews: 0,
        totalClicks: 0,
        avgCTR: 0,
        totalRevenue: 0,
      };
    }

    const totalViews = sites.reduce((sum, site) => sum + site.views, 0);
    const totalClicks = sites.reduce((sum, site) => sum + site.clicks, 0);
    const totalRevenue = sites.reduce((sum, site) => sum + site.revenue, 0);
    const avgCTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return {
      totalViews,
      totalClicks,
      avgCTR,
      totalRevenue,
    };
  }, [sites]);

  if (isLoading) {
    return <LoadingState variant="skeleton" text="Site performans verileri yükleniyor..." rows={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Site Performans Analizi
        </h1>
        <p className="text-muted-foreground mt-2">
          Son 30 günlük detaylı metrikler
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Toplam Görüntülenme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaryStats.totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              Toplam Tıklama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaryStats.totalClicks.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Ortalama CTR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaryStats.avgCTR.toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              💰 Toplam Gelir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">
              ${summaryStats.totalRevenue.toFixed(0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Site Performansı</CardTitle>
              <CardDescription>
                {sortedSites.length} site gösteriliyor
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sıralama:</span>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="views">📊 Görüntülenme</SelectItem>
                    <SelectItem value="clicks">🎯 Tıklama</SelectItem>
                    <SelectItem value="ctr">📈 CTR Oranı</SelectItem>
                    <SelectItem value="revenue">💰 Gelir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm">
                📥 Dışa Aktar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedSites.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Henüz analiz verisi bulunmuyor.</p>
              <p className="text-sm mt-2">Veriler toplanmaya başlandığında burada görünecektir.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedSites.map((site) => (
                <SiteAnalyticsCard
                  key={site.site_id}
                  site={site}
                  onClick={() =>
                    setSelectedSite({
                      id: site.site_id,
                      name: site.site_name,
                      logo: site.logo_url,
                      rating: site.rating,
                    })
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <SiteAnalyticsDetailDialog
        open={!!selectedSite}
        onOpenChange={(open) => !open && setSelectedSite(null)}
        siteId={selectedSite?.id || null}
        siteName={selectedSite?.name || ''}
        logoUrl={selectedSite?.logo || null}
        rating={selectedSite?.rating || null}
        dateRange={dateRange}
      />
    </div>
  );
}
