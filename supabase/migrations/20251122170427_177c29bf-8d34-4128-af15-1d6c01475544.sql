-- Function to scan all existing content for domains
CREATE OR REPLACE FUNCTION public.scan_existing_content_for_domains()
RETURNS TABLE(scanned_records INTEGER, found_domains INTEGER)
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
  -- Scan betting_sites
  FOR v_site IN 
    SELECT id, owner_id, expert_review, verdict, login_guide, withdrawal_guide 
    FROM betting_sites 
    WHERE expert_review IS NOT NULL 
       OR verdict IS NOT NULL 
       OR login_guide IS NOT NULL 
       OR withdrawal_guide IS NOT NULL
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

-- Enable realtime for domain_tracking table
ALTER TABLE public.domain_tracking REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.domain_tracking;