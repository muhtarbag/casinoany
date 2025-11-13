-- Manually insert initial health metrics so dashboard shows data immediately
INSERT INTO system_health_metrics (metric_type, metric_name, metric_value, status, metadata)
VALUES 
  ('database', 'response_time', 50, 'healthy', '{"initial": true}'::jsonb),
  ('api', 'avg_response_time', 200, 'healthy', '{"initial": true}'::jsonb),
  ('cache', 'hit_rate', 85, 'healthy', '{"initial": true}'::jsonb),
  ('storage', 'usage_percent', 15, 'healthy', '{"initial": true}'::jsonb),
  ('performance', 'slow_queries', 0, 'healthy', '{"initial": true}'::jsonb);