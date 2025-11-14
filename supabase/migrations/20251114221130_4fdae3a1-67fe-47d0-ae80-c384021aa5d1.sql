-- Create RPC function to safely query materialized view
CREATE OR REPLACE FUNCTION get_daily_site_metrics(days_back integer DEFAULT 30)
RETURNS TABLE (
  metric_date date,
  site_id uuid,
  site_name text,
  site_slug text,
  total_views bigint,
  unique_sessions bigint,
  logged_in_users bigint,
  avg_duration_seconds numeric,
  affiliate_clicks bigint,
  total_conversions bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dsm.metric_date,
    dsm.site_id,
    dsm.site_name,
    dsm.site_slug,
    dsm.total_views,
    dsm.unique_sessions,
    dsm.logged_in_users,
    dsm.avg_duration_seconds,
    dsm.affiliate_clicks,
    dsm.total_conversions
  FROM daily_site_metrics dsm
  WHERE dsm.metric_date >= CURRENT_DATE - days_back
  ORDER BY dsm.metric_date DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_daily_site_metrics TO authenticated, anon;