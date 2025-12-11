-- Domain tracking table for security monitoring
CREATE TABLE IF NOT EXISTS public.domain_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  full_url TEXT NOT NULL,
  source_table TEXT NOT NULL,
  source_column TEXT NOT NULL,
  source_record_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  context_text TEXT,
  is_flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  flagged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  flagged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_domain_tracking_domain ON public.domain_tracking(domain);
CREATE INDEX IF NOT EXISTS idx_domain_tracking_user_id ON public.domain_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_tracking_is_flagged ON public.domain_tracking(is_flagged);
CREATE INDEX IF NOT EXISTS idx_domain_tracking_source ON public.domain_tracking(source_table, source_record_id);
CREATE INDEX IF NOT EXISTS idx_domain_tracking_created_at ON public.domain_tracking(created_at DESC);

-- Enable RLS
ALTER TABLE public.domain_tracking ENABLE ROW LEVEL SECURITY;

-- Admin can see everything
CREATE POLICY "Admins can view all domains"
  ON public.domain_tracking FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin can flag domains
CREATE POLICY "Admins can flag domains"
  ON public.domain_tracking FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to extract domains from text
CREATE OR REPLACE FUNCTION public.extract_domains_from_text(p_text TEXT)
RETURNS TABLE(domain TEXT, full_url TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  WITH urls AS (
    SELECT 
      unnest(regexp_matches(
        p_text, 
        'https?://[^\s<>"{}|\\^`\[\]]+',
        'gi'
      )) as url
  )
  SELECT DISTINCT
    regexp_replace(
      regexp_replace(url, '^https?://(www\.)?', '', 'i'),
      '/.*$',
      ''
    ) as domain,
    url as full_url
  FROM urls
  WHERE url IS NOT NULL AND length(url) > 7;
END;
$function$;

-- Function to track domains from a record
CREATE OR REPLACE FUNCTION public.track_domains_in_record(
  p_table_name TEXT,
  p_record_id UUID,
  p_user_id UUID,
  p_content TEXT,
  p_column_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_domain RECORD;
  v_context TEXT;
BEGIN
  IF p_content IS NULL OR length(trim(p_content)) = 0 THEN
    RETURN;
  END IF;

  FOR v_domain IN 
    SELECT * FROM public.extract_domains_from_text(p_content)
  LOOP
    v_context := substring(p_content from 
      GREATEST(1, position(v_domain.full_url in p_content) - 100) 
      for 200
    );

    INSERT INTO public.domain_tracking (
      domain,
      full_url,
      source_table,
      source_column,
      source_record_id,
      user_id,
      context_text
    ) VALUES (
      v_domain.domain,
      v_domain.full_url,
      p_table_name,
      p_column_name,
      p_record_id,
      p_user_id,
      v_context
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$function$;

-- Trigger functions
CREATE OR REPLACE FUNCTION public.track_betting_sites_domains()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  PERFORM public.track_domains_in_record('betting_sites', NEW.id, NEW.owner_id, NEW.expert_review, 'expert_review');
  PERFORM public.track_domains_in_record('betting_sites', NEW.id, NEW.owner_id, NEW.verdict, 'verdict');
  PERFORM public.track_domains_in_record('betting_sites', NEW.id, NEW.owner_id, NEW.login_guide, 'login_guide');
  PERFORM public.track_domains_in_record('betting_sites', NEW.id, NEW.owner_id, NEW.withdrawal_guide, 'withdrawal_guide');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_review_domains()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  PERFORM public.track_domains_in_record('site_reviews', NEW.id, NEW.user_id, NEW.comment, 'comment');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_complaint_domains()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  PERFORM public.track_domains_in_record('site_complaints', NEW.id, NEW.user_id, NEW.description, 'description');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_complaint_response_domains()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  PERFORM public.track_domains_in_record('complaint_responses', NEW.id, NEW.user_id, NEW.response_text, 'response_text');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_blog_post_domains()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  PERFORM public.track_domains_in_record('blog_posts', NEW.id, NEW.author_id, NEW.content, 'content');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_blog_comment_domains()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  PERFORM public.track_domains_in_record('blog_comments', NEW.id, NEW.user_id, NEW.comment, 'comment');
  RETURN NEW;
END;
$function$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_track_betting_sites_domains ON public.betting_sites;
CREATE TRIGGER trigger_track_betting_sites_domains
  AFTER INSERT OR UPDATE OF expert_review, verdict, login_guide, withdrawal_guide
  ON public.betting_sites
  FOR EACH ROW
  EXECUTE FUNCTION public.track_betting_sites_domains();

DROP TRIGGER IF EXISTS trigger_track_review_domains ON public.site_reviews;
CREATE TRIGGER trigger_track_review_domains
  AFTER INSERT OR UPDATE OF comment
  ON public.site_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.track_review_domains();

DROP TRIGGER IF EXISTS trigger_track_complaint_domains ON public.site_complaints;
CREATE TRIGGER trigger_track_complaint_domains
  AFTER INSERT OR UPDATE OF description
  ON public.site_complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.track_complaint_domains();

DROP TRIGGER IF EXISTS trigger_track_complaint_response_domains ON public.complaint_responses;
CREATE TRIGGER trigger_track_complaint_response_domains
  AFTER INSERT OR UPDATE OF response_text
  ON public.complaint_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.track_complaint_response_domains();

DROP TRIGGER IF EXISTS trigger_track_blog_post_domains ON public.blog_posts;
CREATE TRIGGER trigger_track_blog_post_domains
  AFTER INSERT OR UPDATE OF content
  ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.track_blog_post_domains();

DROP TRIGGER IF EXISTS trigger_track_blog_comment_domains ON public.blog_comments;
CREATE TRIGGER trigger_track_blog_comment_domains
  AFTER INSERT OR UPDATE OF comment
  ON public.blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.track_blog_comment_domains();

DROP TRIGGER IF EXISTS trigger_domain_tracking_updated_at ON public.domain_tracking;
CREATE TRIGGER trigger_domain_tracking_updated_at
  BEFORE UPDATE ON public.domain_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();