import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { SiteAnalytics } from '@/hooks/queries/useAnalyticsQueries';

interface SiteAnalyticsCardProps {
  site: SiteAnalytics;
  onClick: () => void;
}

export function SiteAnalyticsCard({ site, onClick }: SiteAnalyticsCardProps) {
  const isPositiveTrend = site.ctr > 1; // Simple trend indicator

  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-all duration-200 hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {site.logo_url ? (
              <img 
                src={site.logo_url} 
                alt={site.site_name}
                className="w-12 h-12 rounded-lg object-contain bg-muted p-1"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">
                  {site.site_name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-sm">{site.site_name}</h3>
              {site.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">{site.rating}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant={isPositiveTrend ? "default" : "secondary"} className="text-xs">
            {isPositiveTrend ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {isPositiveTrend ? 'Yükseliş' : 'Sabit'}
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Views */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">📊 Görüntülenme</p>
            <p className="text-lg font-bold">{site.views}</p>
            <p className="text-xs text-muted-foreground">Son 7 gün: {Math.floor(site.views / 7)}/gün</p>
          </div>

          {/* Clicks */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">🎯 Tıklama</p>
            <p className="text-lg font-bold">{site.clicks}</p>
            <p className="text-xs text-muted-foreground">CTR: {site.ctr.toFixed(2)}%</p>
          </div>

          {/* Affiliate */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">💼 Affiliate</p>
            <p className="text-lg font-bold">{site.affiliate_clicks}</p>
            <p className="text-xs text-muted-foreground">
              Dönüşüm: {site.clicks > 0 ? ((site.affiliate_clicks / site.clicks) * 100).toFixed(1) : 0}%
            </p>
          </div>

          {/* Revenue */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">💰 Gelir</p>
            <p className="text-lg font-bold text-success">${site.revenue.toFixed(0)}</p>
            <p className="text-xs text-success">
              {site.ctr > 2 ? '↗ Yükseliş' : site.ctr > 1 ? '→ Sabit' : '↘ Düşüş'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
