-- Analytics ve Tracking Sistemi Tabloları

-- 1. Page Views Tracking
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  country TEXT,
  city TEXT,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  duration INTEGER DEFAULT 0, -- time spent on page in seconds
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. User Events Tracking (clicks, scrolls, form submissions, etc.)
CREATE TABLE IF NOT EXISTS public.user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL, -- click, scroll, form_submit, search, etc.
  event_name TEXT NOT NULL,
  page_path TEXT NOT NULL,
  element_id TEXT,
  element_class TEXT,
  element_text TEXT,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Conversion Tracking
CREATE TABLE IF NOT EXISTS public.conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  conversion_type TEXT NOT NULL, -- signup, affiliate_click, review_submit, etc.
  conversion_value NUMERIC DEFAULT 0,
  page_path TEXT NOT NULL,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  site_id UUID REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Sessions Tracking
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device_type TEXT,
  browser TEXT,
  country TEXT,
  landing_page TEXT,
  exit_page TEXT,
  page_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  is_bounce BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public insert for tracking, admin view
CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all page views"
  ON public.page_views FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert user events"
  ON public.user_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all user events"
  ON public.user_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert conversions"
  ON public.conversions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all conversions"
  ON public.conversions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert sessions"
  ON public.analytics_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
  ON public.analytics_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Admins can view all sessions"
  ON public.analytics_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_page_views_user_id ON public.page_views(user_id);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);

CREATE INDEX idx_user_events_created_at ON public.user_events(created_at DESC);
CREATE INDEX idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX idx_user_events_session_id ON public.user_events(session_id);

CREATE INDEX idx_conversions_created_at ON public.conversions(created_at DESC);
CREATE INDEX idx_conversions_type ON public.conversions(conversion_type);
CREATE INDEX idx_conversions_site_id ON public.conversions(site_id);

CREATE INDEX idx_sessions_created_at ON public.analytics_sessions(created_at DESC);
CREATE INDEX idx_sessions_session_id ON public.analytics_sessions(session_id);

-- Helper function to track page view
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
  -- Simple device/browser detection (can be enhanced)
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

-- Helper function to track user event
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

-- Helper function to track conversion
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