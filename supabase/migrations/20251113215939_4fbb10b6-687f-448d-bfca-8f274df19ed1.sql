-- Create notifications/popups table
CREATE TABLE public.site_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  notification_type TEXT NOT NULL DEFAULT 'popup', -- popup, banner, toast
  target_url TEXT,
  button_text TEXT,
  button_url TEXT,
  is_active BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  display_pages TEXT[] DEFAULT ARRAY['all'], -- all, home, site-detail, blog, etc.
  display_frequency TEXT DEFAULT 'once', -- once, daily, always, session
  priority INTEGER DEFAULT 0,
  background_color TEXT,
  text_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create notification views tracking table
CREATE TABLE public.notification_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES public.site_notifications(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  dismissed BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.site_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_views ENABLE ROW LEVEL SECURITY;

-- Policies for site_notifications
CREATE POLICY "Anyone can view active notifications"
ON public.site_notifications
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage notifications"
ON public.site_notifications
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for notification_views
CREATE POLICY "Anyone can insert notification views"
ON public.notification_views
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own notification views"
ON public.notification_views
FOR SELECT
USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Admins can view all notification views"
ON public.notification_views
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for notification images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notification-images', 'notification-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view notification images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'notification-images');

CREATE POLICY "Admins can upload notification images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'notification-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notification images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'notification-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete notification images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'notification-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_site_notifications_updated_at
BEFORE UPDATE ON public.site_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_site_notifications_active ON public.site_notifications(is_active);
CREATE INDEX idx_site_notifications_dates ON public.site_notifications(start_date, end_date);
CREATE INDEX idx_notification_views_notification_id ON public.notification_views(notification_id);
CREATE INDEX idx_notification_views_session ON public.notification_views(session_id);