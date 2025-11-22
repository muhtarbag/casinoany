import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const getNotificationIcon = (type: string, icon?: string) => {
  if (icon) return icon;
  
  switch (type) {
    case 'bonus':
      return '🎁';
    case 'campaign':
      return '📢';
    case 'achievement':
      return '🏆';
    case 'interaction':
      return '💬';
    case 'system':
      return '⚙️';
    default:
      return '🔔';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'normal':
      return 'bg-blue-500';
    case 'low':
      return 'bg-gray-500';
    default:
      return 'bg-blue-500';
  }
};

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isMarkingAsRead } = useUserNotifications();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative group hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/10 transition-all duration-300"
        >
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-red-500 to-red-600 border-2 border-background shadow-lg animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 border-2 border-primary/20 shadow-2xl bg-background/95 backdrop-blur-xl">
        <DropdownMenuLabel className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-b">
          <div>
            <span className="font-bold text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bildirimler
            </span>
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
              onClick={() => markAllAsRead()}
              disabled={isMarkingAsRead}
              className="h-8 text-xs hover:bg-primary/10 transition-all duration-300"
            >
              Tümünü Okundu İşaretle
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        
        {notifications.length === 0 ? (
          <div className="py-12 text-center bg-gradient-to-br from-muted/30 to-transparent">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
              <Bell className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Henüz bildiriminiz yok</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Yeni bildirimler burada görünecek</p>
          </div>
        ) : (
          <ScrollArea className="h-[450px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-4 cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300 ${!notification.is_read ? 'bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-l-primary' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 text-3xl p-2 rounded-lg bg-gradient-to-br from-background to-muted/30 shadow-sm">
                    {getNotificationIcon(notification.notification_type, notification.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className={`font-semibold text-sm leading-relaxed ${!notification.is_read ? 'font-bold' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                      <p className="text-xs text-muted-foreground/70 font-medium">
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true,
                          locale: tr 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                {notification.action_label && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="mt-3 h-auto p-0 text-xs font-semibold hover:text-primary transition-colors"
                  >
                    {notification.action_label} →
                  </Button>
                )}
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem 
          className="text-center justify-center cursor-pointer p-3 font-semibold text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-300"
          onClick={() => navigate('/profile/notifications')}
        >
          Tüm Bildirimleri Gör →
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};