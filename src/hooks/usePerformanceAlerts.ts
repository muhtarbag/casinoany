/**
 * Real-time Performance Alerting System
 * Phase 10/10: Monitors metrics and triggers alerts
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { subMinutes } from 'date-fns';

interface PerformanceAlert {
  id: string;
  metric_name: string;
  metric_value: number;
  status: 'healthy' | 'warning' | 'critical';
  recorded_at: string;
  metadata?: Record<string, any>;
}

const ALERT_THRESHOLDS = {
  LCP: { warning: 4000, critical: 6000 },
  FID: { warning: 300, critical: 500 },
  CLS: { warning: 0.25, critical: 0.5 },
  TTFB: { warning: 1800, critical: 3000 },
  long_task: { warning: 100, critical: 200 },
  memory_used: { warning: 80, critical: 90 }, // percentage
};

export const usePerformanceAlerts = () => {
  const [recentAlerts, setRecentAlerts] = useState<PerformanceAlert[]>([]);
  const [hasShownToast, setHasShownToast] = useState<Set<string>>(new Set());

  // Fetch recent critical/warning metrics
  const { data: metrics } = useQuery({
    queryKey: ['performance-alerts'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('system_health_metrics')
        .select('*')
        .in('status', ['warning', 'critical'])
        .gte('recorded_at', subMinutes(new Date(), 5).toISOString())
        .order('recorded_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as PerformanceAlert[];
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Subscribe to real-time alerts
  useEffect(() => {
    const channel = supabase
      .channel('performance-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_health_metrics',
          filter: 'status=in.(warning,critical)',
        },
        (payload: any) => {
          const newAlert = payload.new as PerformanceAlert;
          
          // Add to recent alerts
          setRecentAlerts((prev) => [newAlert, ...prev.slice(0, 19)]);

          // Show toast notification if not already shown
          const alertKey = `${newAlert.metric_name}-${newAlert.recorded_at}`;
          if (!hasShownToast.has(alertKey)) {
            showAlertToast(newAlert);
            setHasShownToast((prev) => new Set(prev).add(alertKey));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hasShownToast]);

  // Initialize with existing metrics
  useEffect(() => {
    if (metrics) {
      setRecentAlerts(metrics);
    }
  }, [metrics]);

  return {
    recentAlerts,
    alertCount: recentAlerts.length,
    criticalCount: recentAlerts.filter((a) => a.status === 'critical').length,
    warningCount: recentAlerts.filter((a) => a.status === 'warning').length,
  };
};

/**
 * Show toast notification for performance alert
 */
const showAlertToast = (alert: PerformanceAlert) => {
  const message = generateAlertMessage(alert);
  
  if (alert.status === 'critical') {
    toast.error(`🚨 ${message}`, {
      duration: 10000,
      action: {
        label: 'Performance',
        onClick: () => {
          // Navigate to performance dashboard
          window.location.hash = '#performance';
        },
      },
    });
  } else if (alert.status === 'warning') {
    toast.warning(`⚠️ ${message}`, {
      duration: 5000,
    });
  }
};

/**
 * Generate human-readable alert message
 */
const generateAlertMessage = (alert: PerformanceAlert): string => {
  const metricName = alert.metric_name;
  const value = alert.metric_value;

  switch (metricName) {
    case 'LCP':
      return `Largest Contentful Paint yavaş: ${value.toFixed(0)}ms`;
    
    case 'FID':
      return `First Input Delay yüksek: ${value.toFixed(0)}ms`;
    
    case 'CLS':
      return `Cumulative Layout Shift yüksek: ${value.toFixed(3)}`;
    
    case 'TTFB':
      return `Time to First Byte yavaş: ${value.toFixed(0)}ms`;
    
    case 'long_task':
      return `Uzun görev tespit edildi: ${value.toFixed(0)}ms`;
    
    case 'memory_used':
      return `Yüksek bellek kullanımı: ${value.toFixed(0)}%`;
    
    default:
      if (metricName.startsWith('query_')) {
        return `Yavaş sorgu: ${metricName.replace('query_', '')} (${value.toFixed(0)}ms)`;
      }
      if (metricName.startsWith('render_')) {
        return `Yavaş render: ${metricName.replace('render_', '')} (${value.toFixed(0)}ms)`;
      }
      return `Performance sorunu: ${metricName} (${value})`;
  }
};

/**
 * Check if alert should be triggered based on thresholds
 */
export const shouldAlert = (
  metricName: string,
  value: number
): 'healthy' | 'warning' | 'critical' => {
  const threshold = ALERT_THRESHOLDS[metricName as keyof typeof ALERT_THRESHOLDS];
  
  if (!threshold) return 'healthy';
  
  if (value >= threshold.critical) return 'critical';
  if (value >= threshold.warning) return 'warning';
  
  return 'healthy';
};
