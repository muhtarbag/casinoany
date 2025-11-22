import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotificationList } from './NotificationList';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface NotificationBellProps {
  siteId: string;
  className?: string;
}

interface SiteNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export function NotificationBell({ siteId, className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch notifications
  const { data: notifications = [] } = useQuery<SiteNotification[]>({
    queryKey: ['site-notifications', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_owner_notifications' as any)
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as unknown as SiteNotification[];
    },
    refetchInterval: 30000,
  });

  // Count unread
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('site_owner_notifications' as any)
        .update({ is_read: true } as any)
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-notifications', siteId] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('site_owner_notifications' as any)
        .update({ is_read: true } as any)
        .eq('site_id', siteId)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-notifications', siteId] });
      toast({
        title: 'Başarılı',
        description: 'Tüm bildirimler okundu olarak işaretlendi',
      });
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('site-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'site_owner_notifications',
          filter: `site_id=eq.${siteId}`,
        },
        (payload) => {
          // Realtime notification received
          queryClient.invalidateQueries({ queryKey: ['site-notifications', siteId] });
          
          // Show toast for new notification
          const notification = payload.new as any;
          toast({
            title: notification.title,
            description: notification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [siteId, queryClient, toast]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative group hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/10 transition-all duration-300',
            className
          )}
        >
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-red-600 border-2 border-background shadow-lg animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 border-2 border-primary/20 shadow-2xl bg-background/95 backdrop-blur-xl" align="end">
        <NotificationList
          notifications={notifications}
          onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
          onMarkAllAsRead={() => markAllAsReadMutation.mutate()}
        />
      </PopoverContent>
    </Popover>
  );
}
