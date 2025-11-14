import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target, Zap } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AdvancedAnalyticsDashboard = () => {
  // Real-time metrics from materialized view
  const { data: dailyMetrics } = useQuery({
    queryKey: ['daily-site-metrics-advanced'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_site_metrics' as any)
        .select('*')
        .gte('metric_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('metric_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60000, // Every minute
  });

  // Conversion funnel analysis
  const { data: conversionFunnel } = useQuery({
    queryKey: ['conversion-funnel'],
    queryFn: async () => {
      const [pageViews, events, conversions] = await Promise.all([
        supabase.from('page_views').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_events').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('conversions').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      const totalViews = pageViews.count || 0;
      const totalInteractions = events.count || 0;
      const totalConversions = conversions.count || 0;

      return [
        { stage: 'Sayfa Görüntüleme', count: totalViews, rate: 100 },
        { stage: 'Kullanıcı Etkileşimi', count: totalInteractions, rate: totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0 },
        { stage: 'Dönüşüm', count: totalConversions, rate: totalViews > 0 ? (totalConversions / totalViews) * 100 : 0 },
      ];
    },
    refetchInterval: 120000,
  });

  // Traffic sources analysis
  const { data: trafficSources } = useQuery({
    queryKey: ['traffic-sources-advanced'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_views')
        .select('referrer')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const sources = (data || []).reduce((acc: Record<string, number>, view: any) => {
        let source = 'Direct';
        if (view.referrer && view.referrer !== 'direct') {
          try {
            const url = new URL(view.referrer);
            source = url.hostname;
          } catch {
            source = 'Other';
          }
        }
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(sources)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    },
    refetchInterval: 120000,
  });

  // Top performing sites
  const { data: topSites } = useQuery({
    queryKey: ['top-performing-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_site_metrics' as any)
        .select('*')
        .gte('metric_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (error) throw error;

      const siteTotals = (data || []).reduce((acc: Record<string, any>, metric: any) => {
        if (!acc[metric.site_id]) {
          acc[metric.site_id] = {
            site_name: metric.site_name,
            total_views: 0,
            total_conversions: 0,
            conversion_rate: 0,
          };
        }
        acc[metric.site_id].total_views += metric.total_views || 0;
        acc[metric.site_id].total_conversions += metric.total_conversions || 0;
        return acc;
      }, {});

      return Object.values(siteTotals)
        .map((site: any) => ({
          ...site,
          conversion_rate: site.total_views > 0 ? (site.total_conversions / site.total_views) * 100 : 0,
        }))
        .sort((a: any, b: any) => b.total_conversions - a.total_conversions)
        .slice(0, 10);
    },
    refetchInterval: 120000,
  });

  // Engagement metrics
  const { data: engagementMetrics } = useQuery({
    queryKey: ['engagement-metrics'],
    queryFn: async () => {
      const { data: sessions, error } = await supabase
        .from('analytics_sessions')
        .select('total_duration, page_count, is_bounce')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const totalSessions = sessions?.length || 0;
      const avgDuration = totalSessions > 0
        ? sessions.reduce((sum, s) => sum + (s.total_duration || 0), 0) / totalSessions
        : 0;
      const avgPageCount = totalSessions > 0
        ? sessions.reduce((sum, s) => sum + (s.page_count || 0), 0) / totalSessions
        : 0;
      const bounceRate = totalSessions > 0
        ? (sessions.filter(s => s.is_bounce).length / totalSessions) * 100
        : 0;

      return {
        avgDuration: Math.round(avgDuration),
        avgPageCount: avgPageCount.toFixed(2),
        bounceRate: bounceRate.toFixed(2),
        totalSessions,
      };
    },
    refetchInterval: 60000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gelişmiş Analytics</h2>
        <p className="text-muted-foreground">
          Detaylı performans metrikleri ve trend analizi
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="sites">Site Performansı</TabsTrigger>
          <TabsTrigger value="funnel">Dönüşüm Hunisi</TabsTrigger>
          <TabsTrigger value="engagement">Etkileşim</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ort. Oturum Süresi</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagementMetrics?.avgDuration}s</div>
                <p className="text-xs text-muted-foreground">Son 7 gün</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sayfa/Oturum</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagementMetrics?.avgPageCount}</div>
                <p className="text-xs text-muted-foreground">Ortalama sayfa sayısı</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                {parseFloat(engagementMetrics?.bounceRate || '0') > 50 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagementMetrics?.bounceRate}%</div>
                <p className="text-xs text-muted-foreground">Tek sayfa ziyaretleri</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Oturum</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagementMetrics?.totalSessions}</div>
                <p className="text-xs text-muted-foreground">Son 7 gün</p>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Trafik Kaynakları</CardTitle>
              <CardDescription>Son 7 gün</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trafficSources || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(trafficSources || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sites Performance Tab */}
        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>En Performanslı Siteler</CardTitle>
              <CardDescription>Dönüşüm bazlı sıralama (Son 7 gün)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topSites || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="site_name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_views" fill="#3b82f6" name="Görüntüleme" />
                  <Bar dataKey="total_conversions" fill="#10b981" name="Dönüşüm" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversion rates table */}
          <Card>
            <CardHeader>
              <CardTitle>Dönüşüm Oranları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(topSites || []).map((site: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{site.site_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {site.total_views} görüntüleme • {site.total_conversions} dönüşüm
                      </p>
                    </div>
                    <Badge 
                      variant={site.conversion_rate > 5 ? 'default' : site.conversion_rate > 2 ? 'secondary' : 'outline'}
                    >
                      %{site.conversion_rate.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Funnel Tab */}
        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dönüşüm Hunisi</CardTitle>
              <CardDescription>Son 7 günlük kullanıcı yolculuğu</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionFunnel || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-3">
                {(conversionFunnel || []).map((stage: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{stage.stage}</p>
                      <p className="text-sm text-muted-foreground">{stage.count.toLocaleString()} kullanıcı</p>
                    </div>
                    <Badge variant={stage.rate > 10 ? 'default' : 'secondary'}>
                      %{stage.rate.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Günlük Trend</CardTitle>
              <CardDescription>Son 30 gün site performansı</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyMetrics || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="metric_date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total_views" stroke="#3b82f6" name="Görüntüleme" strokeWidth={2} />
                  <Line type="monotone" dataKey="unique_sessions" stroke="#10b981" name="Oturum" strokeWidth={2} />
                  <Line type="monotone" dataKey="total_conversions" stroke="#f59e0b" name="Dönüşüm" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Session duration distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Oturum Süre Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyMetrics?.slice(0, 7).map((m: any) => ({
                    date: new Date(m.metric_date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
                    duration: m.avg_duration_seconds || 0,
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="duration" fill="#8b5cf6" name="Ort. Süre (sn)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User engagement breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Etkileşimi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Kayıtlı Kullanıcılar</span>
                    <Badge>
                      {dailyMetrics?.[0]?.logged_in_users || 0} kullanıcı
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Anonim Ziyaretçiler</span>
                    <Badge variant="secondary">
                      {(dailyMetrics?.[0]?.unique_sessions || 0) - (dailyMetrics?.[0]?.logged_in_users || 0)} oturum
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Affiliate Tıklamalar</span>
                    <Badge variant="outline">
                      {dailyMetrics?.[0]?.affiliate_clicks || 0} tıklama
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
