-- COMPLETE ANALYTICS CLEANUP - Remove all analytics tables and views
-- This is the final cleanup after disabling analytics system

-- Drop analytics-related views first (including materialized views)
DROP VIEW IF EXISTS public.site_analytics_view CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.daily_site_metrics CASCADE;

-- Drop analytics tables
DROP TABLE IF EXISTS public.analytics_daily_summary CASCADE;
DROP TABLE IF EXISTS public.analytics_sessions CASCADE;
DROP TABLE IF EXISTS public.casino_content_analytics CASCADE;

-- Drop any analytics-related functions
DROP FUNCTION IF EXISTS public.update_site_stats() CASCADE;
DROP FUNCTION IF EXISTS public.aggregate_daily_analytics() CASCADE;

COMMENT ON SCHEMA public IS 'Analytics system completely removed for maximum performance. Only critical affiliate tracking remains.';