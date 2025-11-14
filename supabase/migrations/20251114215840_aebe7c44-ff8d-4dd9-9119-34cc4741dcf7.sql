-- Fix security warnings from previous migration

-- 1. Update cron jobs to use explicit schema paths
-- First, remove existing jobs
SELECT cron.unschedule('sync-affiliate-metrics-daily');
SELECT cron.unschedule('system-health-check-hourly');

-- Recreate jobs with proper configuration
SELECT cron.schedule(
  'sync-affiliate-metrics-daily',
  '0 0 * * *',
  $$
  SELECT extensions.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/sync-affiliate-metrics',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object('date', CURRENT_DATE::text)
  );
  $$
);

SELECT cron.schedule(
  'system-health-check-hourly',
  '0 * * * *',
  $$
  SELECT extensions.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/system-health-monitor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 2. Update trigger function with explicit search_path
DROP FUNCTION IF EXISTS trigger_affiliate_metrics_sync();

CREATE OR REPLACE FUNCTION public.trigger_affiliate_metrics_sync()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.sync_daily_affiliate_metrics();
END;
$$;

-- Restore permissions
GRANT EXECUTE ON FUNCTION public.trigger_affiliate_metrics_sync() TO authenticated;