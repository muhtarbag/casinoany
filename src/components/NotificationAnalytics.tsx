import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, MousePointer, TrendingUp, Users } from 'lucide-react';

interface AnalyticsData {
  notification_id: string;
  notification_title: string;
  total_views: number;
  total_clicks: number;
  unique_users: number;
  click_rate: number;
}

export const NotificationAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['notification-analytics'],
    queryFn: async () => {
      const { data: notifications, error: notifError } = await supabase
        .from('site_notifications')
        .select('id, title');
      
      if (notifError) throw notifError;

      const analyticsPromises = notifications.map(async (notif) => {
        const { data: views, error: viewsError } = await supabase
          .from('notification_views')
          .select('user_id, clicked')
          .eq('notification_id', notif.id);
        
        if (viewsError) throw viewsError;

        const totalViews = views.length;
        const totalClicks = views.filter(v => v.clicked).length;
        const uniqueUsers = new Set(views.map(v => v.user_id).filter(Boolean)).size;
        const clickRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

        return {
          notification_id: notif.id,
          notification_title: notif.title,
          total_views: totalViews,
          total_clicks: totalClicks,
          unique_users: uniqueUsers,
          click_rate: clickRate,
        };
      });

      const results = await Promise.all(analyticsPromises);
      return results.sort((a, b) => b.total_views - a.total_views);
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  if (!analytics || analytics.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Henüz analitik verisi bulunmuyor.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.reduce((sum, a) => sum + a.total_views, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.reduce((sum, a) => sum + a.total_clicks, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Tıklama Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.reduce((sum, a) => sum + a.click_rate, 0) / analytics.length).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.reduce((sum, a) => sum + a.unique_users, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bildirim Bazlı Performans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.map((item) => (
              <div key={item.notification_id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="flex-1">
                  <h4 className="font-medium">{item.notification_title}</h4>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {item.total_views} görüntülenme
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointer className="h-3 w-3" />
                      {item.total_clicks} tıklama
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {item.unique_users} kullanıcı
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {item.click_rate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Dönüşüm</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
