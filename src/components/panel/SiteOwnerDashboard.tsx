import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointerClick, 
  Heart, 
  MessageSquare,
  Star,
  Users,
  Activity
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SitePerformanceChart } from './dashboard/SitePerformanceChart';
import { SiteMetricsGrid } from './dashboard/SiteMetricsGrid';
import { SiteActivityTimeline } from './dashboard/SiteActivityTimeline';
import { SiteComparisonCard } from './dashboard/SiteComparisonCard';

interface SiteOwnerDashboardProps {
  siteId: string;
  siteName: string;
  siteData: any;
}

export const SiteOwnerDashboard = ({ siteId, siteName, siteData }: SiteOwnerDashboardProps) => {
  // Fetch detailed analytics
  const { data: analytics } = useQuery({
    queryKey: ['site-analytics', siteId],
    queryFn: async () => {
      // Get last 30 days of data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: dailyStats, error } = await supabase
        .from('page_views')
        .select('created_at, page_path, session_id, user_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .ilike('page_path', `%${siteData.slug}%`);

      if (error) throw error;

      // Process daily stats
      const dailyData: Record<string, { views: number; sessions: Set<string>; users: Set<string> }> = {};
      
      dailyStats?.forEach(stat => {
        const date = new Date(stat.created_at).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { views: 0, sessions: new Set(), users: new Set() };
        }
        dailyData[date].views++;
        if (stat.session_id) dailyData[date].sessions.add(stat.session_id);
        if (stat.user_id) dailyData[date].users.add(stat.user_id);
      });

      const chartData = Object.entries(dailyData).map(([date, data]) => ({
        date,
        views: data.views,
        sessions: data.sessions.size,
        users: data.users.size,
      })).sort((a, b) => a.date.localeCompare(b.date));

      return chartData;
    },
    enabled: !!siteId && !!siteData?.slug,
  });

  // Calculate period comparisons (this week vs last week)
  const { data: comparison } = useQuery({
    queryKey: ['site-comparison', siteId],
    queryFn: async () => {
      const now = new Date();
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - 7);
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);

      // This week
      const { count: thisWeekViews } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisWeekStart.toISOString())
        .ilike('page_path', `%${siteData.slug}%`);

      // Last week
      const { count: lastWeekViews } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastWeekStart.toISOString())
        .lt('created_at', thisWeekStart.toISOString())
        .ilike('page_path', `%${siteData.slug}%`);

      // Conversions this week
      const { count: thisWeekConversions } = await supabase
        .from('conversions')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', siteId)
        .gte('created_at', thisWeekStart.toISOString());

      // Conversions last week
      const { count: lastWeekConversions } = await supabase
        .from('conversions')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', siteId)
        .gte('created_at', lastWeekStart.toISOString())
        .lt('created_at', thisWeekStart.toISOString());

      const viewsChange = lastWeekViews && lastWeekViews > 0
        ? ((thisWeekViews || 0) - lastWeekViews) / lastWeekViews * 100
        : 0;

      const conversionsChange = lastWeekConversions && lastWeekConversions > 0
        ? ((thisWeekConversions || 0) - lastWeekConversions) / lastWeekConversions * 100
        : 0;

      return {
        thisWeek: {
          views: thisWeekViews || 0,
          conversions: thisWeekConversions || 0,
        },
        lastWeek: {
          views: lastWeekViews || 0,
          conversions: lastWeekConversions || 0,
        },
        changes: {
          views: viewsChange,
          conversions: conversionsChange,
        }
      };
    },
    enabled: !!siteId && !!siteData?.slug,
  });

  // Recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['site-recent-activity', siteId],
    queryFn: async () => {
      // Get recent reviews
      const { data: reviews } = await supabase
        .from('site_reviews')
        .select('id, rating, comment, created_at')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent complaints
      const { data: complaints } = await supabase
        .from('site_complaints')
        .select('id, title, severity, created_at')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        reviews: reviews || [],
        complaints: complaints || [],
      };
    },
    enabled: !!siteId,
  });

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue 
  }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    trend?: 'up' | 'down'; 
    trendValue?: number;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
            <span>{Math.abs(trendValue).toFixed(1)}% geçen haftaya göre</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Kontrol Paneli</h2>
        <p className="text-muted-foreground">
          {siteName} için detaylı performans analizi ve istatistikler
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Görüntülenme"
          value={siteData.stats?.views || 0}
          icon={Eye}
          trend={comparison?.changes.views && comparison.changes.views > 0 ? 'up' : comparison?.changes.views && comparison.changes.views < 0 ? 'down' : undefined}
          trendValue={comparison?.changes.views}
        />
        <StatCard
          title="Toplam Tıklama"
          value={siteData.stats?.clicks || 0}
          icon={MousePointerClick}
          trend={comparison?.changes.conversions && comparison.changes.conversions > 0 ? 'up' : comparison?.changes.conversions && comparison.changes.conversions < 0 ? 'down' : undefined}
          trendValue={comparison?.changes.conversions}
        />
        <StatCard
          title="Favorilere Eklenme"
          value={siteData.favoriteCount || 0}
          icon={Heart}
        />
        <StatCard
          title="Ortalama Puan"
          value={siteData.avg_rating ? Number(siteData.avg_rating).toFixed(1) : '0.0'}
          icon={Star}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Yorum Sayısı"
          value={siteData.review_count || 0}
          icon={MessageSquare}
        />
        <StatCard
          title="Şikayet Sayısı"
          value={siteData.complaintsCount || 0}
          icon={Activity}
        />
        <StatCard
          title="Aktif Kullanıcılar"
          value={analytics?.slice(-7).reduce((acc, day) => acc + day.users, 0) || 0}
          icon={Users}
        />
      </div>

      {/* Comparison Card */}
      {comparison && (
        <SiteComparisonCard comparison={comparison} />
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performans</TabsTrigger>
          <TabsTrigger value="activity">Son Aktiviteler</TabsTrigger>
          <TabsTrigger value="metrics">Detaylı Metrikler</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>30 Günlük Performans Trendi</CardTitle>
              <CardDescription>
                Son 30 gündeki görüntülenme, oturum ve kullanıcı sayıları
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics && analytics.length > 0 ? (
                <SitePerformanceChart data={analytics} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz yeterli veri bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <SiteActivityTimeline activity={recentActivity} />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <SiteMetricsGrid siteId={siteId} siteData={siteData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
