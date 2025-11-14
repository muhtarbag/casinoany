-- Create affiliate metrics sync edge function trigger
-- This will automatically populate affiliate_metrics daily

-- First, let's create a function to sync today's affiliate metrics
CREATE OR REPLACE FUNCTION sync_daily_affiliate_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_site RECORD;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Loop through all active affiliate sites
  FOR v_site IN 
    SELECT id 
    FROM betting_sites 
    WHERE is_active = true 
      AND affiliate_contract_date IS NOT NULL
  LOOP
    -- Get today's stats for this site
    INSERT INTO affiliate_metrics (
      site_id,
      metric_date,
      total_views,
      total_clicks,
      total_conversions,
      estimated_revenue
    )
    SELECT
      v_site.id,
      v_today,
      COALESCE(ca.total_views, 0) + COALESCE(ss.views, 0),
      COALESCE(ca.affiliate_clicks, 0) + COALESCE(ss.clicks, 0),
      COALESCE(conv_count.conversions, 0),
      COALESCE(conv_count.conversions, 0) * 10.0 -- Estimated $10 per conversion
    FROM betting_sites bs
    LEFT JOIN LATERAL (
      SELECT total_views, affiliate_clicks
      FROM casino_content_analytics
      WHERE site_id = v_site.id AND view_date = v_today
      LIMIT 1
    ) ca ON true
    LEFT JOIN LATERAL (
      SELECT views, clicks
      FROM site_stats
      WHERE site_id = v_site.id
      LIMIT 1
    ) ss ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) as conversions
      FROM conversions
      WHERE site_id = v_site.id 
        AND created_at::date = v_today
    ) conv_count ON true
    WHERE bs.id = v_site.id
    ON CONFLICT (site_id, metric_date) 
    DO UPDATE SET
      total_views = EXCLUDED.total_views,
      total_clicks = EXCLUDED.total_clicks,
      total_conversions = EXCLUDED.total_conversions,
      estimated_revenue = EXCLUDED.estimated_revenue,
      updated_at = now();
  END LOOP;
  
  RAISE NOTICE 'Affiliate metrics synced for %', v_today;
END;
$$;

-- Sync last 30 days of affiliate metrics on first run
DO $$
DECLARE
  v_date DATE;
BEGIN
  FOR v_date IN 
    SELECT generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, '1 day'::interval)::date
  LOOP
    -- Manually insert for each day
    INSERT INTO affiliate_metrics (site_id, metric_date, total_views, total_clicks, total_conversions, estimated_revenue)
    SELECT
      bs.id,
      v_date,
      COALESCE(ca.total_views, 0) + COALESCE(ss.views, 0),
      COALESCE(ca.affiliate_clicks, 0) + COALESCE(ss.clicks, 0),
      COALESCE(conv_count.conversions, 0),
      COALESCE(conv_count.conversions, 0) * 10.0
    FROM betting_sites bs
    LEFT JOIN LATERAL (
      SELECT total_views, affiliate_clicks
      FROM casino_content_analytics
      WHERE site_id = bs.id AND view_date = v_date
      LIMIT 1
    ) ca ON true
    LEFT JOIN LATERAL (
      SELECT views, clicks
      FROM site_stats
      WHERE site_id = bs.id
      LIMIT 1
    ) ss ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) as conversions
      FROM conversions
      WHERE site_id = bs.id 
        AND created_at::date = v_date
    ) conv_count ON true
    WHERE bs.is_active = true 
      AND bs.affiliate_contract_date IS NOT NULL
    ON CONFLICT (site_id, metric_date) DO NOTHING;
  END LOOP;
END;
$$;