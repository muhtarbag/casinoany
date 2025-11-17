import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Star,
  AlertCircle,
  CheckCircle2,
  Bell,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'complaint':
        return <MessageSquare className="h-4 w-4 text-orange-500" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">Henüz bildirim yok</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-sm">Bildirimler</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {unreadCount} okunmamış
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="h-8 text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      {/* Notification List */}
      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                !notification.is_read && 'bg-primary/5'
              )}
              onClick={() => {
                if (!notification.is_read) {
                  onMarkAsRead(notification.id);
                }
                if (notification.action_url) {
                  window.location.href = notification.action_url;
                }
              }}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        'text-sm',
                        !notification.is_read && 'font-semibold'
                      )}
                    >
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
