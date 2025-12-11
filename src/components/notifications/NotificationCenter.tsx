import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Check, AlertCircle, Info, CheckCircle, XCircle, CheckCheck, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast } from '@/lib/toastHelpers';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

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
      // Silent fail
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
      // Silent fail
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative group hover:bg-primary/10 transition-all duration-300"
        >
          <motion.div
            whileHover={{ rotate: [0, -15, 15, -15, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Bell className="w-5 h-5 group-hover:text-primary transition-colors" />
          </motion.div>
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge
                  variant="destructive"
                  className="h-5 w-5 flex items-center justify-center p-0 text-xs font-bold shadow-lg animate-pulse bg-gradient-to-r from-destructive to-destructive/80"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[420px] p-0 border-border/50 shadow-2xl bg-card/95 backdrop-blur-xl" 
        align="end"
      >
        {/* Header with gradient */}
        <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent" />
          <div className="relative flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Bildirimler</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="mt-1">
                    {unreadCount} okunmamış
                  </Badge>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-all"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Tümünü Okundu İşaretle</span>
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[520px]">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 px-6 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                  <Bell className="w-16 h-16 text-primary/40" />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <p className="font-semibold text-lg">Henüz bildirim yok</p>
                <p className="text-sm text-muted-foreground">
                  Yeni bildirimler burada görünecek
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="p-2">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification, index) => {
                  const Icon = notificationIcons[notification.type];
                  const colorClass = notificationColors[notification.type];

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'group relative mb-2 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden',
                        !notification.read && 'ring-2 ring-primary/20 bg-primary/5'
                      )}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      {!notification.read && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      
                      <div className="relative p-4">
                        <div className="flex items-start gap-4">
                          <div className={cn('p-2.5 rounded-xl bg-opacity-10 shrink-0', colorClass)}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-semibold text-sm">{notification.title}</span>
                              {!notification.read && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex items-center gap-1.5"
                                >
                                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 h-5">
                                    Yeni
                                  </Badge>
                                </motion.div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: tr,
                                })}
                              </p>
                              {notification.action && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-primary hover:text-primary/80"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(notification.action!.url);
                                    setOpen(false);
                                  }}
                                >
                                  {notification.action.label} →
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
