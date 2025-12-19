-- Create user notifications table for admin to send notifications to users
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'info' CHECK (notification_type IN ('info', 'success', 'warning', 'error', 'announcement')),
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'individual', 'corporate')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  action_url TEXT,
  action_label TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user notification reads table to track which users have read which notifications
CREATE TABLE IF NOT EXISTS public.user_notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.user_notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notifications
-- Admins can do everything
CREATE POLICY "Admins can manage all notifications"
  ON public.user_notifications
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can view notifications targeted to them
CREATE POLICY "Users can view their notifications"
  ON public.user_notifications
  FOR SELECT
  USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
    AND (
      target_audience = 'all'
      OR (target_audience = 'individual' AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'individual'
      ))
      OR (target_audience = 'corporate' AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'corporate'
      ))
    )
  );

-- RLS Policies for user_notification_reads
-- Admins can view all reads
CREATE POLICY "Admins can view all notification reads"
  ON public.user_notification_reads
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can manage their own reads
CREATE POLICY "Users can manage their own reads"
  ON public.user_notification_reads
  FOR ALL
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_user_notifications_target_audience ON public.user_notifications(target_audience);
CREATE INDEX idx_user_notifications_is_active ON public.user_notifications(is_active);
CREATE INDEX idx_user_notifications_expires_at ON public.user_notifications(expires_at);
CREATE INDEX idx_user_notification_reads_user_id ON public.user_notification_reads(user_id);
CREATE INDEX idx_user_notification_reads_notification_id ON public.user_notification_reads(notification_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_user_notifications_updated_at
  BEFORE UPDATE ON public.user_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get unread notification count for a user
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_user_type TEXT;
BEGIN
  -- Get user type
  SELECT user_type INTO v_user_type
  FROM profiles
  WHERE id = p_user_id;
  
  -- Count unread notifications
  SELECT COUNT(*) INTO v_count
  FROM user_notifications un
  WHERE un.is_active = true
    AND (un.expires_at IS NULL OR un.expires_at > now())
    AND (
      un.target_audience = 'all'
      OR (un.target_audience = 'individual' AND v_user_type = 'individual')
      OR (un.target_audience = 'corporate' AND v_user_type = 'corporate')
    )
    AND NOT EXISTS (
      SELECT 1 
      FROM user_notification_reads unr
      WHERE unr.notification_id = un.id
        AND unr.user_id = p_user_id
    );
  
  RETURN v_count;
END;
$$;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(p_notification_id UUID, p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_notification_reads (notification_id, user_id)
  VALUES (p_notification_id, p_user_id)
  ON CONFLICT (notification_id, user_id) DO NOTHING;
END;
$$;