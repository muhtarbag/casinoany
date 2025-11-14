-- Create bonus_requests table to store lead captures from notification popups
CREATE TABLE IF NOT EXISTS public.bonus_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_notification FOREIGN KEY (notification_id) REFERENCES public.site_notifications(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.bonus_requests ENABLE ROW LEVEL SECURITY;

-- Admin can view all requests
CREATE POLICY "Admins can view all bonus requests"
ON public.bonus_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Anyone can insert (for public form submissions)
CREATE POLICY "Anyone can submit bonus requests"
ON public.bonus_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bonus_requests_notification_id ON public.bonus_requests(notification_id);
CREATE INDEX IF NOT EXISTS idx_bonus_requests_created_at ON public.bonus_requests(created_at DESC);