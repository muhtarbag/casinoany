import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SystemLog {
  id: string;
  created_at: string;
  log_type: string;
  severity: 'info' | 'warn' | 'error';
  action: string;
  resource: string | null;
  error_message: string | null;
  details: any;
  session_id: string | null;
}

export default function ErrorMonitoring() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch errors from system_logs
  const { data: errors, isLoading, refetch } = useQuery({
    queryKey: ['error-monitoring', timeRange],
    queryFn: async () => {
      const now = new Date();
      const ranges = {
        '1h': new Date(now.getTime() - 60 * 60 * 1000),
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };

      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('severity', 'error')
        .gte('created_at', ranges[timeRange].toISOString())
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data as SystemLog[];
    },
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30s if enabled
  });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!errors) return null;

    const totalErrors = errors.length;
    const uniqueErrors = new Set(errors.map(e => e.error_message || e.action)).size;
    
    // Group by error message
    const errorGroups = errors.reduce((acc, error) => {
      const key = error.error_message || error.action;
      if (!acc[key]) {
        acc[key] = { count: 0, lastOccurrence: error.created_at, errors: [] };
      }
      acc[key].count++;
      acc[key].errors.push(error);
      if (new Date(error.created_at) > new Date(acc[key].lastOccurrence)) {
        acc[key].lastOccurrence = error.created_at;
      }
      return acc;
    }, {} as Record<string, { count: number; lastOccurrence: string; errors: SystemLog[] }>);

    // Top 5 errors
    const topErrors = Object.entries(errorGroups)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    // Error trend (last 24 hours by hour)
    const hourlyErrors = errors.reduce((acc, error) => {
      const hour = format(new Date(error.created_at), 'HH:00');
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors,
      uniqueErrors,
      topErrors,
      hourlyErrors,
      errorGroups,
    };
  }, [errors]);

  const criticalErrors = errors?.filter(e => 
    e.error_message?.toLowerCase().includes('critical') ||
    e.error_message?.toLowerCase().includes('fatal') ||
    e.details?.severity === 'critical'
  ) || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Error Monitoring</h1>
          <p className="text-muted-foreground">
            Gerçek zamanlı hata izleme ve analiz
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Errors Detected!</AlertTitle>
          <AlertDescription>
            {criticalErrors.length} critical error son {timeRange} içinde tespit edildi.
            Acil müdahale gerekebilir.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {stats?.totalErrors || 0}
              </div>
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {stats?.uniqueErrors || 0}
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-destructive">
                {criticalErrors.length}
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Time Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {timeRange === '1h' ? '1 Saat' : 
                 timeRange === '24h' ? '24 Saat' :
                 timeRange === '7d' ? '7 Gün' : '30 Gün'}
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['1h', '24h', '7d', '30d'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === '1h' ? 'Son 1 Saat' :
             range === '24h' ? 'Son 24 Saat' :
             range === '7d' ? 'Son 7 Gün' : 'Son 30 Gün'}
          </Button>
        ))}
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="top-errors">Top Errors</TabsTrigger>
          <TabsTrigger value="recent">Recent Errors</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Trend</CardTitle>
              <CardDescription>Saatlik hata dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.hourlyErrors && Object.keys(stats.hourlyErrors).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(stats.hourlyErrors)
                    .sort()
                    .slice(-12) // Son 12 saat
                    .map(([hour, count]) => (
                      <div key={hour} className="flex items-center gap-2">
                        <span className="text-sm font-medium w-16">{hour}</span>
                        <div className="flex-1 bg-secondary rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-destructive h-full rounded-full transition-all"
                            style={{
                              width: `${(count / Math.max(...Object.values(stats.hourlyErrors))) * 100}%`,
                            }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {count} errors
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Seçilen zaman aralığında hata bulunamadı
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Errors Tab */}
        <TabsContent value="top-errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>En Sık Görülen Hatalar</CardTitle>
              <CardDescription>Tekrar eden hatalar ve sayıları</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.topErrors && stats.topErrors.length > 0 ? (
                <div className="space-y-4">
                  {stats.topErrors.map(([message, data], idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">{data.count}x</Badge>
                              <span className="text-sm font-medium line-clamp-2">
                                {message}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Son görülme: {format(new Date(data.lastOccurrence), 'PPpp', { locale: tr })}
                            </p>
                          </div>
                          <TrendingUp className="w-5 h-5 text-destructive" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Henüz tekrar eden hata bulunmamaktadır
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Errors Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Son Hatalar</CardTitle>
              <CardDescription>Kronolojik hata listesi</CardDescription>
            </CardHeader>
            <CardContent>
              {errors && errors.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {errors.slice(0, 50).map((error) => (
                    <Card key={error.id} className="border-l-4 border-l-destructive">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium flex-1">
                              {error.error_message || error.action}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {format(new Date(error.created_at), 'HH:mm:ss')}
                            </Badge>
                          </div>
                          
                          {error.resource && (
                            <p className="text-xs text-muted-foreground">
                              Resource: {error.resource}
                            </p>
                          )}
                          
                          {error.details && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                Details
                              </summary>
                              <pre className="mt-2 p-2 bg-secondary rounded text-xs overflow-x-auto">
                                {JSON.stringify(error.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Henüz hata kaydı bulunmamaktadır
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Critical Errors Tab */}
        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Errors</CardTitle>
              <CardDescription>Acil müdahale gerektiren hatalar</CardDescription>
            </CardHeader>
            <CardContent>
              {criticalErrors.length > 0 ? (
                <div className="space-y-3">
                  {criticalErrors.map((error) => (
                    <Alert key={error.id} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="text-sm">
                        {error.error_message || error.action}
                      </AlertTitle>
                      <AlertDescription className="text-xs mt-2">
                        <div className="space-y-1">
                          <p>Time: {format(new Date(error.created_at), 'PPpp', { locale: tr })}</p>
                          {error.resource && <p>Resource: {error.resource}</p>}
                          {error.session_id && <p>Session: {error.session_id.slice(0, 16)}...</p>}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTitle>Harika! 🎉</AlertTitle>
                  <AlertDescription>
                    Seçilen zaman aralığında critical error bulunmamaktadır.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
