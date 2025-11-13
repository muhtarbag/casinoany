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
  trigger_type: string;
  trigger_conditions: any;
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
      
      const { data, error } = await (supabase as any)
        .from('site_notifications')
        .select('*')
        .eq('is_active', true)
        .eq('notification_type', 'popup')
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('priority', { ascending: false });
      
      if (error) throw error;
      
      const currentPage = location.pathname === '/' ? 'home' : location.pathname.split('/')[1];
      return (data as Notification[]).filter(n => 
        n.display_pages?.includes('all') || 
        n.display_pages?.includes(currentPage)
      );
    },
  });

  const [timeOnPage, setTimeOnPage] = useState(0);
  const [shouldShow, setShouldShow] = useState(false);

  const { data: viewedNotifications } = useQuery({
    queryKey: ['viewed-notifications', sessionId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('notification_views')
        .select('notification_id, viewed_at')
        .eq('session_id', sessionId);
      
      if (error) throw error;
      return data;
    },
  });

  const trackViewMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await (supabase as any)
        .from('notification_views')
        .insert([{
          notification_id: notificationId,
          user_id: user?.id,
          session_id: sessionId,
          dismissed: false,
          clicked: false
        }]);
      
      if (error) throw error;
    },
  });

  const trackClickMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await (supabase as any)
        .from('notification_views')
        .update({ clicked: true, clicked_at: new Date().toISOString() })
        .eq('notification_id', notificationId)
        .eq('session_id', sessionId);
      
      if (error) throw error;
    },
  });

  const trackDismissMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await (supabase as any)
        .from('notification_views')
        .update({ dismissed: true })
        .eq('notification_id', notificationId)
        .eq('session_id', sessionId);
      
      if (error) throw error;
    },
  });

  // Timer for time_on_page trigger
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOnPage(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!notifications || !viewedNotifications) return;

    const notificationToShow = notifications.find(notification => {
      const viewed = viewedNotifications.find(v => v.notification_id === notification.id);
      
      if (!viewed) {
        return checkTrigger(notification);
      }
      
      if (notification.display_frequency === 'always') {
        return checkTrigger(notification);
      }
      
      if (notification.display_frequency === 'daily') {
        const lastViewed = new Date(viewed.viewed_at);
        const now = new Date();
        const hoursSinceViewed = (now.getTime() - lastViewed.getTime()) / (1000 * 60 * 60);
        return hoursSinceViewed >= 24 && checkTrigger(notification);
      }
      
      if (notification.display_frequency === 'session') {
        return false;
      }
      
      return false;
    });

    if (notificationToShow && shouldShow) {
      setOpenNotificationId(notificationToShow.id);
      trackViewMutation.mutate(notificationToShow.id);
    }
  }, [notifications, viewedNotifications, timeOnPage, shouldShow]);

  const checkTrigger = (notification: Notification) => {
    const { trigger_type, trigger_conditions } = notification;

    switch (trigger_type) {
      case 'instant':
        setShouldShow(true);
        return true;
      
      case 'time_on_page':
        const requiredTime = trigger_conditions?.seconds || 10;
        if (timeOnPage >= requiredTime) {
          setShouldShow(true);
          return true;
        }
        return false;
      
      case 'scroll_depth':
        // Can be implemented with scroll tracking
        return false;
      
      case 'exit_intent':
        // Can be implemented with mouse tracking
        return false;
      
      default:
        setShouldShow(true);
        return true;
    }
  };

  const handleClose = () => {
    if (openNotificationId) {
      trackDismissMutation.mutate(openNotificationId);
      setOpenNotificationId(null);
    }
  };

  const handleButtonClick = (url: string | null) => {
    if (openNotificationId) {
      trackClickMutation.mutate(openNotificationId);
    }
    
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