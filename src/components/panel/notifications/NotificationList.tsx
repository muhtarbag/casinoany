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
        return <MessageSquare className="h-5 w-5 text-orange-500 drop-shadow-lg" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-500 drop-shadow-lg" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-red-500 drop-shadow-lg" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500 drop-shadow-lg" />;
      default:
        return <Bell className="h-5 w-5 text-primary drop-shadow-lg" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (notifications.length === 0) {
    return (
      <div className="p-12 text-center bg-gradient-to-br from-muted/30 to-transparent">
        <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
          <Bell className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Henüz bildirim yok</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Yeni bildirimler burada görünecek</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div>
          <h3 className="font-bold text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bildirimler
          </h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {unreadCount} okunmamış bildirim
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="h-8 text-xs hover:bg-primary/10 transition-all duration-300"
          >
            <Check className="h-3 w-3 mr-1" />
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      {/* Notification List */}
      <ScrollArea className="h-[450px]">
        <div className="divide-y divide-border/50">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'p-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 cursor-pointer transition-all duration-300',
                !notification.is_read && 'bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-l-primary'
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
                <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-gradient-to-br from-background to-muted/30">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        'text-sm leading-relaxed',
                        !notification.is_read && 'font-bold'
                      )}
                    >
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0 mt-1 shadow-lg animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                    <p className="text-xs text-muted-foreground/70 font-medium">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
