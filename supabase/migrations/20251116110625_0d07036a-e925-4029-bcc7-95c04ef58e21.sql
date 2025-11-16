-- Create PageSpeed history table
CREATE TABLE IF NOT EXISTS public.pagespeed_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  performance_score INTEGER,
  fcp NUMERIC,
  lcp NUMERIC,
  cls NUMERIC,
  tbt NUMERIC,
  si NUMERIC,
  strategy TEXT DEFAULT 'mobile',
  lighthouse_version TEXT,
  fetch_time NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  test_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pagespeed_history_test_date 
ON public.pagespeed_history(test_date DESC);

CREATE INDEX IF NOT EXISTS idx_pagespeed_history_url 
ON public.pagespeed_history(url, test_date DESC);

-- Enable RLS
ALTER TABLE public.pagespeed_history ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view PageSpeed history
CREATE POLICY "Anyone can view PageSpeed history"
ON public.pagespeed_history
FOR SELECT
USING (true);

-- Policy: Only admins can insert PageSpeed history
CREATE POLICY "Only service role can insert PageSpeed history"
ON public.pagespeed_history
FOR INSERT
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.pagespeed_history IS 'Stores Google PageSpeed Insights test results for performance monitoring';