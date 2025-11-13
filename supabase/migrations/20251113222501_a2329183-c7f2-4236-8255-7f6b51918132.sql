-- Log Sistemi Tabloları

-- System Logs - Tüm log türleri için ana tablo
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type TEXT NOT NULL CHECK (log_type IN ('user_action', 'system_error', 'api_call', 'admin_action', 'performance')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  duration_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  stack_trace TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- System Health Metrics - Sistem sağlığı metrikleri
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('database', 'api', 'cache', 'storage', 'performance')),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical', 'unknown')),
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- API Call Logs - Detaylı API çağrı kayıtları
CREATE TABLE IF NOT EXISTS public.api_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  method TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  request_body JSONB,
  response_body JSONB,
  status_code INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_logs_log_type ON public.system_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_severity ON public.system_logs(severity);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_health_metric_type ON public.system_health_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_health_recorded_at ON public.system_health_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_function_name ON public.api_call_logs(function_name);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_created_at ON public.api_call_logs(created_at DESC);

-- RLS Policies
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_call_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all system logs"
  ON public.system_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert system logs"
  ON public.system_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public can insert certain log types (for tracking)
CREATE POLICY "Public can insert user action logs"
  ON public.system_logs FOR INSERT
  WITH CHECK (log_type IN ('user_action', 'system_error'));

-- Health metrics policies
CREATE POLICY "Admins can view health metrics"
  ON public.system_health_metrics FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert health metrics"
  ON public.system_health_metrics FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert health metrics"
  ON public.system_health_metrics FOR INSERT
  WITH CHECK (true);

-- API call logs policies
CREATE POLICY "Admins can view API logs"
  ON public.api_call_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert API logs"
  ON public.api_call_logs FOR INSERT
  WITH CHECK (true);

-- Database function for logging
CREATE OR REPLACE FUNCTION public.log_system_event(
  p_log_type TEXT,
  p_severity TEXT,
  p_action TEXT,
  p_resource TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT NULL,
  p_status_code INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.system_logs (
    log_type,
    severity,
    action,
    resource,
    details,
    user_id,
    session_id,
    duration_ms,
    status_code,
    error_message
  ) VALUES (
    p_log_type,
    p_severity,
    p_action,
    p_resource,
    p_details,
    COALESCE(p_user_id, auth.uid()),
    p_session_id,
    p_duration_ms,
    p_status_code,
    p_error_message
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to record system health metric
CREATE OR REPLACE FUNCTION public.record_health_metric(
  p_metric_type TEXT,
  p_metric_name TEXT,
  p_metric_value NUMERIC,
  p_status TEXT DEFAULT 'healthy',
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_metric_id UUID;
BEGIN
  INSERT INTO public.system_health_metrics (
    metric_type,
    metric_name,
    metric_value,
    status,
    metadata
  ) VALUES (
    p_metric_type,
    p_metric_name,
    p_metric_value,
    p_status,
    p_metadata
  ) RETURNING id INTO v_metric_id;
  
  RETURN v_metric_id;
END;
$$;