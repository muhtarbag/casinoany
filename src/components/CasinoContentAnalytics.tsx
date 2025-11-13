import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Eye, MousePointerClick, Clock, Activity } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'];

export const CasinoContentAnalytics = () => {
  // Fetch top performing sites
  const { data: topSites } = useQuery({
    queryKey: ['analytics-top-sites'],
    queryFn: async () => {
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      
      const { data, error } = await (supabase as any)
        .from('casino_content_analytics')
        .select(`
          site_id,
          betting_sites(name, logo_url),
          total_views,
          affiliate_clicks
        `)
        .gte('view_date', thirtyDaysAgo);

      if (error) throw error;

      // Aggregate by site
      const siteMap = new Map();
      data.forEach((row: any) => {
        const siteId = row.site_id;
        if (!siteMap.has(siteId)) {
          siteMap.set(siteId, {
            name: row.betting_sites.name,
            logo: row.betting_sites.logo_url,
            views: 0,
            clicks: 0,
          });
        }
        const site = siteMap.get(siteId);
        site.views += row.total_views || 0;
        site.clicks += row.affiliate_clicks || 0;
      });

      return Array.from(siteMap.values())
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    },
  });

  // Fetch block interactions
  const { data: blockStats } = useQuery({
    queryKey: ['analytics-block-stats'],
    queryFn: async () => {
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      
      const { data, error } = await (supabase as any)
        .from('casino_content_analytics')
        .select('block_interactions')
        .gte('view_date', thirtyDaysAgo);

      if (error) throw error;

      // Aggregate block interactions
      const blockMap = new Map();
      data.forEach((row: any) => {
        const interactions = row.block_interactions || {};
        Object.entries(interactions).forEach(([block, count]) => {
          blockMap.set(block, (blockMap.get(block) || 0) + (count as number));
        });
      });

      return Array.from(blockMap.entries()).map(([name, value]) => ({
        name: name.replace(/([A-Z])/g, ' $1').trim(),
        value,
      }));
    },
  });

  // Fetch daily trends (last 7 days)
  const { data: dailyTrends } = useQuery({
    queryKey: ['analytics-daily-trends'],
    queryFn: async () => {
      const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      
      const { data, error } = await (supabase as any)
        .from('casino_content_analytics')
        .select('view_date, total_views, affiliate_clicks')
        .gte('view_date', sevenDaysAgo)
        .order('view_date', { ascending: true });

      if (error) throw error;

      // Aggregate by date
      const dateMap = new Map();
      data.forEach((row: any) => {
        const date = row.view_date;
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, views: 0, clicks: 0 });
        }
        const entry = dateMap.get(date);
        entry.views += row.total_views || 0;
        entry.clicks += row.affiliate_clicks || 0;
      });

      return Array.from(dateMap.values()).map(entry => ({
        ...entry,
        date: format(new Date(entry.date), 'dd MMM', { locale: tr }),
      }));
    },
  });

  // Calculate summary stats
  const summaryStats = {
    totalViews: topSites?.reduce((sum, site) => sum + site.views, 0) || 0,
    totalClicks: topSites?.reduce((sum, site) => sum + site.clicks, 0) || 0,
    avgCTR: topSites?.length 
      ? ((topSites.reduce((sum, site) => sum + site.clicks, 0) / 
          topSites.reduce((sum, site) => sum + site.views, 0)) * 100).toFixed(2)
      : '0',
    topSite: topSites?.[0]?.name || '-',
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Son 30 gün</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Affiliate linklere</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.avgCTR}%</div>
            <p className="text-xs text-muted-foreground">Click-through rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Popüler</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{summaryStats.topSite}</div>
            <p className="text-xs text-muted-foreground">En çok görüntülenen</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="sites" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sites">Site Performansı</TabsTrigger>
          <TabsTrigger value="blocks">İçerik Blokları</TabsTrigger>
          <TabsTrigger value="trends">Trend Analizi</TabsTrigger>
        </TabsList>

        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>En Çok Görüntülenen Siteler</CardTitle>
              <CardDescription>Son 30 günün performans sıralaması</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topSites}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#3b82f6" name="Görüntülenme" />
                  <Bar dataKey="clicks" fill="#10b981" name="Tıklama" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detaylı Site İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSites?.map((site, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                      {site.logo && (
                        <img src={site.logo} alt={site.name} className="w-10 h-10 object-contain" />
                      )}
                      <div>
                        <p className="font-medium">{site.name}</p>
                        <p className="text-sm text-muted-foreground">
                          CTR: {((site.clicks / site.views) * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{site.views.toLocaleString()} görüntülenme</p>
                      <p className="text-sm text-muted-foreground">{site.clicks.toLocaleString()} tıklama</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>İçerik Bloğu Etkileşimleri</CardTitle>
              <CardDescription>Hangi bloklar daha fazla okunuyor</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={blockStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {blockStats?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Günlük Trend Analizi</CardTitle>
              <CardDescription>Son 7 günün performans grafiği</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} name="Görüntülenme" />
                  <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={2} name="Tıklama" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};