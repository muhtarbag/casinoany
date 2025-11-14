/**
 * Performance Metrics Dashboard
 * Real-time visualization of performance data
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Zap, TrendingUp, AlertTriangle, AlertCircle, Calculator } from 'lucide-react';
import { subHours } from 'date-fns';
import { usePerformanceAlerts } from '@/hooks/usePerformanceAlerts';
import { PerformanceInstructions } from './PerformanceInstructions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PerformanceDashboard() {
  // Fetch recent metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('system_health_metrics')
        .select('*')
        .gte('recorded_at', subHours(new Date(), 24).toISOString())
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Real-time alerts
  const { recentAlerts, criticalCount, warningCount } = usePerformanceAlerts();

  // Calculate averages
  const getAverageByMetric = (metricName: string) => {
    const filtered = metrics?.filter((m: any) => m.metric_name === metricName) || [];
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum: number, m: any) => sum + m.metric_value, 0) / filtered.length;
  };

  const avgLCP = getAverageByMetric('LCP');
  const avgFID = getAverageByMetric('FID');
  const avgCLS = getAverageByMetric('CLS');
  const avgTTFB = getAverageByMetric('TTFB');
  const avgFCP = getAverageByMetric('FCP');
  const avgINP = getAverageByMetric('INP');

  // PageSpeed Score Calculator
  const calculatePageSpeedScore = (fcp: number, lcp: number, cls: number, inp: number, ttfb: number) => {
    // Google PageSpeed scoring algorithm
    const fcpScore = fcp <= 1800 ? 100 : fcp <= 3000 ? 50 : 0;
    const lcpScore = lcp <= 2500 ? 100 : lcp <= 4000 ? 50 : 0;
    const clsScore = cls <= 0.1 ? 100 : cls <= 0.25 ? 50 : 0;
    const inpScore = inp <= 200 ? 100 : inp <= 500 ? 50 : 0;
    const ttfbScore = ttfb <= 800 ? 100 : ttfb <= 1800 ? 50 : 0;

    // Weighted average (FCP: 10%, LCP: 25%, CLS: 15%, INP: 30%, TTFB: 20%)
    const totalScore = (fcpScore * 0.1) + (lcpScore * 0.25) + (clsScore * 0.15) + (inpScore * 0.3) + (ttfbScore * 0.2);
    return Math.round(totalScore);
  };

  const pageSpeedScore = calculatePageSpeedScore(avgFCP, avgLCP, avgCLS, avgINP, avgTTFB);
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'İyi';
    if (score >= 50) return 'Orta';
    return 'Zayıf';
  };

  // Get status counts
  const statusCounts = metrics?.reduce((acc: any, m: any) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, { healthy: 0, warning: 0, critical: 0 }) || { healthy: 0, warning: 0, critical: 0 };

  // Prepare chart data (last 24 hours)
  const chartData = metrics
    ?.filter((m: any) => ['LCP', 'FID', 'TTFB'].includes(m.metric_name))
    .slice(0, 50)
    .reverse()
    .map((m: any) => ({
      time: new Date(m.recorded_at).toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      [m.metric_name]: m.metric_value,
    })) || [];

  if (isLoading) {
    return <div className="p-4">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">Metrikler</TabsTrigger>
          <TabsTrigger value="guide">Kullanım Kılavuzu</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold">Performance Dashboard</h2>
            <p className="text-muted-foreground mt-2">
              Son 24 saatin performans metrikleri ve Core Web Vitals
            </p>
          </div>

      {/* Real-time Alerts */}
      {(criticalCount > 0 || warningCount > 0) && (
        <Alert variant={criticalCount > 0 ? 'destructive' : 'default'} className="border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="flex items-center justify-between">
            <span className="font-medium">
              {criticalCount > 0 && `${criticalCount} kritik uyarı `}
              {warningCount > 0 && `${warningCount} performans uyarısı `}
              tespit edildi
            </span>
            <span className="text-xs text-muted-foreground">Son 5 dakika</span>
          </AlertDescription>
        </Alert>
      )}

      {/* PageSpeed Score Calculator */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            PageSpeed Skoru
          </CardTitle>
          <CardDescription>
            Core Web Vitals metriklerine göre hesaplanan genel performans skoru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-6xl font-bold ${getScoreColor(pageSpeedScore)}`}>
                {pageSpeedScore}
              </p>
              <p className="text-sm text-muted-foreground mt-2">/ 100</p>
            </div>
            <div className="text-right space-y-2">
              <Badge variant={pageSpeedScore >= 90 ? "default" : pageSpeedScore >= 50 ? "secondary" : "destructive"} className="text-sm">
                {getScoreBadge(pageSpeedScore)}
              </Badge>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>FCP: {avgFCP.toFixed(0)}ms (10%)</p>
                <p>LCP: {avgLCP.toFixed(0)}ms (25%)</p>
                <p>CLS: {avgCLS.toFixed(3)} (15%)</p>
                <p>INP: {avgINP.toFixed(0)}ms (30%)</p>
                <p>TTFB: {avgTTFB.toFixed(0)}ms (20%)</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">İyi (90-100)</span>
              <span className="text-green-600 font-medium">Hızlı</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Orta (50-89)</span>
              <span className="text-orange-600 font-medium">İyileştirme Gerekli</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Zayıf (0-49)</span>
              <span className="text-red-600 font-medium">Yavaş</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Healthy</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.healthy}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warning</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.warning}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Metrik</p>
                <p className="text-2xl font-bold">{metrics?.length || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LCP</CardTitle>
            <CardDescription>Largest Contentful Paint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold">{avgLCP.toFixed(0)}ms</p>
              <Badge variant={avgLCP < 2500 ? 'default' : avgLCP < 4000 ? 'secondary' : 'destructive'}>
                {avgLCP < 2500 ? 'Good' : avgLCP < 4000 ? 'Needs Work' : 'Poor'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">FID</CardTitle>
            <CardDescription>First Input Delay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold">{avgFID.toFixed(0)}ms</p>
              <Badge variant={avgFID < 100 ? 'default' : avgFID < 300 ? 'secondary' : 'destructive'}>
                {avgFID < 100 ? 'Good' : avgFID < 300 ? 'Needs Work' : 'Poor'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CLS</CardTitle>
            <CardDescription>Cumulative Layout Shift</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold">{avgCLS.toFixed(3)}</p>
              <Badge variant={avgCLS < 0.1 ? 'default' : avgCLS < 0.25 ? 'secondary' : 'destructive'}>
                {avgCLS < 0.1 ? 'Good' : avgCLS < 0.25 ? 'Needs Work' : 'Poor'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">TTFB</CardTitle>
            <CardDescription>Time to First Byte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold">{avgTTFB.toFixed(0)}ms</p>
              <Badge variant={avgTTFB < 800 ? 'default' : avgTTFB < 1800 ? 'secondary' : 'destructive'}>
                {avgTTFB < 800 ? 'Good' : avgTTFB < 1800 ? 'Needs Work' : 'Poor'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Trend (Son 24 Saat)
          </CardTitle>
          <CardDescription>
            LCP, FID ve TTFB metriklerinin zaman içindeki değişimi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="LCP" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="FID" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="TTFB" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="guide">
          <PerformanceInstructions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
