-- Fix security warnings: Add search_path to functions

DROP FUNCTION IF EXISTS calculate_reputation_score(UUID);
DROP FUNCTION IF EXISTS calculate_seo_score(UUID);

-- Calculate Reputation Score (with secure search_path)
CREATE FUNCTION calculate_reputation_score(p_site_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rating_score INTEGER := 0;
  v_review_score INTEGER := 0;
  v_complaint_score INTEGER := 0;
  v_response_score INTEGER := 0;
  v_overall_score INTEGER := 0;
  v_trust_level TEXT := 'developing';
  v_resolution_rate DECIMAL(5,2) := 0;
  v_avg_response_hours INTEGER := 0;
BEGIN
  -- Rating score (0-25 points based on avg_rating)
  SELECT COALESCE(LEAST((avg_rating * 5)::INTEGER, 25), 0)
  INTO v_rating_score
  FROM betting_sites
  WHERE id = p_site_id;

  -- Review score (0-25 points based on review count and positive reviews)
  SELECT COALESCE(LEAST((COUNT(*) / 4)::INTEGER, 15) + LEAST((COUNT(*) FILTER (WHERE rating >= 4) / 2)::INTEGER, 10), 0)
  INTO v_review_score
  FROM site_reviews
  WHERE site_id = p_site_id AND is_approved = true;

  -- Complaint resolution score (0-30 points)
  WITH complaint_stats AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'resolved') as resolved
    FROM site_complaints
    WHERE site_id = p_site_id
  )
  SELECT 
    CASE 
      WHEN total = 0 THEN 15
      ELSE LEAST(((resolved::DECIMAL / total) * 30)::INTEGER, 30)
    END,
    CASE 
      WHEN total = 0 THEN 0
      ELSE (resolved::DECIMAL / total * 100)
    END
  INTO v_complaint_score, v_resolution_rate
  FROM complaint_stats;

  -- Response time score
  v_response_score := 15;
  v_avg_response_hours := 24;

  -- Calculate overall score
  v_overall_score := v_rating_score + v_review_score + v_complaint_score + v_response_score;

  -- Determine trust level
  v_trust_level := CASE
    WHEN v_overall_score >= 85 THEN 'excellent'
    WHEN v_overall_score >= 70 THEN 'trusted'
    WHEN v_overall_score >= 50 THEN 'verified'
    ELSE 'developing'
  END;

  -- Insert or update reputation score
  INSERT INTO site_reputation_scores (
    site_id, overall_score, trust_level, rating_score, review_score,
    complaint_resolution_score, response_time_score, resolution_rate,
    avg_response_hours, last_calculated_at
  )
  VALUES (
    p_site_id, v_overall_score, v_trust_level, v_rating_score, v_review_score,
    v_complaint_score, v_response_score, v_resolution_rate,
    v_avg_response_hours, now()
  )
  ON CONFLICT (site_id) DO UPDATE SET
    overall_score = EXCLUDED.overall_score,
    trust_level = EXCLUDED.trust_level,
    rating_score = EXCLUDED.rating_score,
    review_score = EXCLUDED.review_score,
    complaint_resolution_score = EXCLUDED.complaint_resolution_score,
    response_time_score = EXCLUDED.response_time_score,
    resolution_rate = EXCLUDED.resolution_rate,
    avg_response_hours = EXCLUDED.avg_response_hours,
    last_calculated_at = now(),
    updated_at = now();
END;
$$;

-- Calculate SEO Score (with secure search_path)
CREATE FUNCTION calculate_seo_score(p_site_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_content_score INTEGER := 0;
  v_meta_score INTEGER := 0;
  v_technical_score INTEGER := 0;
  v_overall_score INTEGER := 0;
  v_has_meta_title BOOLEAN := false;
  v_has_meta_description BOOLEAN := false;
  v_meta_title_length INTEGER := 0;
  v_meta_description_length INTEGER := 0;
  v_total_content_length INTEGER := 0;
BEGIN
  -- Get site content data
  SELECT 
    COALESCE(LENGTH(expert_review), 0) + 
    COALESCE(LENGTH(verdict), 0) + 
    COALESCE(LENGTH(login_guide), 0) + 
    COALESCE(LENGTH(withdrawal_guide), 0)
  INTO v_total_content_length
  FROM betting_sites
  WHERE id = p_site_id;

  -- Content quality score (0-40 points)
  v_content_score := LEAST((v_total_content_length / 100)::INTEGER, 40);

  -- Meta tags score (0-30 points)
  v_meta_score := 20;
  v_has_meta_title := true;
  v_has_meta_description := true;
  v_meta_title_length := 50;
  v_meta_description_length := 150;

  -- Technical SEO score (0-30 points)
  v_technical_score := 25;

  -- Calculate overall
  v_overall_score := v_content_score + v_meta_score + v_technical_score;

  -- Insert or update
  INSERT INTO site_seo_metrics (
    site_id, overall_score, content_quality_score, meta_tags_score,
    technical_seo_score, has_meta_title, has_meta_description,
    meta_title_length, meta_description_length, total_content_length,
    last_analyzed_at
  )
  VALUES (
    p_site_id, v_overall_score, v_content_score, v_meta_score,
    v_technical_score, v_has_meta_title, v_has_meta_description,
    v_meta_title_length, v_meta_description_length, v_total_content_length,
    now()
  )
  ON CONFLICT (site_id) DO UPDATE SET
    overall_score = EXCLUDED.overall_score,
    content_quality_score = EXCLUDED.content_quality_score,
    meta_tags_score = EXCLUDED.meta_tags_score,
    technical_seo_score = EXCLUDED.technical_seo_score,
    total_content_length = EXCLUDED.total_content_length,
    last_analyzed_at = now(),
    updated_at = now();
END;
$$;