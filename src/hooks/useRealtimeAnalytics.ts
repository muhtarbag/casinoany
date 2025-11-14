import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeMetrics {
  totalViews: number;
  totalClicks: number;
  activeUsers: number;
  recentActivities: Array<{
    id: string;
    type: 'view' | 'click' | 'event' | 'conversion';
    timestamp: string;
    details: string;
  }>;
}

/**
 * OPTIMIZED: Single WebSocket channel instead of 4 separate channels
 * Subscribes to analytics_events table with event-sourcing pattern
 * Performance: 75% reduction in WebSocket overhead
 */
export const useRealtimeAnalytics = () => {
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    totalViews: 0,
    totalClicks: 0,
    activeUsers: 0,
    recentActivities: [],
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('[Realtime Analytics] Starting with unified channel...');
    
    let analyticsChannel: RealtimeChannel;

    // Load initial data from analytics_events
    const loadInitialData = async () => {
      try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        
        // Get counts by event type (using any to handle type mismatch during migration)
        const { data: events } = await (supabase as any)
          .from('analytics_events')
          .select('event_type')
          .gte('created_at', oneDayAgo);

        const viewsCount = events?.filter((e: any) => e.event_type === 'page_view').length || 0;
        const clicksCount = events?.filter((e: any) => e.event_type === 'affiliate_click').length || 0;

        // Active users (last 5 minutes)
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
        const { data: activeSessions } = await (supabase as any)
          .from('analytics_events')
          .select('session_id')
          .gte('created_at', fiveMinutesAgo)
          .not('session_id', 'is', null);

        const uniqueSessions = new Set(activeSessions?.map((s: any) => s.session_id)).size;

        // Recent activities (last 10 events)
        const { data: recentEvents } = await (supabase as any)
          .from('analytics_events')
          .select('id, event_type, event_name, page_path, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        const activities = recentEvents?.map((event: any) => ({
          id: event.id,
          type: event.event_type === 'page_view' ? 'view' as const :
                event.event_type === 'affiliate_click' ? 'click' as const :
                event.event_type === 'conversion' ? 'conversion' as const :
                'event' as const,
          timestamp: event.created_at,
          details: event.page_path || event.event_name || 'Unknown',
        })) || [];

        setMetrics({
          totalViews: viewsCount,
          totalClicks: clicksCount,
          activeUsers: uniqueSessions,
          recentActivities: activities,
        });

        console.log('[Realtime Analytics] Initial data loaded:', {
          views: viewsCount,
          clicks: clicksCount,
          activeUsers: uniqueSessions,
        });
      } catch (error) {
        console.error('[Realtime Analytics] Initial data load error:', error);
      }
    };

    loadInitialData();

    // OPTIMIZED: Single unified analytics channel
    analyticsChannel = supabase
      .channel('unified-analytics-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events',
        },
        (payload: any) => {
          const newEvent = payload.new;
          console.log('[Realtime Analytics] New event:', newEvent.event_type);

          setMetrics(prev => {
            const updates: Partial<RealtimeMetrics> = {
              recentActivities: [
                {
                  id: newEvent.id,
                  type: newEvent.event_type === 'page_view' ? 'view' :
                        newEvent.event_type === 'affiliate_click' ? 'click' :
                        newEvent.event_type === 'conversion' ? 'conversion' :
                        'event',
                  timestamp: newEvent.created_at,
                  details: newEvent.page_path || newEvent.event_name || 'Unknown',
                },
                ...prev.recentActivities.slice(0, 9),
              ],
            };

            // Update counters based on event type
            if (newEvent.event_type === 'page_view') {
              updates.totalViews = prev.totalViews + 1;
            } else if (newEvent.event_type === 'affiliate_click') {
              updates.totalClicks = prev.totalClicks + 1;
            }

            // Update active users if new session
            if (newEvent.session_id && newEvent.event_type === 'session_start') {
              updates.activeUsers = prev.activeUsers + 1;
            }

            return { ...prev, ...updates };
          });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime Analytics] Channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Cleanup: Single channel unsubscribe
    return () => {
      console.log('[Realtime Analytics] Cleaning up unified channel...');
      analyticsChannel?.unsubscribe();
    };
  }, []);

  return { metrics, isConnected };
};
