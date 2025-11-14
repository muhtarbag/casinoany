import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSiteAnalytics } from '@/hooks/useSiteAnalytics';
import { Eye, MousePointerClick, TrendingUp, TrendingDown, Minus, DollarSign, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function SitePerformanceCards() {
  const { data: siteAnalytics, isLoading } = useSiteAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Site Performans Analizi</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-20 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!siteAnalytics || siteAnalytics.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Henüz site verisi bulunmuyor.</p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Site Performans Analizi</h3>
          <p className="text-sm text-muted-foreground">
            {siteAnalytics.length} aktif sitenin detaylı metrikleri
          </p>
        </div>
        <Badge variant="secondary">{siteAnalytics.length} Site</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {siteAnalytics.map((site) => (
          <Card key={site.siteId} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    <AvatarImage src={site.logoUrl || ''} alt={site.siteName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {site.siteName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="text-base font-semibold truncate">
                      {site.siteName}
                    </CardTitle>
                    {site.rating && (
                      <Badge variant="outline" className="mt-1">
                        ⭐ {site.rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(site.trend)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Total Views */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Görüntüleme</span>
                  </div>
                  <p className="text-lg font-bold">{site.totalViews.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    Son 7 gün: {site.last7DaysViews.toLocaleString()}
                  </p>
                </div>

                {/* Total Clicks */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Tıklama</span>
                  </div>
                  <p className="text-lg font-bold">{site.totalClicks.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">CTR: {site.ctr}%</p>
                </div>

                {/* Affiliate Clicks */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Target className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Affiliate</span>
                  </div>
                  <p className="text-lg font-bold text-primary">{site.affiliateClicks.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    Dönüşüm: {site.conversionRate}%
                  </p>
                </div>

                {/* Estimated Revenue */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Gelir</span>
                  </div>
                  <p className="text-lg font-bold text-success">
                    ${site.estimatedRevenue.toFixed(0)}
                  </p>
                  <p className={`text-xs font-medium ${getTrendColor(site.trend)}`}>
                    {site.trend === 'up' && '↗ Yükseliş'}
                    {site.trend === 'down' && '↘ Düşüş'}
                    {site.trend === 'stable' && '→ Sabit'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
