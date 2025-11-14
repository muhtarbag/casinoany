/**
 * Notification Stats Component
 * Displays statistics cards for notification performance
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, MousePointer, X, TrendingUp } from 'lucide-react';
import { useAllNotificationStats } from './hooks/useNotificationStats';
import { Skeleton } from '@/components/ui/skeleton';

export function NotificationStats() {
  const { data: stats, isLoading } = useAllNotificationStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const totals = stats?.totals || {
    totalViews: 0,
    totalClicks: 0,
    totalDismissed: 0,
    clickThroughRate: 0,
    dismissRate: 0,
  };

  const formatPercent = (num: number) => num.toFixed(1) + '%';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Views */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Gösterim</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totals.totalViews.toLocaleString('tr-TR')}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Bildirimler toplam {totals.totalViews} kez görüntülendi
          </p>
        </CardContent>
      </Card>

      {/* Total Clicks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
          <MousePointer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totals.totalClicks.toLocaleString('tr-TR')}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {totals.totalViews > 0 ? formatPercent(totals.clickThroughRate) : '0%'} tıklama oranı
          </p>
        </CardContent>
      </Card>

      {/* Click-Through Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tıklama Oranı (CTR)</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercent(totals.clickThroughRate)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Gösterim başına tıklama oranı
          </p>
        </CardContent>
      </Card>

      {/* Dismiss Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kapatma Oranı</CardTitle>
          <X className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercent(totals.dismissRate)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totals.totalDismissed.toLocaleString('tr-TR')} kez kapatıldı
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
