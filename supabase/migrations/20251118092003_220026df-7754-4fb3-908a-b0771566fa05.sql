-- Internal Linking AI Engine Database Schema
-- Enables AI-powered contextual linking across content

-- Create internal_links table for tracking suggested and active links
CREATE TABLE IF NOT EXISTS public.internal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_page TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'blog', 'casino', 'news', 'category'
  target_page TEXT NOT NULL,
  target_type TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  link_type TEXT NOT NULL DEFAULT 'contextual', -- 'contextual', 'related', 'breadcrumb', 'suggested'
  ai_relevance_score NUMERIC(3,2) CHECK (ai_relevance_score >= 0 AND ai_relevance_score <= 1),
  position_in_content INTEGER, -- Character position where link should be inserted
  context_snippet TEXT, -- Surrounding text for context
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_internal_links_source ON public.internal_links(source_page, source_type);
CREATE INDEX IF NOT EXISTS idx_internal_links_target ON public.internal_links(target_page, target_type);
CREATE INDEX IF NOT EXISTS idx_internal_links_active ON public.internal_links(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_internal_links_score ON public.internal_links(ai_relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_internal_links_created ON public.internal_links(created_at DESC);

-- Create link_performance table for tracking metrics
CREATE TABLE IF NOT EXISTS public.link_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.internal_links(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC(5,2) DEFAULT 0,
  avg_time_on_target INTEGER DEFAULT 0, -- seconds
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(link_id, date)
);

CREATE INDEX IF NOT EXISTS idx_link_performance_link ON public.link_performance(link_id);
CREATE INDEX IF NOT EXISTS idx_link_performance_date ON public.link_performance(date DESC);

-- RLS Policies
ALTER TABLE public.internal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_performance ENABLE ROW LEVEL SECURITY;

-- Allow admins full access to internal_links
CREATE POLICY "Admins can manage internal links"
  ON public.internal_links
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND status = 'approved'
    )
  );

-- Allow public read access to active links
CREATE POLICY "Public can view active internal links"
  ON public.internal_links
  FOR SELECT
  TO public
  USING (is_active = true);

-- Allow admins full access to link_performance
CREATE POLICY "Admins can view link performance"
  ON public.link_performance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND status = 'approved'
    )
  );

-- Function to update link performance CTR
CREATE OR REPLACE FUNCTION public.update_link_ctr()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.impressions > 0 THEN
    NEW.ctr := ROUND((NEW.clicks::numeric / NEW.impressions::numeric) * 100, 2);
  ELSE
    NEW.ctr := 0;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate CTR
CREATE TRIGGER calculate_link_ctr
  BEFORE INSERT OR UPDATE ON public.link_performance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_link_ctr();

-- Function to track link clicks
CREATE OR REPLACE FUNCTION public.track_internal_link_click(
  p_link_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update link click count
  UPDATE public.internal_links
  SET 
    click_count = click_count + 1,
    updated_at = now()
  WHERE id = p_link_id;
  
  -- Update daily performance
  INSERT INTO public.link_performance (link_id, date, clicks, impressions)
  VALUES (p_link_id, CURRENT_DATE, 1, 1)
  ON CONFLICT (link_id, date)
  DO UPDATE SET
    clicks = link_performance.clicks + 1,
    impressions = link_performance.impressions + 1,
    updated_at = now();
END;
$$;

-- Function to get related links for a page
CREATE OR REPLACE FUNCTION public.get_related_links(
  p_source_page TEXT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
  id UUID,
  target_page TEXT,
  anchor_text TEXT,
  link_type TEXT,
  relevance_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    il.id,
    il.target_page,
    il.anchor_text,
    il.link_type,
    il.ai_relevance_score as relevance_score
  FROM public.internal_links il
  WHERE il.source_page = p_source_page
    AND il.is_active = true
  ORDER BY il.ai_relevance_score DESC, il.click_count DESC
  LIMIT p_limit;
END;
$$;

-- Comment on tables
COMMENT ON TABLE public.internal_links IS 'AI-powered internal linking system for SEO optimization';
COMMENT ON TABLE public.link_performance IS 'Tracks performance metrics for internal links';

-- Grant necessary permissions
GRANT SELECT ON public.internal_links TO anon;
GRANT SELECT ON public.internal_links TO authenticated;
GRANT ALL ON public.internal_links TO service_role;

GRANT SELECT ON public.link_performance TO authenticated;
GRANT ALL ON public.link_performance TO service_role;