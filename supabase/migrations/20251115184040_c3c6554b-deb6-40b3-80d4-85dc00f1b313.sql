-- ============================================
-- ANALYTICS AGGREGATION SUMMARY TABLE
-- Pre-computed daily aggregates for fast queries
-- ============================================

-- 1. Create daily site metrics aggregation table
CREATE TABLE IF NOT EXISTS analytics_daily_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES betting_sites(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  
  -- View metrics
  total_views integer DEFAULT 0,
  unique_sessions integer DEFAULT 0,
  logged_in_users integer DEFAULT 0,
  avg_duration_seconds numeric(10,2) DEFAULT 0,
  bounce_rate numeric(5,2) DEFAULT 0,
  
  -- Click metrics
  affiliate_clicks integer DEFAULT 0,
  total_clicks integer DEFAULT 0,
  ctr numeric(5,2) DEFAULT 0,
  
  -- Conversion metrics
  total_conversions integer DEFAULT 0,
  conversion_rate numeric(5,2) DEFAULT 0,
  estimated_revenue numeric(10,2) DEFAULT 0,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(site_id, metric_date)
);

-- Create indexes for fast lookups
CREATE INDEX idx_analytics_daily_summary_site_date ON analytics_daily_summary(site_id, metric_date DESC);
CREATE INDEX idx_analytics_daily_summary_date ON analytics_daily_summary(metric_date DESC);
CREATE INDEX idx_analytics_daily_summary_site_id ON analytics_daily_summary(site_id);

