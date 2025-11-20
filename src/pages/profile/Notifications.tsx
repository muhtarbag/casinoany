import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';

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
      return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950';
    case 'high':
      return 'border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950';
    case 'normal':
      return 'border-l-4 border-l-blue-500';
    case 'low':
      return 'border-l-4 border-l-gray-500';
    default:
      return 'border-l-4 border-l-blue-500';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'bonus':
      return 'Bonus';
    case 'campaign':
      return 'Kampanya';
    case 'achievement':
      return 'Başarım';
    case 'interaction':
      return 'Etkileşim';
    case 'system':
      return 'Sistem';
    default:
      return 'Bildirim';
  }
};

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isMarkingAsRead } = useUserNotifications();

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const NotificationCard = ({ notification, showUnreadDot = true }: any) => (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all ${!notification.is_read ? getPriorityColor(notification.priority) : ''}`}
      onClick={() => handleNotificationClick(notification)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-3xl">
            {getNotificationIcon(notification.notification_type, notification.icon)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {getTypeLabel(notification.notification_type)}
              </Badge>
              {!notification.is_read && showUnreadDot && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs text-blue-500 font-medium">Yeni</span>
                </div>
              )}
            </div>
            
            <h3 className={`font-semibold mb-1 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-2">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { 
                  addSuffix: true,
                  locale: tr 
                })}
              </span>
              
              {notification.action_label && (
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  {notification.action_label} →
                </Button>
              )}
            </div>
          </div>
          
          {notification.image_url && (
            <img 
              src={notification.image_url} 
              alt={notification.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProfileLayout>
      <SEO
        title="Bildirimlerim | CasinoAny"
        description="Bildirimlerinizi görüntüleyin ve yönetin"
      />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="w-8 h-8" />
              Bildirimlerim
            </h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 
                ? `${unreadCount} okunmamış bildiriminiz var` 
                : 'Tüm bildirimleriniz okundu'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              onClick={() => markAllAsRead()}
              disabled={isMarkingAsRead}
              variant="outline"
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="relative">
              Tümü
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="relative">
              Okunmamış
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Okunmuş</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Henüz bildiriminiz yok</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4 mt-6">
            {unreadNotifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">Tüm bildirimleriniz okundu!</p>
                </CardContent>
              </Card>
            ) : (
              unreadNotifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>

          <TabsContent value="read" className="space-y-4 mt-6">
            {readNotifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Okunmuş bildiriminiz yok</p>
                </CardContent>
              </Card>
            ) : (
              readNotifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} showUnreadDot={false} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProfileLayout>
  );
}