import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Star } from "lucide-react";

interface SiteStats {
  site_id: string;
  site_name: string;
  total_reviews: number;
  pending_reviews: number;
  approved_reviews: number;
  avg_rating: number;
}

interface SiteStatsGridProps {
  stats: SiteStats[];
  maxItems?: number;
}

export const SiteStatsGrid = memo(function SiteStatsGrid({ stats, maxItems = 6 }: SiteStatsGridProps) {
  const displayStats = useMemo(() => stats.slice(0, maxItems), [stats, maxItems]);

  if (displayStats.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Site İstatistikleri
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayStats.map(stat => (
          <Card key={stat.site_id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {stat.site_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Toplam:</span>
                <span className="font-semibold">{stat.total_reviews}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Onaylı:</span>
                <span className="text-green-600">{stat.approved_reviews}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bekleyen:</span>
                <span className="text-yellow-600">{stat.pending_reviews}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Ort. Puan:</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{stat.avg_rating.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});
