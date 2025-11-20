-- Güvenlik düzeltmeleri: Yeni eklenen fonksiyonlara search_path ekleme

CREATE OR REPLACE FUNCTION public.calculate_reputation_score(p_site_id UUID)
RETURNS NUMERIC 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_rating_score NUMERIC := 0;
  v_review_score NUMERIC := 0;
  v_complaint_score NUMERIC := 0;
  v_response_score NUMERIC := 0;
  v_activity_score NUMERIC := 0;
  v_total_score NUMERIC := 0;
  v_trust_level TEXT := 'pending';
  
  v_avg_rating NUMERIC;
  v_review_count INTEGER;
  v_complaint_count INTEGER;
  v_resolved_count INTEGER;
  v_avg_response_hours NUMERIC;
BEGIN
  -- Site bilgilerini al
  SELECT avg_rating, review_count 
  INTO v_avg_rating, v_review_count
  FROM betting_sites WHERE id = p_site_id;
  
  -- Şikayet verilerini al
  SELECT 
    COUNT(*) FILTER (WHERE status IN ('resolved', 'closed')),
    COUNT(*)
  INTO v_resolved_count, v_complaint_count
  FROM site_complaints WHERE site_id = p_site_id;
  
  -- Ortalama yanıt süresini hesapla
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600), 0)
  INTO v_avg_response_hours
  FROM site_complaints 
  WHERE site_id = p_site_id AND status != 'pending';
  
  -- Rating skoru (0-25 puan)
  v_rating_score := COALESCE((v_avg_rating / 5.0) * 25, 0);
  
  -- Review skoru (0-20 puan)
  v_review_score := LEAST((v_review_count / 50.0) * 20, 20);
  
  -- Şikayet çözüm skoru (0-25 puan)
  IF v_complaint_count > 0 THEN
    v_complaint_score := (v_resolved_count::NUMERIC / v_complaint_count) * 25;
  ELSE
    v_complaint_score := 20; -- Hiç şikayet yok bonus
  END IF;
  
  -- Yanıt süresi skoru (0-20 puan)
  IF v_avg_response_hours <= 24 THEN
    v_response_score := 20;
  ELSIF v_avg_response_hours <= 48 THEN
    v_response_score := 15;
  ELSIF v_avg_response_hours <= 72 THEN
    v_response_score := 10;
  ELSE
    v_response_score := 5;
  END IF;
  
  -- Aktivite skoru (0-10 puan)
  v_activity_score := LEAST((v_review_count + v_resolved_count) / 10.0 * 10, 10);
  
  -- Toplam skor
  v_total_score := v_rating_score + v_review_score + v_complaint_score + v_response_score + v_activity_score;
  
  -- Trust level belirleme
  IF v_total_score >= 85 THEN
    v_trust_level := 'excellent';
  ELSIF v_total_score >= 70 THEN
    v_trust_level := 'high';
  ELSIF v_total_score >= 50 THEN
    v_trust_level := 'medium';
  ELSIF v_total_score >= 30 THEN
    v_trust_level := 'low';
  ELSE
    v_trust_level := 'pending';
  END IF;
  
  -- Veritabanına kaydet
  INSERT INTO site_reputation_scores (
    site_id, reputation_score, trust_level,
    rating_score, review_score, complaint_resolution_score,
    response_time_score, activity_score,
    total_complaints, resolved_complaints,
    complaint_resolution_rate, avg_response_time_hours,
    last_calculated_at
  ) VALUES (
    p_site_id, v_total_score, v_trust_level,
    v_rating_score, v_review_score, v_complaint_score,
    v_response_score, v_activity_score,
    v_complaint_count, v_resolved_count,
    CASE WHEN v_complaint_count > 0 THEN (v_resolved_count::NUMERIC / v_complaint_count) * 100 ELSE 0 END,
    v_avg_response_hours,
    now()
  )
  ON CONFLICT (site_id) DO UPDATE SET
    reputation_score = EXCLUDED.reputation_score,
    trust_level = EXCLUDED.trust_level,
    rating_score = EXCLUDED.rating_score,
    review_score = EXCLUDED.review_score,
    complaint_resolution_score = EXCLUDED.complaint_resolution_score,
    response_time_score = EXCLUDED.response_time_score,
    activity_score = EXCLUDED.activity_score,
    total_complaints = EXCLUDED.total_complaints,
    resolved_complaints = EXCLUDED.resolved_complaints,
    complaint_resolution_rate = EXCLUDED.complaint_resolution_rate,
    avg_response_time_hours = EXCLUDED.avg_response_time_hours,
    last_calculated_at = now(),
    updated_at = now();
  
  RETURN v_total_score;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_all_reputation_scores()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_site RECORD;
