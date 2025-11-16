
-- ============================================
-- CRITICAL SECURITY FIX: Add search_path to SECURITY DEFINER functions
-- Sprint 1 - Security Hardening
-- Risk: Schema hijacking prevention
-- ============================================

-- Fix 1: daily_analytics_maintenance
CREATE OR REPLACE FUNCTION public.daily_analytics_maintenance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Update yesterday's analytics summary
  PERFORM update_analytics_daily_summary(CURRENT_DATE - 1);
  
  -- Create next month's partitions
  PERFORM create_monthly_partitions();
  
  -- Archive old partitions (6 months+)
  PERFORM archive_old_partitions();
  
  -- Refresh materialized views
  PERFORM refresh_all_materialized_views();
  
  -- Vacuum and analyze critical tables
  VACUUM ANALYZE betting_sites;
  VACUUM ANALYZE site_reviews;
  VACUUM ANALYZE analytics_daily_summary;
  VACUUM ANALYZE site_stats;
  
  RAISE NOTICE 'Daily analytics maintenance completed at %', now();
END;
$function$;

-- Fix 2: refresh_all_materialized_views
CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Refresh daily site metrics if exists
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'daily_site_metrics') THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_site_metrics;
  END IF;
  
  RAISE NOTICE 'All materialized views refreshed at %', now();
END;
$function$;

-- Fix 3: update_analytics_daily_summary
CREATE OR REPLACE FUNCTION public.update_analytics_daily_summary(target_date date DEFAULT (CURRENT_DATE - 1))
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Add comment explaining the security fix
COMMENT ON FUNCTION public.daily_analytics_maintenance() IS 
'Daily maintenance routine with search_path protection against schema hijacking';

COMMENT ON FUNCTION public.refresh_all_materialized_views() IS 
'Refreshes materialized views with search_path protection';

COMMENT ON FUNCTION public.update_analytics_daily_summary(date) IS 
'Updates daily analytics summary with search_path protection against injection';
