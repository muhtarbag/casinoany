import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MousePointer, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { Bar, BarChart, Pie, PieChart as RechartsPie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function SiteStats() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["all-site-stats"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("site_stats_with_details")
        .select("*")
        .order("clicks", { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        site_id: row.site_id,
        views: row.views,
        clicks: row.clicks,
        created_at: row.created_at,
        updated_at: row.updated_at,
        betting_sites: {
          id: row.site_id,
          name: row.site_name,
          slug: row.site_slug,
        },
      }));
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const topClicked = [...((statsData as any[]) || [])].sort((a: any, b: any) => b.clicks - a.clicks).slice(0, 5);
  const topViewed = [...((statsData as any[]) || [])].sort((a: any, b: any) => b.views - a.views).slice(0, 5);

  const totalClicks = (statsData as any[] || []).reduce((sum: number, stat: any) => sum + stat.clicks, 0);
  const totalViews = (statsData as any[] || []).reduce((sum: number, stat: any) => sum + stat.views, 0);
  const averageCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0";

  // Chart data
  const clicksChartData = topClicked.map((stat: any) => ({
    name: stat.betting_sites?.name || "Bilinmeyen",
    clicks: stat.clicks,
  }));

  const viewsChartData = topViewed.map((stat: any) => ({
    name: stat.betting_sites?.name || "Bilinmeyen",
    views: stat.views,
  }));

  const ctrChartData = [...((statsData as any[]) || [])]
    .filter((stat: any) => stat.views > 0)
    .map((stat: any) => ({
      name: stat.betting_sites?.name || "Bilinmeyen",
      ctr: ((stat.clicks / stat.views) * 100).toFixed(2),
      clicks: stat.clicks,
      views: stat.views,
    }))
    .sort((a: any, b: any) => parseFloat(b.ctr) - parseFloat(a.ctr))
    .slice(0, 10);

  const pieChartData = topClicked.slice(0, 5).map((stat: any) => ({
    name: stat.betting_sites?.name || "Bilinmeyen",
    value: stat.clicks,
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

  const chartConfig = {
    clicks: {
      label: "Tıklamalar",
      color: "hsl(var(--primary))",
    },
    views: {
      label: "Görüntülenmeler",
      color: "hsl(var(--secondary))",
    },
    ctr: {
      label: "Tıklama Oranı (%)",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Toplam Görüntülenme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="w-5 h-5" />
              Toplam Tıklama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{totalClicks.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Ortalama CTR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{averageCTR}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              En Çok Tıklanan Siteler
            </CardTitle>
            <CardDescription>Site bağlantılarına yapılan tıklamalar</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clicksChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              En Çok Görüntülenen Siteler
            </CardTitle>
            <CardDescription>Site detay sayfası görüntülenmeleri</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewsChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="views" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Tıklama Dağılımı
            </CardTitle>
            <CardDescription>Top 5 sitenin tıklama payları</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tıklama Oranı (CTR) Analizi
            </CardTitle>
            <CardDescription>En yüksek dönüşüm oranlarına sahip siteler</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ctrChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" label={{ value: 'CTR %', angle: -90, position: 'insideLeft' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="ctr" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>En Çok Tıklanan Siteler</CardTitle>
            <CardDescription>Site bağlantılarına yapılan tıklamalar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClicked.map((stat: any, index: number) => (
                <div key={stat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium">{stat.betting_sites?.name || "Bilinmeyen"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold">{stat.clicks.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {topClicked.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Henüz tıklama verisi yok</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En Çok Görüntülenen Siteler</CardTitle>
            <CardDescription>Site detay sayfası görüntülenmeleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topViewed.map((stat: any, index: number) => (
                <div key={stat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium">{stat.betting_sites?.name || "Bilinmeyen"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold">{stat.views.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {topViewed.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Henüz görüntülenme verisi yok</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
