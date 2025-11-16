-- SYSTEM HEALTH CLEANUP - Remove system health metrics and related functions
-- Keep system_logs table as it's still useful for debugging

-- Drop system health metrics table
DROP TABLE IF EXISTS public.system_health_metrics CASCADE;

-- Drop health-related functions
DROP FUNCTION IF EXISTS public.record_health_metric(text, text, numeric, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.database_health_check() CASCADE;
DROP FUNCTION IF EXISTS public.monitor_query_performance() CASCADE;
DROP FUNCTION IF EXISTS public.monitor_index_usage() CASCADE;
DROP FUNCTION IF EXISTS public.detect_slow_queries(integer) CASCADE;

COMMENT ON TABLE public.system_logs IS 'System logs for debugging and monitoring. Health metrics removed for performance.';