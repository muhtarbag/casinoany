import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  notification_type: string;
  button_text: string | null;
  button_url: string | null;
  display_frequency: string;
  display_pages: string[];
  background_color: string | null;
  text_color: string | null;
}

// Oturum ID'si oluştur
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('notification_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('notification_session_id', sessionId);
  }
  return sessionId;
};

export const NotificationPopup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openNotificationId, setOpenNotificationId] = useState<string | null>(null);
  const sessionId = getSessionId();

  // Aktif bildirimleri getir
  const { data: notifications } = useQuery({
    queryKey: ['active-notifications', location.pathname],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('site_notifications')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('priority', { ascending: false });
      
      if (error) throw error;
      
      // Sayfaya göre filtrele
      const currentPage = location.pathname === '/' ? 'home' : location.pathname.split('/')[1];
      return (data as Notification[]).filter(n => 
        n.display_pages?.includes('all') || 
        n.display_pages?.includes(currentPage)
      );
    },
  });

  // Görüntülenenleri getir
  const { data: viewedNotifications } = useQuery({
    queryKey: ['viewed-notifications', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_views')
        .select('notification_id, viewed_at')
        .eq('session_id', sessionId);
      
      if (error) throw error;
      return data;
    },
  });

  // Görüntüleme kaydı
  const trackViewMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notification_views')
        .insert([{
          notification_id: notificationId,
          user_id: user?.id,
          session_id: sessionId,
          dismissed: false
        }]);
      
      if (error) throw error;
    },
  });

  // Kapatma kaydı
  const trackDismissMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notification_views')
        .update({ dismissed: true })
        .eq('notification_id', notificationId)
        .eq('session_id', sessionId);
      
      if (error) throw error;
    },
  });

  useEffect(() => {
    if (!notifications || !viewedNotifications) return;

    // Gösterilecek bildirimi bul
    const notificationToShow = notifications.find(notification => {
      const viewed = viewedNotifications.find(v => v.notification_id === notification.id);
      
      if (!viewed) {
        // Hiç görülmemiş
        return true;
      }
      
      // Görülme sıklığına göre kontrol et
      if (notification.display_frequency === 'always') {
        return true;
      }
      
      if (notification.display_frequency === 'daily') {
        const lastViewed = new Date(viewed.viewed_at);
        const now = new Date();
        const hoursSinceViewed = (now.getTime() - lastViewed.getTime()) / (1000 * 60 * 60);
        return hoursSinceViewed >= 24;
      }
      
      if (notification.display_frequency === 'session') {
        // Session için her oturumda bir kez göster
        return false;
      }
      
      // 'once' için bir kez gösterildi mi kontrol et
      return false;
    });

    if (notificationToShow && notificationToShow.notification_type === 'popup') {
      setOpenNotificationId(notificationToShow.id);
      trackViewMutation.mutate(notificationToShow.id);
    }
  }, [notifications, viewedNotifications]);

  const handleClose = () => {
    if (openNotificationId) {
      trackDismissMutation.mutate(openNotificationId);
      setOpenNotificationId(null);
    }
  };

  const handleButtonClick = (url: string | null) => {
    if (url) {
      if (url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        navigate(url);
      }
      handleClose();
    }
  };

  const currentNotification = notifications?.find(n => n.id === openNotificationId);

  if (!currentNotification) return null;

  return (
    <Dialog open={!!openNotificationId} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="max-w-2xl p-0 overflow-hidden"
        style={{
          backgroundColor: currentNotification.background_color || undefined,
          color: currentNotification.text_color || undefined,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="space-y-4">
          {currentNotification.image_url && (
            <div className="w-full">
              <img
                src={currentNotification.image_url}
                alt={currentNotification.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="p-6 space-y-4">
            <DialogTitle className="text-2xl font-bold">
              {currentNotification.title}
            </DialogTitle>

            {currentNotification.content && (
              <p className="text-lg opacity-90">
                {currentNotification.content}
              </p>
            )}

            {currentNotification.button_text && (
              <Button
                onClick={() => handleButtonClick(currentNotification.button_url)}
                className="w-full"
                size="lg"
              >
                {currentNotification.button_text}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};