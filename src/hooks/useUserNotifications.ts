import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  notification_type: 'bonus' | 'campaign' | 'achievement' | 'system' | 'interaction';
  target_audience: 'all' | 'individual' | 'corporate';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string;
  action_label?: string;
  icon?: string;
  image_url?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  is_read?: boolean;
}

export const useUserNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all notifications for the user
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['user-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user profile to determine user_type
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      // Fetch notifications
      const { data: notificationsData, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('is_active', true)
        .or(`target_audience.eq.all,target_audience.eq.${profile?.user_type}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch read status for each notification
      const { data: readData } = await supabase
        .from('user_notification_reads')
        .select('notification_id')
        .eq('user_id', user.id);

      const readNotificationIds = new Set(readData?.map(r => r.notification_id) || []);

      return notificationsData.map(notification => ({
        ...notification,
        is_read: readNotificationIds.has(notification.id)
      })) as UserNotification[];
    },
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  });

  // Get unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_notification_reads')
        .insert({
          notification_id: notificationId,
          user_id: user.id
        });

      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    }
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      const insertPromises = unreadNotifications.map(notification =>
        supabase
          .from('user_notification_reads')
          .insert({
            notification_id: notification.id,
            user_id: user.id
          })
      );

      await Promise.all(insertPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    }
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending || markAllAsReadMutation.isPending
  };
};