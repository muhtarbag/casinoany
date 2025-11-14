import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerformanceMetrics, useRecentErrors, useApiPerformance } from '@/hooks/usePerformanceMetrics';
import { Activity, AlertCircle, Zap, TrendingUp } from 'lucide-react';
import { AnimatedLoader } from '@/components/feedback/AnimatedLoader';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export function PerformanceMonitor() {
  const { data: metrics, isLoading: metricsLoading } = usePerformanceMetrics('24h');
  const { data: errors, isLoading: errorsLoading } = useRecentErrors(10);
  const { data: apiPerf, isLoading: apiLoading } = useApiPerformance();

  if (metricsLoading || errorsLoading || apiLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance İzleme</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatedLoader text="Metrikler yükleniyor..." />
        </CardContent>
      </Card>
    );
  }

  const healthyMetrics = metrics?.filter(m => m.status === 'healthy').length || 0;
  const totalMetrics = metrics?.length || 1;
  const healthScore = Math.round((healthyMetrics / totalMetrics) * 100);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistem Sağlığı</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthScore}%</div>
            <p className="text-xs text-muted-foreground">
              {healthyMetrics}/{totalMetrics} metrik sağlıklı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Yanıt</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiPerf?.avgDuration || 0}ms</div>
            <p className="text-xs text-muted-foreground">API response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiPerf?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Son 100 istek</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hata Sayısı</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errors?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Son hatalar</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Metrikler</TabsTrigger>
          <TabsTrigger value="errors">Hatalar</TabsTrigger>
          <TabsTrigger value="api">API Logları</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistem Metrikleri</CardTitle>
              <CardDescription>Son 24 saat içindeki performans metrikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics?.slice(0, 20).map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metric.metric_name}</span>
                        <Badge variant={metric.status === 'healthy' ? 'default' : 'destructive'}>
                          {metric.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{metric.metric_type}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{metric.metric_value}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(metric.recorded_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Son Hatalar</CardTitle>
              <CardDescription>Sistem tarafından kaydedilen son hatalar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errors?.map((error) => (
                  <div key={error.id} className="p-3 border rounded-lg border-destructive/20 bg-destructive/5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{error.action}</div>
                        <p className="text-sm text-muted-foreground mt-1">{error.error_message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(error.created_at), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Çağrı Logları</CardTitle>
              <CardDescription>Son 100 API çağrısının detayları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {apiPerf?.logs.slice(0, 20).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.status_code < 400 ? 'default' : 'destructive'}>
                          {log.status_code}
                        </Badge>
                        <span className="font-mono text-sm">{log.method}</span>
                        <span className="text-sm truncate">{log.endpoint}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{log.function_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{log.duration_ms}ms</div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
