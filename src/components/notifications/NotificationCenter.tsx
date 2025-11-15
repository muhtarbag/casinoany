import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Check, AlertCircle, Info, CheckCircle, XCircle, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast } from '@/lib/toastHelpers';
import { useQueryClient } from '@tanstack/react-query';

const notificationIcons = {
  info: Info,
  warning: AlertCircle,
  success: CheckCircle,
  error: XCircle,
};

const notificationColors = {
  info: 'text-info',
  warning: 'text-warning',
  success: 'text-success',
  error: 'text-destructive',
};

export function NotificationCenter() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notifications, unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('change_history')
        .update({ metadata: { ...notifications.find(n => n.id === notificationId)?.metadata, read: true } })
        .eq('id', notificationId);
      
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      for (const id of unreadIds) {
        await supabase
          .from('change_history')
          .update({ metadata: { ...notifications.find(n => n.id === id)?.metadata, read: true } })
          .eq('id', id);
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
      showSuccessToast('Tüm bildirimler okundu işaretlendi');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Bildirimler</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} okunmamış</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Tümünü Okundu İşaretle</span>
            </Button>
          )}
        </div>
        <ScrollArea className="h-[500px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p>Bildirim yok</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                const colorClass = notificationColors[notification.type];

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                      !notification.read && 'bg-muted/30'
                    )}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('mt-1', colorClass)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{notification.title}</span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </p>
                        {notification.action && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-2"
                            onClick={() => {
                              navigate(notification.action!.url);
                              setOpen(false);
                            }}
                          >
                            {notification.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
