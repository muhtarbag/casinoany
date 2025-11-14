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

export const useRealtimeAnalytics = () => {
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    totalViews: 0,
    totalClicks: 0,
    activeUsers: 0,
    recentActivities: [],
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('[Realtime Analytics] Başlatılıyor...');
    
    let pageViewsChannel: RealtimeChannel;
    let userEventsChannel: RealtimeChannel;
    let siteStatsChannel: RealtimeChannel;
    let conversionsChannel: RealtimeChannel;

    // İlk verileri yükle
    const loadInitialData = async () => {
      try {
        // Total page views
        const { count: viewsCount } = await supabase
          .from('page_views')
          .select('*', { count: 'exact', head: true });

        // Total site stats clicks
        const { data: statsData } = await supabase
          .from('site_stats')
          .select('clicks');
        
        const totalClicks = statsData?.reduce((sum, stat) => sum + (stat.clicks || 0), 0) || 0;

        // Active users (son 5 dakika içinde aktivite gösteren)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data: activeSessions } = await supabase
          .from('analytics_sessions')
          .select('session_id')
          .gte('last_activity', fiveMinutesAgo);

        // Recent activities
        const { data: recentPageViews } = await supabase
          .from('page_views')
          .select('id, page_path, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        const activities = recentPageViews?.map(pv => ({
          id: pv.id,
          type: 'view' as const,
          timestamp: pv.created_at,
          details: pv.page_path,
        })) || [];

        setMetrics({
          totalViews: viewsCount || 0,
          totalClicks,
          activeUsers: activeSessions?.length || 0,
          recentActivities: activities,
        });

        console.log('[Realtime Analytics] İlk veriler yüklendi:', {
          views: viewsCount,
          clicks: totalClicks,
          activeUsers: activeSessions?.length,
        });
      } catch (error) {
        console.error('[Realtime Analytics] İlk veri yükleme hatası:', error);
      }
    };

    loadInitialData();

    // Page Views Channel
    pageViewsChannel = supabase
      .channel('realtime-page-views')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'page_views',
        },
        (payload) => {
          console.log('[Realtime Analytics] Yeni page view:', payload);
          setMetrics(prev => ({
            ...prev,
            totalViews: prev.totalViews + 1,
            recentActivities: [
              {
                id: payload.new.id,
                type: 'view',
                timestamp: payload.new.created_at,
                details: payload.new.page_path,
              },
              ...prev.recentActivities.slice(0, 9),
            ],
          }));
        }
      )
      .subscribe((status) => {
        console.log('[Realtime Analytics] Page Views kanalı:', status);
      });

    // User Events Channel
    userEventsChannel = supabase
      .channel('realtime-user-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_events',
        },
        (payload) => {
          console.log('[Realtime Analytics] Yeni user event:', payload);
          setMetrics(prev => ({
            ...prev,
            recentActivities: [
              {
                id: payload.new.id,
                type: 'event',
                timestamp: payload.new.created_at,
                details: `${payload.new.event_type}: ${payload.new.event_name}`,
              },
              ...prev.recentActivities.slice(0, 9),
            ],
          }));
        }
      )
      .subscribe((status) => {
        console.log('[Realtime Analytics] User Events kanalı:', status);
      });

    // Site Stats Channel
    siteStatsChannel = supabase
      .channel('realtime-site-stats')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_stats',
        },
        (payload) => {
          console.log('[Realtime Analytics] Site stats güncellendi:', payload);
          const oldClicks = payload.old?.clicks || 0;
          const newClicks = payload.new?.clicks || 0;
          const clickDiff = newClicks - oldClicks;

          if (clickDiff > 0) {
            setMetrics(prev => ({
              ...prev,
              totalClicks: prev.totalClicks + clickDiff,
              recentActivities: [
                {
                  id: payload.new.id,
                  type: 'click',
                  timestamp: payload.new.updated_at,
                  details: 'Site affiliate link clicked',
                },
                ...prev.recentActivities.slice(0, 9),
              ],
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime Analytics] Site Stats kanalı:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        }
      });

    // Conversions Channel
    conversionsChannel = supabase
      .channel('realtime-conversions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversions',
        },
        (payload) => {
          console.log('[Realtime Analytics] Yeni conversion:', payload);
          setMetrics(prev => ({
            ...prev,
            recentActivities: [
              {
                id: payload.new.id,
                type: 'conversion',
                timestamp: payload.new.created_at,
                details: `${payload.new.conversion_type} - ${payload.new.conversion_value}₺`,
              },
              ...prev.recentActivities.slice(0, 9),
            ],
          }));
        }
      )
      .subscribe((status) => {
        console.log('[Realtime Analytics] Conversions kanalı:', status);
      });

    // Cleanup
    return () => {
      console.log('[Realtime Analytics] Kapatılıyor...');
      supabase.removeChannel(pageViewsChannel);
      supabase.removeChannel(userEventsChannel);
      supabase.removeChannel(siteStatsChannel);
      supabase.removeChannel(conversionsChannel);
      setIsConnected(false);
    };
  }, []);

  return { metrics, isConnected };
};