BEGIN
  FOR v_site IN SELECT id FROM betting_sites WHERE is_active = true LOOP
    PERFORM calculate_reputation_score(v_site.id);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_seo_score(p_site_id UUID)
RETURNS NUMERIC 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_content_score NUMERIC := 0;
  v_technical_score NUMERIC := 0;
  v_meta_score NUMERIC := 0;
  v_total_score NUMERIC := 0;
  
  v_site RECORD;
  v_content_length INTEGER := 0;
  v_has_meta_title BOOLEAN := false;
  v_has_meta_description BOOLEAN := false;
BEGIN
  -- Site bilgilerini al
  SELECT * INTO v_site FROM betting_sites WHERE id = p_site_id;
  
  -- İçerik skoru hesapla
  v_content_length := COALESCE(LENGTH(v_site.expert_review), 0) + 
                      COALESCE(LENGTH(v_site.verdict), 0) + 
                      COALESCE(LENGTH(v_site.login_guide), 0);
  
  IF v_content_length > 2000 THEN
    v_content_score := 30;
  ELSIF v_content_length > 1000 THEN
    v_content_score := 20;
  ELSIF v_content_length > 500 THEN
    v_content_score := 10;
  END IF;
  
  -- Meta tag skoru
  v_has_meta_title := v_site.name IS NOT NULL AND LENGTH(v_site.name) > 0;
  v_has_meta_description := v_site.bonus IS NOT NULL AND LENGTH(v_site.bonus) > 0;
  
  IF v_has_meta_title AND v_has_meta_description THEN
    v_meta_score := 40;
  ELSIF v_has_meta_title THEN
    v_meta_score := 20;
  END IF;
  
  -- Teknik skor (features, pros, cons varlığı)
  IF ARRAY_LENGTH(v_site.features, 1) > 5 AND 
     ARRAY_LENGTH(v_site.pros, 1) > 3 AND 
     ARRAY_LENGTH(v_site.cons, 1) > 2 THEN
    v_technical_score := 30;
  ELSIF ARRAY_LENGTH(v_site.features, 1) > 0 THEN
    v_technical_score := 15;
  END IF;
  
  v_total_score := v_content_score + v_technical_score + v_meta_score;
  
  -- Veritabanına kaydet
  INSERT INTO site_seo_metrics (
    site_id, seo_score, content_score, technical_score, meta_score,
    has_meta_title, has_meta_description,
    content_length, last_analyzed_at
  ) VALUES (
    p_site_id, v_total_score, v_content_score, v_technical_score, v_meta_score,
    v_has_meta_title, v_has_meta_description,
    v_content_length, now()
  )
  ON CONFLICT (site_id) DO UPDATE SET
    seo_score = EXCLUDED.seo_score,
    content_score = EXCLUDED.content_score,
    technical_score = EXCLUDED.technical_score,
    meta_score = EXCLUDED.meta_score,
    has_meta_title = EXCLUDED.has_meta_title,
    has_meta_description = EXCLUDED.has_meta_description,
    content_length = EXCLUDED.content_length,
    last_analyzed_at = now(),
    updated_at = now();
  
  RETURN v_total_score;
END;
$$;