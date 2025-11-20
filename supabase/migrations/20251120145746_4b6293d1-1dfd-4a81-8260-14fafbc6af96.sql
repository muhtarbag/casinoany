-- Create site addition requests table
CREATE TABLE IF NOT EXISTS public.site_addition_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_name TEXT NOT NULL,
  site_url TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_site_id UUID REFERENCES public.betting_sites(id)
);

-- Enable RLS
ALTER TABLE public.site_addition_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON public.site_addition_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create requests
CREATE POLICY "Users can create requests"
  ON public.site_addition_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON public.site_addition_requests
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update requests
CREATE POLICY "Admins can update requests"
  ON public.site_addition_requests
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to notify user on request status change
CREATE OR REPLACE FUNCTION public.notify_user_on_request_status()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
  action_url TEXT;
BEGIN
  -- Only send notification when status changes from pending
  IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
    IF NEW.status = 'approved' THEN
      notification_title := 'Site Ekleme Talebi Onaylandı';
      notification_message := 'Talep ettiğiniz "' || NEW.site_name || '" platformumuza eklendi! Artık şikayet oluşturabilirsiniz.';
      notification_type := 'success';
      action_url := '/sikayet-olustur';
    ELSIF NEW.status = 'rejected' THEN
      notification_title := 'Site Ekleme Talebi Reddedildi';
      notification_message := 'Talep ettiğiniz "' || NEW.site_name || '" için ekleme talebiniz reddedildi.';
      IF NEW.rejection_reason IS NOT NULL AND NEW.rejection_reason != '' THEN
        notification_message := notification_message || ' Sebep: ' || NEW.rejection_reason;
      END IF;
      notification_type := 'error';
      action_url := NULL;
    END IF;

    INSERT INTO public.user_status_notifications (
      user_id,
      title,
      message,
      type,
      action_url,
      metadata
    ) VALUES (
      NEW.user_id,
      notification_title,
      notification_message,
      notification_type,
      action_url,
      jsonb_build_object(
        'request_id', NEW.id,
        'site_name', NEW.site_name,
        'site_url', NEW.site_url,
        'status', NEW.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_notify_on_request_status
  AFTER UPDATE ON public.site_addition_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_on_request_status();

-- Create index for performance
CREATE INDEX idx_site_addition_requests_user_id ON public.site_addition_requests(user_id);
CREATE INDEX idx_site_addition_requests_status ON public.site_addition_requests(status);
CREATE INDEX idx_site_addition_requests_created_at ON public.site_addition_requests(created_at DESC);