import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, AlertTriangle, Code, Shield, Zap, Search } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

type LogType = 'all' | 'user_action' | 'system_error' | 'api_call' | 'admin_action' | 'performance';

export const SystemLogsViewer = () => {
  const [logType, setLogType] = useState<LogType>('all');
  const [severity, setSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['system-logs', logType, severity],
    queryFn: async () => {
      let query = (supabase as any)
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logType !== 'all') {
        query = query.eq('log_type', logType);
      }

      if (severity !== 'all') {
        query = query.eq('severity', severity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: apiLogs } = useQuery({
    queryKey: ['api-logs'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('api_call_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  const filteredLogs = logs?.filter((log: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action?.toLowerCase().includes(searchLower) ||
      log.resource?.toLowerCase().includes(searchLower) ||
      log.error_message?.toLowerCase().includes(searchLower)
    );
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'error':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'info':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'debug':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'user_action':
        return <Activity className="w-4 h-4" />;
      case 'system_error':
        return <AlertTriangle className="w-4 h-4" />;
      case 'api_call':
        return <Code className="w-4 h-4" />;
      case 'admin_action':
        return <Shield className="w-4 h-4" />;
      case 'performance':
        return <Zap className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loglar yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Sistem Logları</h2>
        <p className="text-muted-foreground">Tüm sistem aktivitelerini ve hataları görüntüleyin</p>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="system">Sistem Logları</TabsTrigger>
          <TabsTrigger value="api">API Çağrıları</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={logType} onValueChange={(v) => setLogType(v as LogType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Log Türü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="user_action">Kullanıcı İşlemleri</SelectItem>
                  <SelectItem value="system_error">Sistem Hataları</SelectItem>
                  <SelectItem value="api_call">API Çağrıları</SelectItem>
                  <SelectItem value="admin_action">Admin İşlemleri</SelectItem>
                  <SelectItem value="performance">Performans</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Önem Derecesi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="critical">Kritik</SelectItem>
                  <SelectItem value="error">Hata</SelectItem>
                  <SelectItem value="warning">Uyarı</SelectItem>
                  <SelectItem value="info">Bilgi</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Log ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </Card>

          {/* Logs List */}
          <Card className="p-6">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {filteredLogs?.map((log: any) => (
                  <div key={log.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getLogTypeIcon(log.log_type)}
                        <span className="font-medium">{log.action}</span>
                      </div>
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </div>
                    
                    {log.resource && (
                      <p className="text-sm text-muted-foreground mb-1">
                        Resource: {log.resource}
                      </p>
                    )}
                    
                    {log.error_message && (
                      <p className="text-sm text-red-500 mb-2">{log.error_message}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{new Date(log.created_at).toLocaleString('tr-TR')}</span>
                      {log.duration_ms && <span>{log.duration_ms}ms</span>}
                      {log.status_code && <span>Status: {log.status_code}</span>}
                    </div>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-primary cursor-pointer">Detayları Göster</summary>
                        <pre className="mt-2 p-2 rounded bg-muted text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}

                {(!filteredLogs || filteredLogs.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz log kaydı yok</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card className="p-6">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {apiLogs?.map((log: any) => (
                  <div key={log.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        <span className="font-medium">{log.function_name}</span>
                        <Badge variant="outline">{log.method}</Badge>
                      </div>
                      <Badge className={log.status_code >= 400 ? 'bg-red-500' : 'bg-green-500'}>
                        {log.status_code}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{log.endpoint}</p>
                    
                    {log.error_message && (
                      <p className="text-sm text-red-500 mb-2">{log.error_message}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{new Date(log.created_at).toLocaleString('tr-TR')}</span>
                      <span>{log.duration_ms}ms</span>
                    </div>

                    <details className="mt-2">
                      <summary className="text-xs text-primary cursor-pointer">Request/Response Detayları</summary>
                      <div className="mt-2 space-y-2">
                        {log.request_body && (
                          <div>
                            <p className="text-xs font-medium mb-1">Request:</p>
                            <pre className="p-2 rounded bg-muted text-xs overflow-x-auto">
                              {JSON.stringify(log.request_body, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.response_body && (
                          <div>
                            <p className="text-xs font-medium mb-1">Response:</p>
                            <pre className="p-2 rounded bg-muted text-xs overflow-x-auto">
                              {JSON.stringify(log.response_body, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                ))}

                {(!apiLogs || apiLogs.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz API çağrı logu yok</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
