import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTodayPopularity } from '@/hooks/queries/useTrafficQueries';
import { TrendingUp, Users, Eye, MousePointer, UserPlus, Flame } from 'lucide-react';

interface PopularityMetricsCardProps {
  siteId: string;
}

export const PopularityMetricsCard = ({ siteId }: PopularityMetricsCardProps) => {
  const { data: popularity, isLoading } = useTodayPopularity(siteId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Canlı İstatistikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Canlı İstatistikler
            </CardTitle>
            <CardDescription>Bugünün performansı</CardDescription>
          </div>
          <div className="flex gap-2">
            {popularity?.is_trending && (
              <Badge variant="default" className="bg-red-500">
                <Flame className="h-3 w-3 mr-1" />
                Trend
              </Badge>
            )}
            {popularity?.is_rising_star && (
              <Badge variant="secondary">
                <TrendingUp className="h-3 w-3 mr-1" />
                Yükselen
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Şu Anda Aktif */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Şu Anda Aktif</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {popularity?.active_users_now || 0}
            </div>
          </div>

          {/* Bugünkü Görüntülemeler */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Bugünkü Görüntülemeler</span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {popularity?.views_today?.toLocaleString() || 0}
            </div>
          </div>

          {/* Bugünkü Tıklamalar */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Bugünkü Tıklamalar</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {popularity?.clicks_today?.toLocaleString() || 0}
            </div>
          </div>

          {/* Bugünkü Kayıtlar */}
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-muted-foreground">Bugünkü Kayıtlar</span>
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {popularity?.registrations_today || 0}
            </div>
          </div>
        </div>

        {/* Popülerlik Skoru */}
        {popularity?.popularity_score && (
          <div className="mt-4 pt-4 border-t text-center">
            <div className="text-sm text-muted-foreground mb-2">Popülerlik Skoru</div>
            <div className="text-4xl font-bold text-primary">
              {popularity.popularity_score.toFixed(1)}
            </div>
            {popularity.category_rank && (
              <div className="text-sm text-muted-foreground mt-2">
                Kategoride #{popularity.category_rank}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
