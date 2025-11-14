-- ===================================
-- CRITICAL FIX #1: Casino Analytics Bounce Rate & Time on Page
-- ===================================

-- Update increment_casino_analytics to calculate bounce_rate and avg_time_on_page
CREATE OR REPLACE FUNCTION public.increment_casino_analytics(
  p_site_id uuid, 
  p_block_name text DEFAULT NULL::text, 
  p_is_affiliate_click boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_bounce_rate numeric;
  v_avg_time numeric;
BEGIN
  -- Calculate bounce rate from analytics_sessions for this site today
  SELECT 
    COALESCE(
      ROUND(
        (COUNT(*) FILTER (WHERE is_bounce = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
        2
      ),
      0
    ),
    COALESCE(AVG(total_duration), 0)
  INTO v_bounce_rate, v_avg_time
  FROM analytics_sessions
  WHERE landing_page LIKE '%' || (SELECT slug FROM betting_sites WHERE id = p_site_id LIMIT 1) || '%'
    AND DATE(created_at) = CURRENT_DATE;

  -- Insert or update casino content analytics
  INSERT INTO public.casino_content_analytics (
    site_id, 
    view_date, 
    total_views, 
    affiliate_clicks, 
    block_interactions,
    bounce_rate,
    avg_time_on_page
  )
  VALUES (
    p_site_id, 
    CURRENT_DATE, 
    CASE WHEN p_block_name IS NULL THEN 1 ELSE 0 END,
    CASE WHEN p_is_affiliate_click THEN 1 ELSE 0 END,
    CASE WHEN p_block_name IS NOT NULL THEN jsonb_build_object(p_block_name, 1) ELSE '{}'::jsonb END,
    v_bounce_rate,
    ROUND(v_avg_time)
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
    bounce_rate = v_bounce_rate,
    avg_time_on_page = ROUND(v_avg_time),
    updated_at = now();
END;
$function$;

-- ===================================
-- CRITICAL FIX #2: Affiliate Metrics Historical Data Correction
-- ===================================

-- Delete incorrect historical data (before today)
DELETE FROM affiliate_metrics 
WHERE metric_date < CURRENT_DATE;

-- Update sync_daily_affiliate_metrics to calculate daily incremental values
CREATE OR REPLACE FUNCTION public.sync_daily_affiliate_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_site RECORD;
  v_date DATE := CURRENT_DATE - INTERVAL '1 day';  -- Process yesterday's data
BEGIN
  -- Loop through all active affiliate sites
  FOR v_site IN 
    SELECT id, slug
    FROM betting_sites 
    WHERE is_active = true 
      AND affiliate_contract_date IS NOT NULL
  LOOP
    -- Calculate metrics for the specific date
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
      v_date,
      -- Count page views for this site on this specific date
      COALESCE(
        (SELECT COUNT(*) 
         FROM page_views 
         WHERE page_path LIKE '%' || v_site.slug || '%'
           AND DATE(created_at) = v_date),
        0
      ),
      -- Count affiliate clicks from conversions for this date
      COALESCE(
        (SELECT COUNT(*) 
         FROM conversions 
         WHERE site_id = v_site.id 
           AND conversion_type = 'affiliate_click'
           AND DATE(created_at) = v_date),
        0
      ),
      -- Count total conversions for this date
      COALESCE(
        (SELECT COUNT(*) 
         FROM conversions 
         WHERE site_id = v_site.id 
           AND DATE(created_at) = v_date),
        0
      ),
      -- Estimated revenue: $10 per conversion
      COALESCE(
        (SELECT COUNT(*) * 10.0
         FROM conversions 
         WHERE site_id = v_site.id 
           AND DATE(created_at) = v_date),
        0
      )
    ON CONFLICT (site_id, metric_date) 
    DO UPDATE SET
      total_views = EXCLUDED.total_views,
      total_clicks = EXCLUDED.total_clicks,
      total_conversions = EXCLUDED.total_conversions,
      estimated_revenue = EXCLUDED.estimated_revenue,
      updated_at = now();
  END LOOP;
  
  RAISE NOTICE 'Affiliate metrics synced for date: %', v_date;
END;
$$;

-- ===================================
-- OPTIMIZATION: Indexes for Query Performance
-- ===================================

-- Index for page_views by date and site slug pattern
CREATE INDEX IF NOT EXISTS idx_page_views_created_at_path 
ON page_views(created_at, page_path);

-- Index for conversions by date and site
CREATE INDEX IF NOT EXISTS idx_conversions_created_at_site 
ON conversions(created_at, site_id, conversion_type);

-- Index for analytics_sessions by date and landing page
CREATE INDEX IF NOT EXISTS idx_sessions_created_landing 
ON analytics_sessions(created_at, landing_page);

-- Index for casino_content_analytics by date
CREATE INDEX IF NOT EXISTS idx_casino_analytics_view_date 
ON casino_content_analytics(view_date DESC, site_id);

-- Index for affiliate_metrics by date
CREATE INDEX IF NOT EXISTS idx_affiliate_metrics_date 
ON affiliate_metrics(metric_date DESC, site_id);

-- ===================================
-- OPTIMIZATION: Materialized View for Daily Site Metrics
-- ===================================

CREATE MATERIALIZED VIEW IF NOT EXISTS daily_site_metrics AS
SELECT 
  DATE(pv.created_at) as metric_date,
  bs.id as site_id,
  bs.name as site_name,
  bs.slug as site_slug,
  COUNT(DISTINCT pv.id) as total_views,
  COUNT(DISTINCT pv.session_id) as unique_sessions,
  COUNT(DISTINCT pv.user_id) FILTER (WHERE pv.user_id IS NOT NULL) as logged_in_users,
  AVG(pv.duration) as avg_duration_seconds,
  COUNT(DISTINCT c.id) FILTER (WHERE c.conversion_type = 'affiliate_click') as affiliate_clicks,
  COUNT(DISTINCT c.id) as total_conversions
FROM page_views pv
JOIN betting_sites bs ON pv.page_path LIKE '%' || bs.slug || '%'
LEFT JOIN conversions c ON c.site_id = bs.id AND DATE(c.created_at) = DATE(pv.created_at)
WHERE bs.is_active = true
  AND pv.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(pv.created_at), bs.id, bs.name, bs.slug;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_site_metrics_unique 
ON daily_site_metrics(metric_date, site_id);

-- Create a function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_daily_site_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_site_metrics;
  RAISE NOTICE 'Daily site metrics view refreshed at %', now();
END;
$$;

-- Grant permissions
GRANT SELECT ON daily_site_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_daily_site_metrics TO authenticated;