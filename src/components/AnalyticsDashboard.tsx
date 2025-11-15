import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, MousePointerClick, TrendingUp, Users, Target, Clock, BarChart3 } from 'lucide-react';
import { TypedQueries } from '@/lib/supabase-typed';

export const AnalyticsDashboard = () => {
  // Fetch analytics summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // ✅ TYPED: Parallel queries with proper types
      const [pageViewsRes, eventsRes, conversionsRes, sessionsRes] = await Promise.all([
        supabase.from('page_views').select('*').gte('created_at', sevenDaysAgo.toISOString()),
        TypedQueries.userEvents(supabase).select('*').gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from('conversions').select('*').gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from('analytics_sessions').select('*').gte('created_at', sevenDaysAgo.toISOString()),
      ]);

      if (pageViewsRes.error) throw pageViewsRes.error;
      if (eventsRes.error) throw eventsRes.error;
      if (conversionsRes.error) throw conversionsRes.error;
      if (sessionsRes.error) throw sessionsRes.error;

      return {
        pageViews: pageViewsRes.data || [],
        events: eventsRes.data || [],
        conversions: conversionsRes.data || [],
        sessions: sessionsRes.data || [],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (was 3min - optimized)
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes (was 2min - too aggressive)
  });

  // ✅ OPTIMIZED: Memoize expensive computations
  const processedData = useMemo(() => {
    if (!summary) return null;
    
    return {
      totalPageViews: summary.pageViews.length,
      totalEvents: summary.events.length,
      totalConversions: summary.conversions.length,
      totalSessions: summary.sessions.length,
      avgSessionDuration: summary.sessions.length > 0
        ? Math.round(summary.sessions.reduce((sum: number, s: any) => sum + (s.total_duration || 0), 0) / summary.sessions.length)
        : 0,
      bounceRate: summary.sessions.length > 0
        ? Math.round((summary.sessions.filter((s: any) => s.is_bounce).length / summary.sessions.length) * 100)
        : 0,
      
      // Page views by day
      pageViewsByDay: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const count = summary.pageViews.filter((pv: any) => 
          pv.created_at.startsWith(dateStr)
        ).length;
        return {
          date: date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
          views: count,
        };
      }),

      // Top pages
      topPages: Object.entries(
        summary.pageViews.reduce((acc: any, pv: any) => {
          acc[pv.page_path] = (acc[pv.page_path] || 0) + 1;
          return acc;
        }, {})
      )
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 10)
        .map(([path, count]) => ({ path, count })),

      // Device breakdown
      deviceBreakdown: Object.entries(
        summary.pageViews.reduce((acc: any, pv: any) => {
          const device = pv.device_type || 'unknown';
          acc[device] = (acc[device] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value })),

      // Event types
      eventTypes: Object.entries(
        summary.events.reduce((acc: any, e: any) => {
          acc[e.event_type] = (acc[e.event_type] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value })),

      // Conversion funnel
      conversionFunnel: Object.entries(
        summary.conversions.reduce((acc: any, c: any) => {
          acc[c.conversion_type] = (acc[c.conversion_type] || 0) + 1;
          return acc;
        }, {})
      ).map(([type, count]) => ({ type, count })),
    };
  }, [summary]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (summaryLoading) {
    return <LoadingSpinner size="lg" text="Analytics verileri yükleniyor..." className="py-20" />;
  }

  if (!processedData || processedData.totalPageViews === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Henüz Analitik Verisi Yok"
        description="Analytics verisi görmek için sitenizde etkinlik olması gerekiyor. Kullanıcı etkileşimleri otomatik olarak takip edilecektir."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görüntüleme</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.totalPageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Son 7 gün</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Olay</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Kullanıcı etkileşimleri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dönüşümler</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.totalConversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Toplam dönüşüm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Oturum</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.totalSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Benzersiz oturumlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ort. Süre</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.avgSessionDuration}s</div>
            <p className="text-xs text-muted-foreground">Oturum başına</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hemen Çıkma</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.bounceRate}%</div>
            <p className="text-xs text-muted-foreground">Hemen çıkma oranı</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="pages">Sayfalar</TabsTrigger>
          <TabsTrigger value="events">Olaylar</TabsTrigger>
          <TabsTrigger value="conversions">Dönüşümler</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Günlük Görüntüleme Trendi</CardTitle>
              <CardDescription>Son 7 günün sayfa görüntülemeleri</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData.pageViewsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cihaz Dağılımı</CardTitle>
                <CardDescription>Ziyaretçilerin kullandığı cihazlar</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={processedData.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {processedData.deviceBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Olay Türleri</CardTitle>
                <CardDescription>Kullanıcı etkileşim türleri</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={processedData.eventTypes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>En Popüler Sayfalar</CardTitle>
              <CardDescription>En çok görüntülenen sayfalar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {processedData.topPages.map((page: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                    <span className="text-sm font-mono">{page.path}</span>
                    <Badge variant="secondary">{page.count} görüntüleme</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Olay Analizi</CardTitle>
              <CardDescription>Kullanıcı etkileşimlerinin dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData.eventTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions">
          <Card>
            <CardHeader>
              <CardTitle>Dönüşüm Hunisi</CardTitle>
              <CardDescription>Dönüşüm türleri ve sayıları</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData.conversionFunnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="type" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
