/**
 * Notification Stats Hook
 * Calculates and manages notification statistics
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { NotificationStats } from '../types';

interface NotificationWithStats {
  id: string;
  title: string;
  stats: NotificationStats;
}

export function useNotificationStats(notificationId?: string) {
  return useQuery({
    queryKey: ['notification-stats', notificationId],
    queryFn: async () => {
      const { data: views, error } = await supabase
        .from('notification_views')
        .select('*')
        .eq(notificationId ? 'notification_id' : 'id', notificationId || '');

      if (error) throw error;

      const totalViews = views?.length || 0;
      const totalClicks = views?.filter(v => v.clicked).length || 0;
      const totalDismissed = views?.filter(v => v.dismissed).length || 0;
      const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
      const dismissRate = totalViews > 0 ? (totalDismissed / totalViews) * 100 : 0;

      return {
        totalViews,
        totalClicks,
        totalDismissed,
        clickThroughRate,
        dismissRate,
      };
    },
    enabled: !!notificationId,
    // Notification stats need more frequent updates
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 15 * 60 * 1000, // 15 dakika
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useAllNotificationStats() {
  return useQuery({
    queryKey: ['notification-stats', 'all'],
    queryFn: async () => {
      // Get all notifications
      const { data: notifications, error: notifError } = await supabase
        .from('site_notifications')
        .select('id, title');

      if (notifError) throw notifError;

      // Get all views
      const { data: allViews, error: viewsError } = await supabase
        .from('notification_views')
        .select('*');

      if (viewsError) throw viewsError;

      // Calculate stats per notification
      const statsMap: Record<string, NotificationWithStats> = {};
      
      notifications?.forEach(notif => {
        const views = allViews?.filter(v => v.notification_id === notif.id) || [];
        const totalViews = views.length;
        const totalClicks = views.filter(v => v.clicked).length;
        const totalDismissed = views.filter(v => v.dismissed).length;
        const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
        const dismissRate = totalViews > 0 ? (totalDismissed / totalViews) * 100 : 0;

        statsMap[notif.id] = {
          id: notif.id,
          title: notif.title,
          stats: {
            totalViews,
            totalClicks,
            totalDismissed,
            clickThroughRate,
            dismissRate,
          },
        };
      });

      // Calculate totals
      const totalViews = allViews?.length || 0;
      const totalClicks = allViews?.filter(v => v.clicked).length || 0;
      const totalDismissed = allViews?.filter(v => v.dismissed).length || 0;
      const avgClickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
      const avgDismissRate = totalViews > 0 ? (totalDismissed / totalViews) * 100 : 0;

      return {
        totals: {
          totalViews,
          totalClicks,
          totalDismissed,
          clickThroughRate: avgClickThroughRate,
          dismissRate: avgDismissRate,
        },
        byNotification: statsMap,
      };
    },
    // Notification stats need more frequent updates than other analytics
    staleTime: 2 * 60 * 1000, // 2 dakika (analytics default 15 dakika yerine)
    gcTime: 15 * 60 * 1000, // 15 dakika
    refetchOnWindowFocus: true, // Window'a dönüldüğünde yenile
    refetchOnMount: true, // Mount'ta yenile
    refetchInterval: 5 * 60 * 1000, // Her 5 dakikada otomatik yenile
  });
}
