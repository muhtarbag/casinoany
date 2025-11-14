-- Fix materialized view API exposure warning
-- Revoke direct access to materialized view, only allow via RPC
REVOKE ALL ON daily_site_metrics FROM anon, authenticated;

-- Only admins can refresh it
GRANT SELECT ON daily_site_metrics TO postgres;