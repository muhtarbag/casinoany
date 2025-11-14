-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant permissions for pg_cron
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule affiliate metrics sync (runs daily at midnight)
SELECT cron.schedule(
  'sync-affiliate-metrics-daily',
  '0 0 * * *', -- Daily at 00:00
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/sync-affiliate-metrics',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object('date', CURRENT_DATE::text)
  );
  $$
);

-- Schedule system health monitoring (runs every hour)
SELECT cron.schedule(
  'system-health-check-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/system-health-monitor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Create a function to manually trigger affiliate sync (for admin use)
CREATE OR REPLACE FUNCTION trigger_affiliate_metrics_sync()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM sync_daily_affiliate_metrics();
END;
$$;

-- Grant execute permission to authenticated users with admin role
GRANT EXECUTE ON FUNCTION trigger_affiliate_metrics_sync() TO authenticated;