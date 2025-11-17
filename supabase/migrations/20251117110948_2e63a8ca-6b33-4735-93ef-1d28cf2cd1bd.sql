-- First, add owner_id column to betting_sites if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'betting_sites' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.betting_sites 
    ADD COLUMN owner_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create site_owner_notifications table for real-time notifications
CREATE TABLE IF NOT EXISTS public.site_owner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_owner_notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_site_owner_notifications_site_id ON public.site_owner_notifications(site_id);
CREATE INDEX IF NOT EXISTS idx_site_owner_notifications_created_at ON public.site_owner_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_owner_notifications_is_read ON public.site_owner_notifications(is_read);

-- RLS Policies
CREATE POLICY "Site owners can view their notifications"
  ON public.site_owner_notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.betting_sites
      WHERE betting_sites.id = site_owner_notifications.site_id
      AND betting_sites.owner_id = auth.uid()
    )
  );

CREATE POLICY "Site owners can update their notifications"
  ON public.site_owner_notifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.betting_sites
      WHERE betting_sites.id = site_owner_notifications.site_id
      AND betting_sites.owner_id = auth.uid()
    )
  );

-- Notification creation function
CREATE OR REPLACE FUNCTION public.create_site_notification(
  p_site_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.site_owner_notifications (
    site_id, type, title, message, action_url
  ) VALUES (
    p_site_id, p_type, p_title, p_message, p_action_url
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Trigger for new complaints
CREATE OR REPLACE FUNCTION public.notify_on_new_complaint()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.create_site_notification(
    NEW.site_id,
    'complaint',
    'Yeni Şikayet',
    'Siteniz hakkında yeni şikayet: ' || NEW.title,
    '/panel/site-management'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_complaint ON public.site_complaints;
CREATE TRIGGER trigger_notify_new_complaint
  AFTER INSERT ON public.site_complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_complaint();

-- Trigger for approved reviews
CREATE OR REPLACE FUNCTION public.notify_on_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.is_approved = TRUE AND (OLD IS NULL OR OLD.is_approved = FALSE) THEN
    PERFORM public.create_site_notification(
      NEW.site_id,
      'review',
      'Yeni Değerlendirme',
      NEW.rating || ' yıldız aldınız',
      '/panel/site-management'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_review ON public.site_reviews;
CREATE TRIGGER trigger_notify_new_review
  AFTER INSERT OR UPDATE ON public.site_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_review();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_owner_notifications;