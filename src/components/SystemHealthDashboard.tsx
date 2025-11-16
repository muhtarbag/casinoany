import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Database, Zap, HardDrive, TrendingUp, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

export const SystemHealthDashboard = () => {
  const { toast } = useToast();

  const { data: healthMetrics, isLoading, refetch } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('system_health_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentErrors } = useQuery({
    queryKey: ['recent-errors'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('system_logs')
        .select('*')
        .in('severity', ['error', 'critical'])
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const triggerHealthCheck = async () => {
    try {
      toast({
        title: 'Sağlık kontrolü başlatılıyor...',
        description: 'Sistem metrikleri güncelleniyor',
      });

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/system-health-monitor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Health check failed');

      await refetch();
      
      toast({
        title: 'Başarılı',
        description: 'Sistem sağlığı güncellendi',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Sağlık kontrolü başarısız oldu',
      });
    }
  };

  const getMetricsByType = (type: string) => {
    return healthMetrics?.filter((m: any) => m.metric_type === type) || [];
  };

  const getLatestMetric = (type: string, name: string) => {
    return healthMetrics?.find((m: any) => m.metric_type === type && m.metric_name === name);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Sistem sağlığı yükleniyor..." />;
  }

  const dbMetric = getLatestMetric('database', 'response_time');
  const apiMetric = getLatestMetric('api', 'avg_response_time');
  const cacheMetric = getLatestMetric('cache', 'hit_rate');
  const storageMetric = getLatestMetric('storage', 'usage_percent');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Sistem Sağlığı</h2>
          <p className="text-muted-foreground">Anlık sistem metrikleri ve durum bilgileri</p>
        </div>
        <Button onClick={triggerHealthCheck} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Metrikleri Güncelle
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Database className="w-8 h-8 text-primary" />
            {dbMetric && getStatusIcon(dbMetric.status)}
          </div>
          <h3 className="font-semibold mb-1">Database</h3>
          <p className="text-2xl font-bold">{dbMetric?.metric_value || 0}ms</p>
          <p className="text-sm text-muted-foreground">Response Time</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-secondary" />
            {apiMetric && getStatusIcon(apiMetric.status)}
          </div>
          <h3 className="font-semibold mb-1">API</h3>
          <p className="text-2xl font-bold">{apiMetric?.metric_value || 0}ms</p>
          <p className="text-sm text-muted-foreground">Avg Response Time</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-accent" />
            {cacheMetric && getStatusIcon(cacheMetric.status)}
          </div>
          <h3 className="font-semibold mb-1">Cache</h3>
          <p className="text-2xl font-bold">{cacheMetric?.metric_value || 0}%</p>
          <p className="text-sm text-muted-foreground">Hit Rate</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <HardDrive className="w-8 h-8 text-purple-500" />
            {storageMetric && getStatusIcon(storageMetric.status)}
          </div>
          <h3 className="font-semibold mb-1">Storage</h3>
          <p className="text-2xl font-bold">{storageMetric?.metric_value || 0}%</p>
          <p className="text-sm text-muted-foreground">Usage</p>
        </Card>
      </div>

      {/* Recent Errors */}
      {recentErrors && recentErrors.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Son Hatalar
          </h3>
          <div className="space-y-3">
            {recentErrors.slice(0, 5).map((error: any) => (
              <div key={error.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className={getStatusColor(error.severity)}>
                  {error.severity}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{error.action}</p>
                  <p className="text-sm text-muted-foreground truncate">{error.error_message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(error.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* All Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tüm Metrikler</h3>
        <div className="space-y-4">
          {['database', 'api', 'cache', 'storage', 'performance'].map(type => {
            const metrics = getMetricsByType(type);
            if (metrics.length === 0) return null;

            return (
              <div key={type}>
                <h4 className="font-medium capitalize mb-2">{type}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {metrics.slice(0, 6).map((metric: any) => (
                    <div key={metric.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{metric.metric_name}</span>
                        {getStatusIcon(metric.status)}
                      </div>
                      <p className="text-lg font-bold">{metric.metric_value}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(metric.recorded_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
