
-- ============================================
-- FIX: Remaining Security Definer Views
-- ============================================
-- Convert performance_metrics and site_stats_with_details to SECURITY INVOKER

-- 1. Fix performance_metrics view
DROP VIEW IF EXISTS public.performance_metrics;

CREATE VIEW public.performance_metrics
WITH (security_invoker = on)
AS
SELECT 
  'Average Query Time'::text AS metric,
  round(avg(pg_stat_statements.mean_exec_time)::numeric, 2)::text || ' ms'::text AS value
FROM extensions.pg_stat_statements
WHERE pg_stat_statements.calls > 10
UNION ALL
SELECT 
  'Total Database Size'::text AS metric,
  pg_size_pretty(pg_database_size(current_database())) AS value
UNION ALL
SELECT 
  'Active Connections'::text AS metric,
  count(*)::text AS value
FROM pg_stat_activity
WHERE pg_stat_activity.state = 'active'::text
UNION ALL
SELECT 
  'Cache Hit Ratio'::text AS metric,
  round(sum(pg_stat_database.blks_hit) / NULLIF(sum(pg_stat_database.blks_hit) + sum(pg_stat_database.blks_read), 0::numeric) * 100::numeric, 2)::text || '%'::text AS value
FROM pg_stat_database
WHERE pg_stat_database.datname = current_database();

-- 2. Fix site_stats_with_details view
DROP VIEW IF EXISTS public.site_stats_with_details;

CREATE VIEW public.site_stats_with_details
WITH (security_invoker = on)
AS
SELECT 
  s.id,
  s.site_id,
  s.views,
  s.clicks,
  s.email_clicks,
  s.whatsapp_clicks,
  s.telegram_clicks,
  s.twitter_clicks,
  s.instagram_clicks,
  s.facebook_clicks,
  s.youtube_clicks,
  s.created_at,
  s.updated_at,
  b.name AS site_name,
  b.slug AS site_slug,
  b.rating AS site_rating,
  b.bonus AS site_bonus,
  b.logo_url AS site_logo_url,
  b.is_active AS site_is_active
FROM site_stats s
LEFT JOIN betting_sites b ON s.site_id = b.id;

-- Log success
DO $$
BEGIN
  RAISE NOTICE 'All views converted to SECURITY INVOKER';
  RAISE NOTICE 'Views now respect RLS policies properly';
END $$;
