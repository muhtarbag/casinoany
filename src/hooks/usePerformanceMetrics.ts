import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_DEFAULTS, queryKeys } from '@/lib/queryClient';

export interface PerformanceMetric {
  id: string;
  metric_type: string;
  metric_name: string;
  metric_value: number;
  status: string;
  recorded_at: string;
  metadata?: any;
}

export function usePerformanceMetrics(timeRange: '1h' | '24h' | '7d' = '24h') {
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'performance-metrics', timeRange],
    queryFn: async () => {
      const hoursAgo = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
      const startTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('system_health_metrics')
        .select('*')
        .gte('recorded_at', startTime)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data as PerformanceMetric[];
    },
    // STANDARDIZED: Analytics pattern (2 dakika refetch)
    ...QUERY_DEFAULTS.analytics,
  });
}

export function useRecentErrors(limit: number = 10) {
  return useQuery({
    queryKey: [...queryKeys.admin.logs({ severity: 'error' }), 'recent', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('severity', 'error')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    // STANDARDIZED: Admin data pattern
    ...QUERY_DEFAULTS.admin,
  });
}

export function useApiPerformance() {
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'api-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_call_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Calculate average response time and success rate
      const avgDuration = data.reduce((sum, log) => sum + log.duration_ms, 0) / data.length;
      const successRate = (data.filter(log => log.status_code < 400).length / data.length) * 100;

      return {
        logs: data,
        avgDuration: Math.round(avgDuration),
        successRate: Math.round(successRate),
      };
    },
    // STANDARDIZED: Analytics pattern
    ...QUERY_DEFAULTS.analytics,
  });
}
