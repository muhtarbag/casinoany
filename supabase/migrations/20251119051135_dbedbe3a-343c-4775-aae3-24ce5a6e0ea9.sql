-- Add Telegram notification settings to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
ADD COLUMN IF NOT EXISTS telegram_notifications_enabled BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.profiles.telegram_chat_id IS 'User Telegram chat ID for notifications';
COMMENT ON COLUMN public.profiles.telegram_notifications_enabled IS 'Whether user wants to receive Telegram notifications';

-- Add Telegram notification preferences to site owners
CREATE TABLE IF NOT EXISTS public.site_owner_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_chat_id TEXT,
  telegram_enabled BOOLEAN DEFAULT false,
  notify_on_review BOOLEAN DEFAULT true,
  notify_on_complaint BOOLEAN DEFAULT true,
  notify_on_system_message BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.site_owner_notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own notification settings"
ON public.site_owner_notification_settings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all notification settings"
ON public.site_owner_notification_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_site_owner_notification_settings_updated_at
  BEFORE UPDATE ON public.site_owner_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();