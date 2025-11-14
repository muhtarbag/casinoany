import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MousePointer, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { Bar, BarChart, Pie, PieChart as RechartsPie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useSiteStats } from "@/hooks/queries/useSiteQueries";

export default function SiteStats() {
  const { data: statsData, isLoading } = useSiteStats();

  const topClicked = useMemo(() => 
    [...((statsData as any[]) || [])]
      .filter((stat: any) => stat.site_name) // Sadece site bilgisi olanları göster
      .sort((a: any, b: any) => b.clicks - a.clicks)
      .slice(0, 5),
    [statsData]
  );
  
  const topViewed = useMemo(() => 
    [...((statsData as any[]) || [])]
      .filter((stat: any) => stat.site_name)
      .sort((a: any, b: any) => b.views - a.views)
      .slice(0, 5),
    [statsData]
  );

  const totalClicks = useMemo(() => 
    (statsData as any[] || []).reduce((sum: number, stat: any) => sum + stat.clicks, 0),
    [statsData]
  );
  
  const totalViews = useMemo(() => 
    (statsData as any[] || []).reduce((sum: number, stat: any) => sum + stat.views, 0),
    [statsData]
  );
  
  const averageCTR = useMemo(() => 
    totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0",
    [totalClicks, totalViews]
  );

  // Chart data
  const clicksChartData = useMemo(() => 
    topClicked.map((stat: any) => ({
      name: stat.site_name,
      clicks: stat.clicks,
    })),
    [topClicked]
  );

  const viewsChartData = useMemo(() => 
    topViewed.map((stat: any) => ({
      name: stat.site_name,
      views: stat.views,
    })),
    [topViewed]
  );

  const ctrChartData = useMemo(() => 
    [...((statsData as any[]) || [])]
      .filter((stat: any) => stat.views > 0 && stat.site_name)
      .map((stat: any) => ({
        name: stat.site_name,
        ctr: ((stat.clicks / stat.views) * 100).toFixed(2),
        clicks: stat.clicks,
        views: stat.views,
      }))
      .sort((a: any, b: any) => parseFloat(b.ctr) - parseFloat(a.ctr))
      .slice(0, 10),
    [statsData]
  );

  const pieChartData = useMemo(() => 
    topClicked.slice(0, 5).map((stat: any) => ({
      name: stat.site_name,
      value: stat.clicks,
    })),
    [topClicked]
  );

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

  const chartConfig = useMemo(() => ({
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
  }), []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

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
            <ChartContainer config={chartConfig} className="h-[300px]">
              <RechartsPie>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {pieChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ChartContainer>
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
                    <span className="font-medium">{stat.betting_sites?.name}</span>
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
                    <span className="font-medium">{stat.betting_sites?.name}</span>
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
