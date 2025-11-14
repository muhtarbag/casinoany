import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, Activity, Target, Zap } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PerformanceMetric {
  name: string;
  current: number;
  previous: number;
  change: number;
  trend: "up" | "down";
  unit?: string;
}

interface PerformanceMetricsProps {
  weeklyComparison: PerformanceMetric[];
  monthlyTrend: any[];
  customMetrics: {
    avgResponseTime: number;
    peakTrafficHour: string;
    conversionRate: number;
    bounceRate: number;
  };
}

export function PerformanceMetricsWidget({ 
  weeklyComparison, 
  monthlyTrend,
  customMetrics 
}: PerformanceMetricsProps) {
  
  const formatChange = (change: number, unit?: string) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}${unit || "%"}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
      {/* Weekly Performance Comparison */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Haftalık Karşılaştırma
          </CardTitle>
          <CardDescription>Bu hafta vs geçen hafta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {weeklyComparison.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex-1">
                <p className="text-sm font-medium">{metric.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">{metric.current.toLocaleString()}</span>
                  {metric.unit && (
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge 
                  variant={metric.trend === "up" ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {formatChange(metric.change, metric.unit)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  önceki: {metric.previous.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Monthly Trend Analysis */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            Aylık Trend Analizi
          </CardTitle>
          <CardDescription>Son 30 gün performansı</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke="hsl(var(--chart-1))" 
                fillOpacity={1} 
                fill="url(#colorViews)"
                name="Görüntüleme"
              />
              <Area 
                type="monotone" 
                dataKey="clicks" 
                stroke="hsl(var(--chart-2))" 
                fillOpacity={1} 
                fill="url(#colorClicks)"
                name="Tıklama"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Custom Metrics */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-success" />
            Özel Metrikler
          </CardTitle>
          <CardDescription>Kritik performans göstergeleri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Ortalama Yanıt Süresi</span>
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{customMetrics.avgResponseTime}</span>
              <span className="text-sm text-muted-foreground">ms</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {customMetrics.avgResponseTime < 200 ? "Mükemmel" : customMetrics.avgResponseTime < 500 ? "İyi" : "Optimize edilmeli"}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Yoğun Trafik Saati</span>
              <Activity className="h-4 w-4 text-accent" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-accent">{customMetrics.peakTrafficHour}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">En yüksek kullanıcı aktivitesi</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-success/20 bg-success/5">
              <p className="text-xs font-medium text-muted-foreground mb-1">Dönüşüm Oranı</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-success">{customMetrics.conversionRate}</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-warning/20 bg-warning/5">
              <p className="text-xs font-medium text-muted-foreground mb-1">Bounce Rate</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-warning">{customMetrics.bounceRate}</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
