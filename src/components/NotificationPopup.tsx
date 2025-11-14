import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  user_segments: string[];
  background_color: string | null;
  text_color: string | null;
  trigger_type: string;
  trigger_conditions: any;
  form_fields?: {
    email_label: string;
    phone_label: string;
    submit_text: string;
    success_message: string;
    privacy_text: string;
  } | null;
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

// Kullanıcı segmentini belirle
const getUserSegment = (user: any): string => {
  // Kayıtlı kullanıcı mı?
  if (user) return 'registered';
  
  // Anonim kullanıcı için ziyaret geçmişi kontrol et
  const visitHistory = localStorage.getItem('visit_history');
  
  if (!visitHistory) {
    // İlk kez ziyaret - yeni ziyaretçi
    const history = {
      firstVisit: new Date().toISOString(),
      visitCount: 1,
      lastVisit: new Date().toISOString()
    };
    localStorage.setItem('visit_history', JSON.stringify(history));
    return 'new_visitor';
  }
  
  // Tekrar gelen ziyaretçi
  try {
    const history = JSON.parse(visitHistory);
    history.visitCount = (history.visitCount || 1) + 1;
    history.lastVisit = new Date().toISOString();
    localStorage.setItem('visit_history', JSON.stringify(history));
    return 'returning_visitor';
  } catch {
    return 'anonymous';
  }
};

export const NotificationPopup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [openNotificationId, setOpenNotificationId] = useState<string | null>(null);
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sessionId = getSessionId();

  // Admin paneldeyse bildirimleri gösterme
  const isAdminPanel = location.pathname.startsWith('/admin');
  
  // Kullanıcı segmentini belirle
  const userSegment = getUserSegment(user);

  // Aktif bildirimleri getir
  const { data: notifications } = useQuery({
    queryKey: ['active-notifications', location.pathname, userSegment],
    queryFn: async () => {
      // Admin paneldeyse boş dön
      if (isAdminPanel) return [];
      
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
      
      // Sayfa ve kullanıcı segmentine göre filtrele
      return (data as Notification[]).filter(n => {
        const pageMatch = n.display_pages?.includes('all') || n.display_pages?.includes(currentPage);
        const segmentMatch = n.user_segments?.includes('all') || n.user_segments?.includes(userSegment);
        return pageMatch && segmentMatch;
      });
    },
  });

  const [timeOnPage, setTimeOnPage] = useState(0);
  const [shouldShow, setShouldShow] = useState(false);

  const { data: viewedNotifications } = useQuery({
    queryKey: ['viewed-notifications', sessionId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('notification_views')
        .select('notification_id, viewed_at, dismissed')
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
    onSuccess: () => {
      // Query'i invalidate et ki yeni data yüklensin
      queryClient.invalidateQueries({ queryKey: ['viewed-notifications', sessionId] });
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
    onSuccess: () => {
      // Query'i invalidate et ki kapatılan bildirim bir daha gelmesin
      queryClient.invalidateQueries({ queryKey: ['viewed-notifications', sessionId] });
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
    // Zaten bir bildirim açıksa tekrar kontrol etme
    if (openNotificationId) return;

    const notificationToShow = notifications.find(notification => {
      const viewed = viewedNotifications.find(v => v.notification_id === notification.id);
      
      // Dismissed bildirimler asla gösterilmez
      if (viewed && viewed.dismissed) {
        return false;
      }
      
      // Hiç görüntülenmemişse göster
      if (!viewed) {
        return checkTrigger(notification);
      }
      
      // "once" - bir kere gösterildiyse bir daha gösterme
      if (notification.display_frequency === 'once') {
        return false;
      }
      
      // "always" - her zaman göster (dismissed olmadığı sürece)
      if (notification.display_frequency === 'always') {
        return checkTrigger(notification);
      }
      
      // "daily" - 24 saat geçtiyse tekrar göster
      if (notification.display_frequency === 'daily') {
        const lastViewed = new Date(viewed.viewed_at);
        const now = new Date();
        const hoursSinceViewed = (now.getTime() - lastViewed.getTime()) / (1000 * 60 * 60);
        return hoursSinceViewed >= 24 && checkTrigger(notification);
      }
      
      // "session" - bu session'da zaten görüldü
      if (notification.display_frequency === 'session') {
        return false;
      }
      
      return false;
    });

    if (notificationToShow && shouldShow) {
      setOpenNotificationId(notificationToShow.id);
      trackViewMutation.mutate(notificationToShow.id);
    }
  }, [notifications, viewedNotifications, shouldShow, openNotificationId]);

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
      setFormEmail('');
      setFormPhone('');
      setFormSubmitted(false);
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!openNotificationId || !formEmail || !formPhone) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await (supabase as any)
        .from('bonus_requests')
        .insert([{
          notification_id: openNotificationId,
          email: formEmail,
          phone: formPhone,
          ip_address: null, // Can be collected from headers if needed
          user_agent: navigator.userAgent,
        }]);
      
      if (error) throw error;
      
      trackClickMutation.mutate(openNotificationId);
      setFormSubmitted(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);
      
    } catch (error: any) {
      console.error('Form submission error:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
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

            {/* Form Section - if form_fields exist */}
            {currentNotification.form_fields && !formSubmitted && (
              <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="bonus-email" className="text-sm font-medium">
                    {currentNotification.form_fields.email_label}
                  </Label>
                  <Input
                    id="bonus-email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    required
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bonus-phone" className="text-sm font-medium">
                    {currentNotification.form_fields.phone_label}
                  </Label>
                  <Input
                    id="bonus-phone"
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    required
                    className="bg-background/50"
                  />
                </div>

                {currentNotification.form_fields.privacy_text && (
                  <p className="text-xs opacity-75">
                    {currentNotification.form_fields.privacy_text}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Gönderiliyor...' : currentNotification.form_fields.submit_text}
                </Button>
              </form>
            )}

            {/* Success Message */}
            {formSubmitted && currentNotification.form_fields && (
              <div className="text-center py-6 space-y-2">
                <p className="text-lg font-semibold">
                  {currentNotification.form_fields.success_message}
                </p>
              </div>
            )}

            {/* Regular Button - only show if no form_fields or form already submitted */}
            {!currentNotification.form_fields && currentNotification.button_text && (
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