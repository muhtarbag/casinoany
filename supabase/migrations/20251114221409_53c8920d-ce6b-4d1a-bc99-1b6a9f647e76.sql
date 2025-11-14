-- Create helper function for advanced analytics
CREATE OR REPLACE FUNCTION get_daily_site_metrics_advanced(
  p_start_date date,
  p_end_date date
)
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
    DATE(pv.created_at) as metric_date,
    bs.id as site_id,
    bs.name as site_name,
    bs.slug as site_slug,
    COUNT(DISTINCT pv.id) as total_views,
    COUNT(DISTINCT pv.session_id) as unique_sessions,
    COUNT(DISTINCT pv.user_id) FILTER (WHERE pv.user_id IS NOT NULL) as logged_in_users,
    COALESCE(AVG(pv.duration), 0) as avg_duration_seconds,
    COUNT(DISTINCT c.id) FILTER (WHERE c.conversion_type = 'affiliate_click') as affiliate_clicks,
    COUNT(DISTINCT c.id) as total_conversions
  FROM page_views pv
  JOIN betting_sites bs ON pv.page_path LIKE '%' || bs.slug || '%'
  LEFT JOIN conversions c ON c.site_id = bs.id AND DATE(c.created_at) = DATE(pv.created_at)
  WHERE bs.is_active = true
    AND DATE(pv.created_at) BETWEEN p_start_date AND p_end_date
  GROUP BY DATE(pv.created_at), bs.id, bs.name, bs.slug
  ORDER BY DATE(pv.created_at) DESC, total_views DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_daily_site_metrics_advanced TO authenticated, anon;