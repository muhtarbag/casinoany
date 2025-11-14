-- Phase 1: Database Security - Set immutable search_path for all custom functions
-- This prevents potential security issues from mutable search_paths

-- Fix has_role function (already marked as SECURITY DEFINER)
ALTER FUNCTION public.has_role(uuid, app_role) 
  SET search_path = public;

-- Fix increment_news_view_count function
ALTER FUNCTION public.increment_news_view_count(uuid) 
  SET search_path = public;

-- Fix handle_new_user trigger function
ALTER FUNCTION public.handle_new_user() 
  SET search_path = public;

-- Fix update_updated_at_column trigger function
ALTER FUNCTION public.update_updated_at_column() 
  SET search_path = public;

-- Fix track_search function
ALTER FUNCTION public.track_search(text) 
  SET search_path = public;

-- Fix track_page_view function
ALTER FUNCTION public.track_page_view(text, text, text, text, text, integer) 
  SET search_path = public;

-- Fix track_user_event function
ALTER FUNCTION public.track_user_event(text, text, text, text, text, jsonb) 
  SET search_path = public;

-- Fix track_conversion function
ALTER FUNCTION public.track_conversion(text, text, uuid, numeric, text, jsonb) 
  SET search_path = public;

-- Fix increment_blog_view_count function
ALTER FUNCTION public.increment_blog_view_count(uuid) 
  SET search_path = public;

-- Fix increment_casino_analytics function
ALTER FUNCTION public.increment_casino_analytics(uuid, text, boolean) 
  SET search_path = public;

-- Fix log_system_event function
ALTER FUNCTION public.log_system_event(text, text, text, text, jsonb, uuid, text, integer, integer, text) 
  SET search_path = public;

-- Fix record_health_metric function
ALTER FUNCTION public.record_health_metric(text, text, numeric, text, jsonb) 
  SET search_path = public;

-- Fix can_view_site_stats function
ALTER FUNCTION public.can_view_site_stats() 
  SET search_path = public;

-- Add input validation constraints for blog_comments table
ALTER TABLE public.blog_comments
  ADD CONSTRAINT comment_length_check CHECK (char_length(comment) >= 10 AND char_length(comment) <= 1000),
  ADD CONSTRAINT name_length_check CHECK (name IS NULL OR (char_length(name) >= 2 AND char_length(name) <= 100)),
  ADD CONSTRAINT email_length_check CHECK (email IS NULL OR char_length(email) <= 255),
  ADD CONSTRAINT comment_no_script_tags CHECK (comment !~* '<script|</script|javascript:|onerror=|onload=');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id_approved 
  ON public.blog_comments(post_id, is_approved) 
  WHERE is_approved = true;

CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at 
  ON public.blog_comments(created_at DESC);