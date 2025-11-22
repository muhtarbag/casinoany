-- ============================================
-- ADVERTISING SYSTEM DATABASE SCHEMA
-- ============================================

-- 1. Ad Campaigns Table (Advertiser bilgileri)
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_name TEXT NOT NULL,
  advertiser_email TEXT NOT NULL,
  advertiser_phone TEXT,
  advertiser_company TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('banner', 'sponsored_content', 'featured_placement')),
  campaign_status TEXT NOT NULL DEFAULT 'pending' CHECK (campaign_status IN ('pending', 'active', 'paused', 'completed', 'rejected')),
  start_date DATE NOT NULL,
  end_date DATE,
  total_budget DECIMAL(10,2) DEFAULT 0,
  spent_budget DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  contract_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Ad Banners Table (Banner detayları)
CREATE TABLE IF NOT EXISTS public.ad_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  banner_name TEXT NOT NULL,
  banner_location TEXT NOT NULL CHECK (banner_location IN ('hero', 'sidebar', 'blog_inline', 'mobile_sticky', 'category_top', 'between_sites')),
  banner_size TEXT NOT NULL, -- e.g., '1920x400', '300x250'
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  click_url TEXT NOT NULL,
  alt_text TEXT,
  priority INTEGER DEFAULT 0, -- Higher priority = more likely to show
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  max_impressions INTEGER,
  max_clicks INTEGER,
  current_impressions INTEGER DEFAULT 0,
  current_clicks INTEGER DEFAULT 0,
  cpm_rate DECIMAL(10,2) DEFAULT 0, -- Cost per 1000 impressions
  cpc_rate DECIMAL(10,2) DEFAULT 0, -- Cost per click
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Ad Impressions Table (Tracking)
CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID NOT NULL REFERENCES public.ad_banners(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  impression_type TEXT NOT NULL CHECK (impression_type IN ('view', 'click')),
  page_path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  device_type TEXT,
  browser TEXT,
  ip_address TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Ad Settings Table (Global settings)
CREATE TABLE IF NOT EXISTS public.ad_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Ad Revenue Table (Monthly summary)
CREATE TABLE IF NOT EXISTS public.ad_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  revenue_date DATE NOT NULL,
  revenue_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  impressions_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  revenue_type TEXT NOT NULL CHECK (revenue_type IN ('cpm', 'cpc', 'fixed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, revenue_date)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ad_banners_location ON public.ad_banners(banner_location);
CREATE INDEX IF NOT EXISTS idx_ad_banners_active ON public.ad_banners(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ad_banners_campaign ON public.ad_banners(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_banners_dates ON public.ad_banners(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_ad_impressions_banner ON public.ad_impressions(banner_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_campaign ON public.ad_impressions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_type ON public.ad_impressions(impression_type);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_created ON public.ad_impressions(created_at);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(campaign_status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_dates ON public.ad_campaigns(start_date, end_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_revenue ENABLE ROW LEVEL SECURITY;

-- Ad Campaigns Policies
CREATE POLICY "Admin can manage ad campaigns"
  ON public.ad_campaigns FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active campaigns"
  ON public.ad_campaigns FOR SELECT
  USING (campaign_status = 'active');

-- Ad Banners Policies
CREATE POLICY "Admin can manage ad banners"
  ON public.ad_banners FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active banners"
  ON public.ad_banners FOR SELECT
  USING (
    is_active = true 
    AND start_date <= now() 
    AND (end_date IS NULL OR end_date >= now())
  );

-- Ad Impressions Policies
CREATE POLICY "Anyone can insert impressions"
  ON public.ad_impressions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can view all impressions"
  ON public.ad_impressions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Ad Settings Policies
CREATE POLICY "Admin can manage settings"
  ON public.ad_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view settings"
  ON public.ad_settings FOR SELECT
  USING (true);

-- Ad Revenue Policies
CREATE POLICY "Admin can manage revenue"
  ON public.ad_revenue FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Increment banner stats (impressions/clicks)
CREATE OR REPLACE FUNCTION public.increment_banner_stats(
  p_banner_id UUID,
  p_stat_type TEXT -- 'impression' or 'click'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_stat_type = 'impression' THEN
    UPDATE public.ad_banners
    SET current_impressions = current_impressions + 1,
        updated_at = now()
    WHERE id = p_banner_id;
  ELSIF p_stat_type = 'click' THEN
    UPDATE public.ad_banners
    SET current_clicks = current_clicks + 1,
        updated_at = now()
    WHERE id = p_banner_id;
  END IF;
END;
$$;

-- Function: Get active banner for location
CREATE OR REPLACE FUNCTION public.get_active_banner(
  p_location TEXT,
  p_limit INTEGER DEFAULT 1
)
RETURNS TABLE (
  id UUID,
  campaign_id UUID,
  banner_name TEXT,
  image_url TEXT,
  mobile_image_url TEXT,
  click_url TEXT,
  alt_text TEXT,
  priority INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ab.id,
    ab.campaign_id,
    ab.banner_name,
    ab.image_url,
    ab.mobile_image_url,
    ab.click_url,
    ab.alt_text,
    ab.priority
  FROM public.ad_banners ab
  JOIN public.ad_campaigns ac ON ac.id = ab.campaign_id
  WHERE ab.banner_location = p_location
    AND ab.is_active = true
    AND ac.campaign_status = 'active'
    AND ab.start_date <= now()
    AND (ab.end_date IS NULL OR ab.end_date >= now())
    AND (ab.max_impressions IS NULL OR ab.current_impressions < ab.max_impressions)
    AND (ab.max_clicks IS NULL OR ab.current_clicks < ab.max_clicks)
  ORDER BY ab.priority DESC, RANDOM()
  LIMIT p_limit;
END;
$$;

-- Function: Calculate daily revenue
CREATE OR REPLACE FUNCTION public.calculate_daily_ad_revenue(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_campaign RECORD;
BEGIN
  FOR v_campaign IN 
    SELECT DISTINCT campaign_id 
    FROM public.ad_impressions 
    WHERE DATE(created_at) = p_date
  LOOP
    INSERT INTO public.ad_revenue (
      campaign_id,
      revenue_date,
      impressions_count,
      clicks_count,
      revenue_amount,
      revenue_type
    )
    SELECT
      v_campaign.campaign_id,
      p_date,
      COUNT(*) FILTER (WHERE impression_type = 'view') as impressions,
      COUNT(*) FILTER (WHERE impression_type = 'click') as clicks,
      -- Calculate revenue based on banner settings
      COALESCE(
        (COUNT(*) FILTER (WHERE impression_type = 'view') / 1000.0) * MAX(ab.cpm_rate) +
        COUNT(*) FILTER (WHERE impression_type = 'click') * MAX(ab.cpc_rate),
        0
      ) as revenue,
      'cpm' as revenue_type
    FROM public.ad_impressions ai
    JOIN public.ad_banners ab ON ab.id = ai.banner_id
    WHERE ai.campaign_id = v_campaign.campaign_id
      AND DATE(ai.created_at) = p_date
    GROUP BY ai.campaign_id
    ON CONFLICT (campaign_id, revenue_date)
    DO UPDATE SET
      impressions_count = EXCLUDED.impressions_count,
      clicks_count = EXCLUDED.clicks_count,
      revenue_amount = EXCLUDED.revenue_amount;
  END LOOP;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at on campaigns
CREATE TRIGGER update_ad_campaigns_updated_at
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at on banners
CREATE TRIGGER update_ad_banners_updated_at
  BEFORE UPDATE ON public.ad_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at on settings
CREATE TRIGGER update_ad_settings_updated_at
  BEFORE UPDATE ON public.ad_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default settings
INSERT INTO public.ad_settings (setting_key, setting_value, description)
VALUES 
  ('system_enabled', '{"enabled": true}'::jsonb, 'Enable/disable entire ad system'),
  ('show_sponsored_label', '{"enabled": true, "text": "Sponsorlu"}'::jsonb, 'Show sponsored label on ads'),
  ('location_capacities', '{"hero": 1, "sidebar": 2, "blog_inline": 1, "mobile_sticky": 1, "category_top": 1, "between_sites": 3}'::jsonb, 'Max ads per location'),
  ('default_cpm_rates', '{"hero": 25, "sidebar": 15, "blog_inline": 20, "mobile_sticky": 30, "category_top": 18, "between_sites": 12}'::jsonb, 'Default CPM rates in EUR'),
  ('rotation_logic', '{"type": "priority_weighted", "random_factor": 0.2}'::jsonb, 'How to rotate ads'),
  ('cache_duration', '{"minutes": 5}'::jsonb, 'How long to cache ad queries')
ON CONFLICT (setting_key) DO NOTHING;