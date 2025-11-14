-- Update system_health_metrics constraint to allow more metric types
ALTER TABLE public.system_health_metrics 
DROP CONSTRAINT IF EXISTS system_health_metrics_metric_type_check;

ALTER TABLE public.system_health_metrics
ADD CONSTRAINT system_health_metrics_metric_type_check 
CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'timing', 'performance', 'health'));

-- Update system_logs constraint to allow more log types  
ALTER TABLE public.system_logs 
DROP CONSTRAINT IF EXISTS system_logs_log_type_check;

ALTER TABLE public.system_logs
ADD CONSTRAINT system_logs_log_type_check 
CHECK (log_type IN ('system', 'user_action', 'api_call', 'database', 'edge_function', 'system_error', 'performance', 'security', 'analytics'));