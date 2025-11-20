import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TrackingData {
  notificationId: string;
  sessionId: string;
  userId?: string;
}

export const useNotificationTracking = () => {
  const queryClient = useQueryClient();

  const trackView = useMutation({
    mutationFn: async ({ notificationId, sessionId, userId }: TrackingData) => {
      const { error } = await supabase
        .from('notification_views')
        .insert({
          notification_id: notificationId,
          session_id: sessionId,
          user_id: userId,
          viewed_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewedNotifications'] });
    },
  });

  const trackClick = useMutation({
    mutationFn: async ({ notificationId }: TrackingData) => {
      // Simplified: Just log the click action
      // In production, you would track this in a separate analytics table
      console.debug('Notification clicked:', notificationId);
    },
  });

  const trackDismiss = useMutation({
    mutationFn: async ({ notificationId, sessionId, userId }: TrackingData) => {
      // Store dismissal in notification_views
      const { error } = await supabase.from('notification_views').upsert(
        {
          notification_id: notificationId,
          session_id: sessionId,
          user_id: userId,
          viewed_at: new Date().toISOString(),
        },
        {
          onConflict: 'notification_id,session_id',
          ignoreDuplicates: false,
        }
      );

      if (error) {
        console.debug('Dismissal tracking error:', error);
      }
    },
  });

  const trackFormSubmit = useMutation({
    mutationFn: async (data: { email: string; phone: string; notificationId: string }) => {
      const { error } = await supabase
        .from('bonus_requests')
        .insert({
          email: data.email,
          phone: data.phone,
          notification_id: data.notificationId,
        });

      if (error) throw error;
    },
  });

  return {
    trackView,
    trackClick,
    trackDismiss,
    trackFormSubmit,
  };
};