-- 2. Function to update daily summary (called by cron or trigger)
CREATE OR REPLACE FUNCTION update_analytics_daily_summary(target_date date DEFAULT CURRENT_DATE - 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO analytics_daily_summary (
    site_id,
    metric_date,
    total_views,
    unique_sessions,
    logged_in_users,
    avg_duration_seconds,
    bounce_rate,
    affiliate_clicks,
    total_clicks,
    total_conversions,
    estimated_revenue
  )
  SELECT 
    bs.id as site_id,
    target_date as metric_date,
    
    -- Views from casino_content_analytics
    COALESCE(cca.total_views, 0) as total_views,
    
    -- Sessions from analytics_sessions
    COALESCE(
      (SELECT COUNT(DISTINCT session_id) 
       FROM analytics_sessions 
       WHERE DATE(created_at) = target_date 
         AND landing_page LIKE '%' || bs.slug || '%'),
      0
    ) as unique_sessions,
    
    -- Logged in users
    COALESCE(
      (SELECT COUNT(DISTINCT user_id) 
       FROM analytics_sessions 
       WHERE DATE(created_at) = target_date 
         AND landing_page LIKE '%' || bs.slug || '%'
         AND user_id IS NOT NULL),
      0
    ) as logged_in_users,
    
    -- Avg duration
    COALESCE(
      (SELECT AVG(total_duration) 
       FROM analytics_sessions 
       WHERE DATE(created_at) = target_date 
         AND landing_page LIKE '%' || bs.slug || '%'),
      0
    ) as avg_duration_seconds,
    
    -- Bounce rate from casino analytics
    COALESCE(cca.bounce_rate, 0) as bounce_rate,
    
    -- Affiliate clicks
    COALESCE(cca.affiliate_clicks, 0) as affiliate_clicks,
    
    -- Total clicks from affiliate_metrics
    COALESCE(am.total_clicks, 0) as total_clicks,
    
    -- Conversions
    COALESCE(am.total_conversions, 0) as total_conversions,
    
    -- Revenue
    COALESCE(am.estimated_revenue, 0) as estimated_revenue
    
  FROM betting_sites bs
  LEFT JOIN casino_content_analytics cca 
    ON cca.site_id = bs.id AND cca.view_date = target_date
  LEFT JOIN affiliate_metrics am 
    ON am.site_id = bs.id AND am.metric_date = target_date
  WHERE bs.is_active = true
  
  ON CONFLICT (site_id, metric_date) 
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_sessions = EXCLUDED.unique_sessions,
    logged_in_users = EXCLUDED.logged_in_users,
    avg_duration_seconds = EXCLUDED.avg_duration_seconds,
    bounce_rate = EXCLUDED.bounce_rate,
    affiliate_clicks = EXCLUDED.affiliate_clicks,
    total_clicks = EXCLUDED.total_clicks,
    total_conversions = EXCLUDED.total_conversions,
    estimated_revenue = EXCLUDED.estimated_revenue,
    updated_at = now();
    
  -- Calculate CTR
  UPDATE analytics_daily_summary
  SET ctr = CASE 
    WHEN total_views > 0 THEN ROUND((total_clicks::numeric / total_views::numeric) * 100, 2)
    ELSE 0 
  END
  WHERE metric_date = target_date;
  
  -- Calculate conversion rate
  UPDATE analytics_daily_summary
  SET conversion_rate = CASE 
    WHEN total_clicks > 0 THEN ROUND((total_conversions::numeric / total_clicks::numeric) * 100, 2)
    ELSE 0 
  END
  WHERE metric_date = target_date;
  
  RAISE NOTICE 'Updated analytics daily summary for date: %', target_date;
END;
$$;

-- 3. Backfill last 30 days of data
DO $$
DECLARE
  day_offset integer;
BEGIN
  FOR day_offset IN 1..30 LOOP
    PERFORM update_analytics_daily_summary(CURRENT_DATE - day_offset);
  END LOOP;
END $$;

-- 4. Create view for site analytics (replaces complex query in hook)
CREATE OR REPLACE VIEW site_analytics_view AS
SELECT 
  bs.id as site_id,
  bs.name as site_name,
  bs.slug as site_slug,
  bs.logo_url,
  bs.rating,
  bs.is_active,
  
  -- Total aggregates from site_stats
  COALESCE(ss.views, 0) as total_views,
  COALESCE(ss.clicks, 0) as total_clicks,
  
  -- Calculate CTR
  CASE 
    WHEN COALESCE(ss.views, 0) > 0 
    THEN ROUND((COALESCE(ss.clicks, 0)::numeric / ss.views::numeric) * 100, 2)
    ELSE 0 
  END as ctr,
  
  -- Last 30 days from daily summary
  COALESCE(
    (SELECT SUM(affiliate_clicks) FROM analytics_daily_summary 
     WHERE site_id = bs.id AND metric_date >= CURRENT_DATE - 30),
    0
  ) as affiliate_clicks,
  
  COALESCE(
    (SELECT SUM(estimated_revenue) FROM analytics_daily_summary 
     WHERE site_id = bs.id AND metric_date >= CURRENT_DATE - 30),
    0
  ) as estimated_revenue,
  
  -- Last 7 days metrics
  COALESCE(
    (SELECT SUM(total_views) FROM analytics_daily_summary 
     WHERE site_id = bs.id AND metric_date >= CURRENT_DATE - 7),
    0
  ) as last_7_days_views,
  
  COALESCE(
    (SELECT SUM(total_clicks) FROM analytics_daily_summary 
     WHERE site_id = bs.id AND metric_date >= CURRENT_DATE - 7),
    0
  ) as last_7_days_clicks,
  
  -- Previous 7 days for trend
  COALESCE(
    (SELECT SUM(total_views) FROM analytics_daily_summary 
     WHERE site_id = bs.id 
       AND metric_date >= CURRENT_DATE - 14 
       AND metric_date < CURRENT_DATE - 7),
    0
  ) as previous_7_days_views,
  
  -- Total conversions last 30 days
  COALESCE(
    (SELECT SUM(total_conversions) FROM analytics_daily_summary 
     WHERE site_id = bs.id AND metric_date >= CURRENT_DATE - 30),
    0
  ) as total_conversions,
  
  -- Conversion rate
  CASE 
    WHEN COALESCE(ss.clicks, 0) > 0 
    THEN ROUND(
      (COALESCE(
        (SELECT SUM(total_conversions) FROM analytics_daily_summary 
         WHERE site_id = bs.id AND metric_date >= CURRENT_DATE - 30),
        0
      )::numeric / ss.clicks::numeric) * 100, 2
    )
    ELSE 0 
  END as conversion_rate
  
FROM betting_sites bs
LEFT JOIN site_stats ss ON ss.site_id = bs.id
WHERE bs.is_active = true
ORDER BY total_views DESC;

-- Grant permissions
GRANT SELECT ON site_analytics_view TO postgres, anon, authenticated;
GRANT EXECUTE ON FUNCTION update_analytics_daily_summary(date) TO postgres;