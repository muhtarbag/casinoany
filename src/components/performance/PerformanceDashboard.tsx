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
import { Activity, Zap, TrendingUp, AlertTriangle, AlertCircle } from 'lucide-react';
import { subHours } from 'date-fns';
import { usePerformanceAlerts } from '@/hooks/usePerformanceAlerts';

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
    </div>
  );
}
