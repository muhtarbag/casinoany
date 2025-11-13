-- Create casino content analytics table
CREATE TABLE IF NOT EXISTS public.casino_content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  view_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_views INTEGER DEFAULT 0,
  block_interactions JSONB DEFAULT '{}'::jsonb,
  affiliate_clicks INTEGER DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0,
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(site_id, view_date)
);

-- Enable RLS
ALTER TABLE public.casino_content_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage analytics"
  ON public.casino_content_analytics
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can insert analytics"
  ON public.casino_content_analytics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update analytics"
  ON public.casino_content_analytics
  FOR UPDATE
  USING (true);

-- Index for faster queries
CREATE INDEX idx_analytics_site_date 
  ON public.casino_content_analytics(site_id, view_date DESC);

-- Function to increment analytics
CREATE OR REPLACE FUNCTION public.increment_casino_analytics(
  p_site_id UUID,
  p_block_name TEXT DEFAULT NULL,
  p_is_affiliate_click BOOLEAN DEFAULT FALSE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.casino_content_analytics (site_id, view_date, total_views, affiliate_clicks, block_interactions)
  VALUES (
    p_site_id, 
    CURRENT_DATE, 
    CASE WHEN p_block_name IS NULL THEN 1 ELSE 0 END,
    CASE WHEN p_is_affiliate_click THEN 1 ELSE 0 END,
    CASE WHEN p_block_name IS NOT NULL THEN jsonb_build_object(p_block_name, 1) ELSE '{}'::jsonb END
  )
  ON CONFLICT (site_id, view_date) 
  DO UPDATE SET
    total_views = casino_content_analytics.total_views + CASE WHEN p_block_name IS NULL THEN 1 ELSE 0 END,
    affiliate_clicks = casino_content_analytics.affiliate_clicks + CASE WHEN p_is_affiliate_click THEN 1 ELSE 0 END,
    block_interactions = CASE 
      WHEN p_block_name IS NOT NULL THEN
        casino_content_analytics.block_interactions || 
        jsonb_build_object(
          p_block_name, 
          COALESCE((casino_content_analytics.block_interactions->p_block_name)::int, 0) + 1
        )
      ELSE casino_content_analytics.block_interactions
    END,
    updated_at = now();
END;
$$;