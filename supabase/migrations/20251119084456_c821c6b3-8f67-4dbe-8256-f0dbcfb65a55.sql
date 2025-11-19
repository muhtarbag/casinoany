-- API Rate Limiting Protection System
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  function_name TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  banned_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_ip_function 
  ON public.api_rate_limits(ip_address, function_name);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window 
  ON public.api_rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_banned 
  ON public.api_rate_limits(banned_until) 
  WHERE banned_until IS NOT NULL;

-- RLS policies
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits (no user access needed)
CREATE POLICY "System can manage rate limits" ON public.api_rate_limits
  FOR ALL USING (true) WITH CHECK (true);

-- Auto-cleanup function for old records
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.api_rate_limits
  WHERE window_start < NOW() - INTERVAL '2 hours'
    AND (banned_until IS NULL OR banned_until < NOW());
END;
$$;