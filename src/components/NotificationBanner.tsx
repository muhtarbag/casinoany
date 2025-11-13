import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
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

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('notification_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('notification_session_id', sessionId);
  }
  return sessionId;
};

export const NotificationBanner = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visibleBannerId, setVisibleBannerId] = useState<string | null>(null);
  const sessionId = getSessionId();

  const { data: notifications } = useQuery({
    queryKey: ['banner-notifications', location.pathname],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('site_notifications')
        .select('*')
        .eq('is_active', true)
        .eq('notification_type', 'banner')
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

  const { data: viewedNotifications } = useQuery({
    queryKey: ['viewed-banner-notifications', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_views')
        .select('notification_id, viewed_at')
        .eq('session_id', sessionId);
      
      if (error) throw error;
      return data;
    },
  });

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

  const trackClickMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notification_views')
        .update({ clicked: true, clicked_at: new Date().toISOString() })
        .eq('notification_id', notificationId)
        .eq('session_id', sessionId);
      
      if (error) throw error;
    },
  });

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

    const notificationToShow = notifications.find(notification => {
      const viewed = viewedNotifications.find(v => v.notification_id === notification.id);
      
      if (!viewed) return true;
      
      if (notification.display_frequency === 'always') return true;
      
      if (notification.display_frequency === 'daily') {
        const lastViewed = new Date(viewed.viewed_at);
        const now = new Date();
        const hoursSinceViewed = (now.getTime() - lastViewed.getTime()) / (1000 * 60 * 60);
        return hoursSinceViewed >= 24;
      }
      
      return false;
    });

    if (notificationToShow) {
      setVisibleBannerId(notificationToShow.id);
      trackViewMutation.mutate(notificationToShow.id);
    }
  }, [notifications, viewedNotifications]);

  const handleClose = () => {
    if (visibleBannerId) {
      trackDismissMutation.mutate(visibleBannerId);
      setVisibleBannerId(null);
    }
  };

  const handleButtonClick = (notification: Notification) => {
    trackClickMutation.mutate(notification.id);
    
    if (notification.button_url) {
      if (notification.button_url.startsWith('http')) {
        window.open(notification.button_url, '_blank');
      } else {
        navigate(notification.button_url);
      }
    }
  };

  const currentNotification = notifications?.find(n => n.id === visibleBannerId);

  if (!currentNotification || !visibleBannerId) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 shadow-lg"
      style={{
        backgroundColor: currentNotification.background_color || undefined,
        color: currentNotification.text_color || undefined,
      }}
    >
      <Alert className="rounded-none border-0 relative" style={{ backgroundColor: 'transparent' }}>
        <div className="container mx-auto flex items-center justify-between gap-4 py-2">
          {currentNotification.image_url && (
            <img
              src={currentNotification.image_url}
              alt={currentNotification.title}
              className="h-12 w-12 object-cover rounded"
            />
          )}
          
          <div className="flex-1">
            <AlertTitle className="text-lg font-bold mb-1">
              {currentNotification.title}
            </AlertTitle>
            {currentNotification.content && (
              <AlertDescription className="opacity-90">
                {currentNotification.content}
              </AlertDescription>
            )}
          </div>

          {currentNotification.button_text && (
            <Button
              onClick={() => handleButtonClick(currentNotification)}
              size="sm"
              className="whitespace-nowrap"
            >
              {currentNotification.button_text}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
};
