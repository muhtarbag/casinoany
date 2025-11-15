-- ============================================
-- CACHE LAYER & MONITORING SETUP
-- Materialized views + automated maintenance
-- ============================================

-- 1. Refresh materialized views function
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh daily site metrics if exists
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'daily_site_metrics') THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_site_metrics;
  END IF;
  
  RAISE NOTICE 'All materialized views refreshed at %', now();
END;
$$;

-- 2. Analytics maintenance function (daily cleanup + aggregation)
CREATE OR REPLACE FUNCTION daily_analytics_maintenance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- 3. Performance monitoring function
CREATE OR REPLACE FUNCTION monitor_query_performance()
RETURNS TABLE(
  query_text text,
  calls bigint,
  total_time numeric,
  mean_time numeric,
  max_time numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUBSTRING(query, 1, 100) as query_text,
    calls::bigint,
    ROUND(total_exec_time::numeric, 2) as total_time,
    ROUND(mean_exec_time::numeric, 2) as mean_time,
    ROUND(max_exec_time::numeric, 2) as max_time
  FROM pg_stat_statements
  WHERE query NOT LIKE '%pg_stat_statements%'
  ORDER BY mean_exec_time DESC
  LIMIT 20;
END;
$$;

-- 4. Database health check function
CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE(
  metric_name text,
  metric_value text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  db_size bigint;
  table_count bigint;
  index_count bigint;
  active_connections bigint;
BEGIN
  -- Database size
  SELECT pg_database_size(current_database()) INTO db_size;
  
  -- Table count
  SELECT COUNT(*) INTO table_count 
  FROM pg_tables 
  WHERE schemaname = 'public';
  
  -- Index count
  SELECT COUNT(*) INTO index_count 
  FROM pg_indexes 
  WHERE schemaname = 'public';
  
  -- Active connections
  SELECT COUNT(*) INTO active_connections 
  FROM pg_stat_activity 
  WHERE state = 'active';
  
  RETURN QUERY VALUES
    ('Database Size', pg_size_pretty(db_size), 
     CASE WHEN db_size < 10737418240 THEN 'healthy' ELSE 'warning' END),
    ('Total Tables', table_count::text, 'info'),
    ('Total Indexes', index_count::text, 'info'),
    ('Active Connections', active_connections::text,
     CASE WHEN active_connections < 50 THEN 'healthy' ELSE 'warning' END);
END;
$$;

-- 5. Index usage monitoring
CREATE OR REPLACE FUNCTION monitor_index_usage()
RETURNS TABLE(
  schemaname text,
  tablename text,
  indexname text,
  idx_scan bigint,
  idx_tup_read bigint,
  idx_tup_fetch bigint,
  usage_ratio numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::text,
    tablename::text,
    indexname::text,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    CASE 
      WHEN idx_scan = 0 THEN 0
      ELSE ROUND((idx_tup_fetch::numeric / NULLIF(idx_tup_read, 0)) * 100, 2)
    END as usage_ratio
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan DESC
  LIMIT 30;
END;
$$;

-- 6. Slow query detector
CREATE OR REPLACE FUNCTION detect_slow_queries(threshold_ms integer DEFAULT 100)
RETURNS TABLE(
  query_text text,
  calls bigint,
  mean_time_ms numeric,
  total_time_ms numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUBSTRING(query, 1, 200) as query_text,
    calls::bigint,
    ROUND(mean_exec_time::numeric, 2) as mean_time_ms,
    ROUND(total_exec_time::numeric, 2) as total_time_ms
  FROM pg_stat_statements
  WHERE mean_exec_time > threshold_ms
    AND query NOT LIKE '%pg_stat_statements%'
  ORDER BY mean_exec_time DESC
  LIMIT 20;
END;
$$;

-- 7. Cache statistics view
CREATE OR REPLACE VIEW cache_statistics AS
SELECT 
  'Site List Cache' as cache_name,
  COUNT(*) as cached_items,
  MAX(updated_at) as last_update
FROM betting_sites
WHERE is_active = true
UNION ALL
SELECT 
  'Analytics Summary Cache',
  COUNT(*),
  MAX(updated_at)
FROM analytics_daily_summary
WHERE metric_date >= CURRENT_DATE - 7
UNION ALL
SELECT 
  'Reviews Cache',
  COUNT(*),
  MAX(updated_at)
FROM site_reviews
WHERE is_approved = true AND created_at >= CURRENT_DATE - 30;

-- 8. Performance metrics view
CREATE OR REPLACE VIEW performance_metrics AS
SELECT 
  'Average Query Time' as metric,
  ROUND(AVG(mean_exec_time)::numeric, 2)::text || ' ms' as value
FROM pg_stat_statements
WHERE calls > 10
UNION ALL
SELECT 
  'Total Database Size',
  pg_size_pretty(pg_database_size(current_database()))
UNION ALL
SELECT 
  'Active Connections',
  COUNT(*)::text
FROM pg_stat_activity
WHERE state = 'active'
UNION ALL
SELECT 
  'Cache Hit Ratio',
  ROUND((sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0)) * 100, 2)::text || '%'
FROM pg_stat_database
WHERE datname = current_database();

-- Grant permissions
GRANT EXECUTE ON FUNCTION refresh_all_materialized_views() TO postgres;
GRANT EXECUTE ON FUNCTION daily_analytics_maintenance() TO postgres;
GRANT EXECUTE ON FUNCTION monitor_query_performance() TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION database_health_check() TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION monitor_index_usage() TO postgres, authenticated;
GRANT EXECUTE ON FUNCTION detect_slow_queries(integer) TO postgres, authenticated;
GRANT SELECT ON cache_statistics TO postgres, authenticated;
GRANT SELECT ON performance_metrics TO postgres, authenticated;

-- Enable pg_stat_statements for query monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;