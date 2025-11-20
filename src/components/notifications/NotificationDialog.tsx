import { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  title: string;
  message: string;
  image_url?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  background_color?: string | null;
  text_color?: string | null;
  form_fields?: string[] | null;
}

interface NotificationDialogProps {
  notification: Notification | null;
  open: boolean;
  onClose: () => void;
  onButtonClick?: () => void;
  children?: React.ReactNode;
}

export const NotificationDialog = memo(({
  notification,
  open,
  onClose,
  onButtonClick,
  children,
}: NotificationDialogProps) => {
  if (!notification) return null;

  const bgColor = notification.background_color || '#ffffff';
  const textColor = notification.text_color || '#000000';
  const brightness = parseInt(bgColor.replace('#', ''), 16);
  const isDark = brightness < 8000000;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md border-0 p-0 gap-0 overflow-hidden"
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className={`absolute right-2 top-2 z-10 rounded-full ${
            isDark ? 'text-white hover:bg-white/20' : 'text-black hover:bg-black/10'
          }`}
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {notification.image_url && (
          <div className="w-full h-48 overflow-hidden">
            <img
              src={notification.image_url}
              alt={notification.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold" style={{ color: textColor }}>
              {notification.title}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm leading-relaxed" style={{ color: textColor }}>
            {notification.message}
          </p>

          {children}

          {notification.button_text && !notification.form_fields?.length && (
            <Button
              onClick={onButtonClick}
              className="w-full"
              style={{
                backgroundColor: textColor,
                color: bgColor,
              }}
            >
              {notification.button_text}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

NotificationDialog.displayName = 'NotificationDialog';
