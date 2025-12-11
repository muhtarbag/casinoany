-- Step 1: Clean up duplicate entries (keep the oldest one)
DELETE FROM public.domain_tracking a
USING public.domain_tracking b
WHERE a.id > b.id
  AND a.domain = b.domain
  AND a.source_table = b.source_table
  AND a.source_column = b.source_column
  AND a.source_record_id = b.source_record_id;

-- Step 2: Add INSERT policy for domain_tracking (for SECURITY DEFINER triggers)
CREATE POLICY "Service role can insert domains"
ON public.domain_tracking
FOR INSERT
TO service_role
WITH CHECK (true);

-- Step 3: Add unique constraint to prevent duplicates
ALTER TABLE public.domain_tracking
ADD CONSTRAINT domain_tracking_unique_entry 
UNIQUE (domain, source_table, source_column, source_record_id);

-- Step 4: Fix domain extraction regex to remove trailing parentheses
CREATE OR REPLACE FUNCTION public.extract_domains_from_text(p_text text)
RETURNS TABLE(domain text, full_url text)
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
  ),
  cleaned_urls AS (
    SELECT 
      -- Remove trailing punctuation and parentheses
      regexp_replace(url, '[)\].,;:!?]+$', '', 'g') as clean_url
    FROM urls
  )
  SELECT DISTINCT
    regexp_replace(
      regexp_replace(clean_url, '^https?://(www\.)?', '', 'i'),
      '/.*$',
      ''
    ) as domain,
    clean_url as full_url
  FROM cleaned_urls
  WHERE clean_url IS NOT NULL AND length(clean_url) > 7;
END;
$function$;

-- Step 5: Update track_domains_in_record to handle user_id better and use ON CONFLICT
CREATE OR REPLACE FUNCTION public.track_domains_in_record(
  p_table_name text, 
  p_record_id uuid, 
  p_user_id uuid, 
  p_content text, 
  p_column_name text
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
    ON CONFLICT (domain, source_table, source_column, source_record_id) 
    DO UPDATE SET
      full_url = EXCLUDED.full_url,
      user_id = COALESCE(EXCLUDED.user_id, domain_tracking.user_id),
      context_text = EXCLUDED.context_text,
      updated_at = now();
  END LOOP;
END;
$function$;

-- Step 6: Improve scan function
CREATE OR REPLACE FUNCTION public.scan_existing_content_for_domains()
RETURNS TABLE(scanned_records integer, found_domains integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_scanned INTEGER := 0;
  v_found INTEGER := 0;
  v_site RECORD;
  v_review RECORD;
  v_complaint RECORD;
  v_response RECORD;
  v_post RECORD;
  v_comment RECORD;
BEGIN
  -- Scan betting_sites with proper owner_id
  FOR v_site IN 
    SELECT bs.id, bs.owner_id, bs.expert_review, bs.verdict, bs.login_guide, bs.withdrawal_guide 
    FROM betting_sites bs
    WHERE bs.expert_review IS NOT NULL 
       OR bs.verdict IS NOT NULL 
       OR bs.login_guide IS NOT NULL 
       OR bs.withdrawal_guide IS NOT NULL
  LOOP
    v_scanned := v_scanned + 1;
    
    IF v_site.expert_review IS NOT NULL THEN
      PERFORM track_domains_in_record('betting_sites', v_site.id, v_site.owner_id, v_site.expert_review, 'expert_review');
    END IF;
    
    IF v_site.verdict IS NOT NULL THEN
      PERFORM track_domains_in_record('betting_sites', v_site.id, v_site.owner_id, v_site.verdict, 'verdict');
    END IF;
    
    IF v_site.login_guide IS NOT NULL THEN
      PERFORM track_domains_in_record('betting_sites', v_site.id, v_site.owner_id, v_site.login_guide, 'login_guide');
    END IF;
    
    IF v_site.withdrawal_guide IS NOT NULL THEN
      PERFORM track_domains_in_record('betting_sites', v_site.id, v_site.owner_id, v_site.withdrawal_guide, 'withdrawal_guide');
    END IF;
  END LOOP;

  -- Scan site_reviews
  FOR v_review IN 
    SELECT id, user_id, comment 
    FROM site_reviews 
    WHERE comment IS NOT NULL
  LOOP
    v_scanned := v_scanned + 1;
    PERFORM track_domains_in_record('site_reviews', v_review.id, v_review.user_id, v_review.comment, 'comment');
  END LOOP;

  -- Scan site_complaints
  FOR v_complaint IN 
    SELECT id, user_id, description 
    FROM site_complaints 
    WHERE description IS NOT NULL
  LOOP
    v_scanned := v_scanned + 1;
    PERFORM track_domains_in_record('site_complaints', v_complaint.id, v_complaint.user_id, v_complaint.description, 'description');
  END LOOP;

  -- Scan complaint_responses
  FOR v_response IN 
    SELECT id, user_id, response_text 
    FROM complaint_responses 
    WHERE response_text IS NOT NULL
  LOOP
    v_scanned := v_scanned + 1;
    PERFORM track_domains_in_record('complaint_responses', v_response.id, v_response.user_id, v_response.response_text, 'response_text');
  END LOOP;

  -- Scan blog_posts
  FOR v_post IN 
    SELECT id, author_id, content 
    FROM blog_posts 
    WHERE content IS NOT NULL
  LOOP
    v_scanned := v_scanned + 1;
    PERFORM track_domains_in_record('blog_posts', v_post.id, v_post.author_id, v_post.content, 'content');
  END LOOP;

  -- Scan blog_comments
  FOR v_comment IN 
    SELECT id, user_id, comment 
    FROM blog_comments 
    WHERE comment IS NOT NULL
  LOOP
    v_scanned := v_scanned + 1;
    PERFORM track_domains_in_record('blog_comments', v_comment.id, v_comment.user_id, v_comment.comment, 'comment');
  END LOOP;

  -- Get found domains count
  SELECT COUNT(*) INTO v_found FROM domain_tracking;

  RETURN QUERY SELECT v_scanned, v_found;
END;
$function$;

-- Step 7: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_domain_tracking_domain ON public.domain_tracking(domain);
CREATE INDEX IF NOT EXISTS idx_domain_tracking_source ON public.domain_tracking(source_table, source_column);
CREATE INDEX IF NOT EXISTS idx_domain_tracking_flags ON public.domain_tracking(is_flagged, is_whitelisted);
CREATE INDEX IF NOT EXISTS idx_domain_tracking_user ON public.domain_tracking(user_id) WHERE user_id IS NOT NULL;

-- Step 8: Add comment for documentation
COMMENT ON CONSTRAINT domain_tracking_unique_entry ON public.domain_tracking IS 
'Ensures each domain+source combination is tracked only once. Updates existing records on conflict.';