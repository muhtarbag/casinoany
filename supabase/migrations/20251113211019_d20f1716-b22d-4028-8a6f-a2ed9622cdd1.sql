-- Güvenlik iyileştirmeleri

-- 1. Mevcut fonksiyonları güvenli search_path ile güncelle
CREATE OR REPLACE FUNCTION public.track_page_view(
  p_page_path TEXT,
  p_page_title TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_duration INTEGER DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_page_view_id UUID;
  v_device_type TEXT;
  v_browser TEXT;
BEGIN
  -- Simple device/browser detection
  IF p_user_agent ILIKE '%mobile%' OR p_user_agent ILIKE '%android%' THEN
    v_device_type := 'mobile';
  ELSIF p_user_agent ILIKE '%tablet%' OR p_user_agent ILIKE '%ipad%' THEN
    v_device_type := 'tablet';
  ELSE
    v_device_type := 'desktop';
  END IF;
  
  IF p_user_agent ILIKE '%chrome%' THEN
    v_browser := 'Chrome';
  ELSIF p_user_agent ILIKE '%firefox%' THEN
    v_browser := 'Firefox';
  ELSIF p_user_agent ILIKE '%safari%' THEN
    v_browser := 'Safari';
  ELSIF p_user_agent ILIKE '%edge%' THEN
    v_browser := 'Edge';
  ELSE
    v_browser := 'Other';
  END IF;
  
  -- Insert page view
  INSERT INTO public.page_views (
    page_path,
    page_title,
    referrer,
    user_agent,
    device_type,
    browser,
    session_id,
    user_id,
    duration
  ) VALUES (
    p_page_path,
    p_page_title,
    p_referrer,
    p_user_agent,
    v_device_type,
    v_browser,
    p_session_id,
    auth.uid(),
    p_duration
  ) RETURNING id INTO v_page_view_id;
  
  -- Update session
  IF p_session_id IS NOT NULL THEN
    INSERT INTO public.analytics_sessions (
      session_id,
      user_id,
      device_type,
      browser,
      landing_page,
      page_count
    ) VALUES (
      p_session_id,
      auth.uid(),
      v_device_type,
      v_browser,
      p_page_path,
      1
    )
    ON CONFLICT (session_id) 
    DO UPDATE SET
      last_activity = now(),
      page_count = analytics_sessions.page_count + 1,
      exit_page = p_page_path,
      total_duration = analytics_sessions.total_duration + p_duration,
      is_bounce = CASE 
        WHEN analytics_sessions.page_count = 0 THEN true 
        ELSE false 
      END;
  END IF;
  
  RETURN v_page_view_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_user_event(
  p_event_type TEXT,
  p_event_name TEXT,
  p_page_path TEXT,
  p_element_id TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.user_events (
    event_type,
    event_name,
    page_path,
    element_id,
    session_id,
    user_id,
    metadata
  ) VALUES (
    p_event_type,
    p_event_name,
    p_page_path,
    p_element_id,
    p_session_id,
    auth.uid(),
    p_metadata
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_conversion(
  p_conversion_type TEXT,
  p_page_path TEXT,
  p_site_id UUID DEFAULT NULL,
  p_conversion_value NUMERIC DEFAULT 0,
  p_session_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_conversion_id UUID;
BEGIN
  INSERT INTO public.conversions (
    conversion_type,
    conversion_value,
    page_path,
    session_id,
    user_id,
    site_id,
    metadata
  ) VALUES (
    p_conversion_type,
    p_conversion_value,
    p_page_path,
    p_session_id,
    auth.uid(),
    p_site_id,
    p_metadata
  ) RETURNING id INTO v_conversion_id;
  
  RETURN v_conversion_id;
END;
$$;