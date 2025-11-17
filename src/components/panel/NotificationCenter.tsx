import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellOff, MessageSquare, AlertCircle, TrendingUp, Mail, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationCenterProps {
  siteId: string;
}

interface NotificationSettings {
  email_on_complaint: boolean;
  email_on_review: boolean;
  email_on_performance: boolean;
  email_on_admin_message: boolean;
  push_notifications: boolean;
}

export const NotificationCenter = ({ siteId }: NotificationCenterProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_on_complaint: true,
    email_on_review: true,
    email_on_performance: false,
    email_on_admin_message: true,
    push_notifications: true,
  });

  // Fetch recent notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['site-notifications', siteId],
    queryFn: async () => {
      // Şikayetler
      const { data: complaints, error: complaintsError } = await supabase
        .from('site_complaints')
        .select('id, title, created_at, status')
        .eq('site_id', siteId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (complaintsError) {
        console.error('Complaints fetch error:', complaintsError);
      }

      // Yorumlar
      const { data: reviews, error: reviewsError } = await supabase
        .from('site_reviews')
        .select('id, comment, rating, created_at')
        .eq('site_id', siteId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsError) {
        console.error('Reviews fetch error:', reviewsError);
      }

      return {
        complaints: complaints || [],
        reviews: reviews || [],
      };
    },
    enabled: !!siteId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Bell className="w-12 h-12 animate-pulse mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Bildirimler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Stats
  const unreadComplaints = notifications?.complaints?.filter(c => c.status === 'pending').length || 0;
  const totalNotifications = (notifications?.complaints?.length || 0) + (notifications?.reviews?.length || 0);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'complaint':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'review':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'performance':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Bildirim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotifications}</div>
            <p className="text-xs text-muted-foreground">Son 7 gün</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bekleyen Şikayetler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadComplaints}</div>
            <p className="text-xs text-muted-foreground">Yanıt bekliyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Yeni Yorumlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{notifications?.reviews.length || 0}</div>
            <p className="text-xs text-muted-foreground">Son 7 gün</p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirim Ayarları
          </CardTitle>
          <CardDescription>
            Hangi olaylar için bildirim almak istediğinizi seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-complaint">Yeni Şikayet</Label>
              <p className="text-sm text-muted-foreground">Site hakkında yeni şikayet geldiğinde</p>
            </div>
            <Switch
              id="email-complaint"
              checked={settings.email_on_complaint}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, email_on_complaint: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-review">Yeni Yorum</Label>
              <p className="text-sm text-muted-foreground">Site için yeni değerlendirme yapıldığında</p>
            </div>
            <Switch
              id="email-review"
              checked={settings.email_on_review}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, email_on_review: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-performance">Performans Raporları</Label>
              <p className="text-sm text-muted-foreground">Haftalık performans özeti</p>
            </div>
            <Switch
              id="email-performance"
              checked={settings.email_on_performance}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, email_on_performance: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-admin">Admin Mesajları</Label>
              <p className="text-sm text-muted-foreground">Platform yöneticilerinden gelen mesajlar</p>
            </div>
            <Switch
              id="email-admin"
              checked={settings.email_on_admin_message}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, email_on_admin_message: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push">Push Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">Tarayıcı üzerinden anlık bildirimler</p>
            </div>
            <Switch
              id="push"
              checked={settings.push_notifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, push_notifications: checked })
              }
            />
          </div>

          <Button className="w-full">
            Ayarları Kaydet
          </Button>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Son Bildirimler</CardTitle>
          <CardDescription>Son 7 günün bildirimleri</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                Tümü ({totalNotifications})
              </TabsTrigger>
              <TabsTrigger value="complaints">
                Şikayetler ({notifications?.complaints.length || 0})
              </TabsTrigger>
              <TabsTrigger value="reviews">
                Yorumlar ({notifications?.reviews.length || 0})
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              <TabsContent value="all" className="space-y-3">
                {!notifications || (notifications.complaints.length === 0 && notifications.reviews.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium">Henüz bildirim yok</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Son 7 gün içinde herhangi bir bildirim almadınız
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Şikayetler */}
                    {notifications?.complaints?.map((complaint) => (
                  <div
                    key={`complaint-${complaint.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {getNotificationIcon('complaint')}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{complaint.title}</p>
                        {complaint.status === 'pending' && (
                          <Badge variant="destructive" className="text-xs">Yeni</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(complaint.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Görüntüle
                    </Button>
                  </div>
                ))}

                {/* Yorumlar */}
                {notifications?.reviews.map((review) => (
                  <div
                    key={`review-${review.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {getNotificationIcon('review')}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          Yeni {review.rating} yıldızlı değerlendirme
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {review.comment}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                  </>
                )}

                {/* Eski empty state kaldırıldı */}
              </TabsContent>

              <TabsContent value="complaints" className="space-y-3">
                {!notifications || notifications.complaints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium">Henüz şikayet yok</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Son 7 gün içinde şikayet almadınız
                    </p>
                  </div>
                ) : (
                  notifications?.complaints?.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {getNotificationIcon('complaint')}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{complaint.title}</p>
                        {complaint.status === 'pending' && (
                          <Badge variant="destructive" className="text-xs">Yeni</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(complaint.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Görüntüle
                    </Button>
                  </div>
                ))
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-3">
                {!notifications || notifications.reviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium">Henüz yorum yok</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Son 7 gün içinde yorum almadınız
                    </p>
                  </div>
                ) : (
                  notifications?.reviews?.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {getNotificationIcon('review')}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          Yeni {review.rating} yıldızlı değerlendirme
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {review.comment}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </p>
                    </div>
                  </div>
                ))
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
