-- ============================================
-- İTİBAR & GÜVEN YÖNETİMİ
-- ============================================

-- Site İtibar Skorları Tablosu
CREATE TABLE IF NOT EXISTS public.site_reputation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES betting_sites(id) ON DELETE CASCADE,
  reputation_score NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (reputation_score >= 0 AND reputation_score <= 100),
  trust_level TEXT NOT NULL DEFAULT 'pending' CHECK (trust_level IN ('pending', 'low', 'medium', 'high', 'excellent')),
  
  -- Skor bileşenleri
  rating_score NUMERIC(5,2) DEFAULT 0.00,
  review_score NUMERIC(5,2) DEFAULT 0.00,
  complaint_resolution_score NUMERIC(5,2) DEFAULT 0.00,
  response_time_score NUMERIC(5,2) DEFAULT 0.00,
  activity_score NUMERIC(5,2) DEFAULT 0.00,
  
  -- Metrikler
  total_complaints INTEGER DEFAULT 0,
  resolved_complaints INTEGER DEFAULT 0,
  complaint_resolution_rate NUMERIC(5,2) DEFAULT 0.00,
  avg_response_time_hours NUMERIC(10,2) DEFAULT 0.00,
  
  -- Timeline verisi
  score_history JSONB DEFAULT '[]'::jsonb,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(site_id)
);

-- Site Rozetleri Tablosu
CREATE TABLE IF NOT EXISTS public.site_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES betting_sites(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('verified', 'top_rated', 'quick_response', 'trusted', 'popular', 'rising_star', 'excellent_service')),
  badge_label TEXT NOT NULL,
  badge_color TEXT NOT NULL DEFAULT '#3b82f6',
  badge_icon TEXT NOT NULL DEFAULT 'shield',
  
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  criteria_met JSONB DEFAULT '{}'::jsonb,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(site_id, badge_type)
);

-- ============================================
-- GELİŞMİŞ ANALİTİK
-- ============================================

-- Trafik Kaynakları Detay Tablosu
CREATE TABLE IF NOT EXISTS public.site_traffic_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES betting_sites(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Kaynak bazlı metrikler
  organic_views INTEGER DEFAULT 0,
  direct_views INTEGER DEFAULT 0,
  social_views INTEGER DEFAULT 0,
  referral_views INTEGER DEFAULT 0,
  
  organic_conversions INTEGER DEFAULT 0,
  direct_conversions INTEGER DEFAULT 0,
  social_conversions INTEGER DEFAULT 0,
  referral_conversions INTEGER DEFAULT 0,
  
  -- En iyi referrer'lar
  top_referrers JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(site_id, metric_date)
);

-- Kullanıcı Davranış Metrikleri
CREATE TABLE IF NOT EXISTS public.site_user_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES betting_sites(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Zaman bazlı analiz
  peak_hours JSONB DEFAULT '{}'::jsonb,
  hourly_distribution JSONB DEFAULT '{}'::jsonb,
  
  -- Cihaz dağılımı
  desktop_users INTEGER DEFAULT 0,
  mobile_users INTEGER DEFAULT 0,
  tablet_users INTEGER DEFAULT 0,
  
  -- Engagement metrikleri
  avg_session_duration NUMERIC(10,2) DEFAULT 0,
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  pages_per_session NUMERIC(5,2) DEFAULT 0,
  
  -- Scroll derinliği
  avg_scroll_depth NUMERIC(5,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(site_id, metric_date)
);

-- ============================================
-- SEO & İÇERİK OPTİMİZASYONU
-- ============================================

-- Site SEO Metrikleri
CREATE TABLE IF NOT EXISTS public.site_seo_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES betting_sites(id) ON DELETE CASCADE,
  
  -- SEO Skoru (0-100)
  seo_score NUMERIC(5,2) DEFAULT 0.00 CHECK (seo_score >= 0 AND seo_score <= 100),
  
  -- Skor bileşenleri
  content_score NUMERIC(5,2) DEFAULT 0.00,
  technical_score NUMERIC(5,2) DEFAULT 0.00,
  meta_score NUMERIC(5,2) DEFAULT 0.00,
  performance_score NUMERIC(5,2) DEFAULT 0.00,
  
  -- Meta tag durumu
  has_meta_title BOOLEAN DEFAULT false,
  has_meta_description BOOLEAN DEFAULT false,
  meta_title_length INTEGER DEFAULT 0,
  meta_description_length INTEGER DEFAULT 0,
  
  -- İçerik analizi
  content_length INTEGER DEFAULT 0,
  heading_structure JSONB DEFAULT '{}'::jsonb,
  image_alt_coverage NUMERIC(5,2) DEFAULT 0.00,
  
  -- Öneriler
  recommendations JSONB DEFAULT '[]'::jsonb,
  critical_issues INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  
  last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(site_id)
);

-- Keyword Tracking
CREATE TABLE IF NOT EXISTS public.site_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES betting_sites(id) ON DELETE CASCADE,
  
  keyword TEXT NOT NULL,
  search_volume INTEGER DEFAULT 0,
  difficulty INTEGER DEFAULT 0 CHECK (difficulty >= 0 AND difficulty <= 100),
  
  -- Ranking
  current_rank INTEGER,
  previous_rank INTEGER,
  best_rank INTEGER,
  worst_rank INTEGER,
  
  -- Trend
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable', 'new')),
  rank_change INTEGER DEFAULT 0,
  
  -- Metrikler
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC(5,2) DEFAULT 0.00,
  
  -- Tracking
  is_target_keyword BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  
  first_tracked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(site_id, keyword)
);

-- ============================================
-- SOSYAL KANIT & GÜVENİLİRLİK
-- ============================================

-- Popülerlik Metrikleri
CREATE TABLE IF NOT EXISTS public.site_popularity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES betting_sites(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Canlı istatistikler
  active_users_now INTEGER DEFAULT 0,
  views_today INTEGER DEFAULT 0,
  clicks_today INTEGER DEFAULT 0,
  registrations_today INTEGER DEFAULT 0,
  
  -- Son aktiviteler
  last_review_at TIMESTAMP WITH TIME ZONE,
  last_bonus_claim_at TIMESTAMP WITH TIME ZONE,
  last_complaint_at TIMESTAMP WITH TIME ZONE,
  
  -- Trend göstergeleri
  is_trending BOOLEAN DEFAULT false,
  is_rising_star BOOLEAN DEFAULT false,
  trend_score NUMERIC(5,2) DEFAULT 0.00,
  
  -- Popülerlik skoru (0-100)
  popularity_score NUMERIC(5,2) DEFAULT 0.00,
  
  -- Karşılaştırmalı metrikler
  category_rank INTEGER,
  overall_rank INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(site_id, metric_date)
);

-- Review Highlights (En iyi yorumlar)
CREATE TABLE IF NOT EXISTS public.site_review_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES betting_sites(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES site_reviews(id) ON DELETE CASCADE,
  
  highlight_type TEXT NOT NULL CHECK (highlight_type IN ('best', 'featured', 'helpful', 'recent', 'verified')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(site_id, review_id, highlight_type)
);

-- ============================================
-- RLS POLİCİES
-- ============================================

-- Site reputation scores
ALTER TABLE public.site_reputation_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reputation scores"
  ON public.site_reputation_scores FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage reputation scores"
  ON public.site_reputation_scores FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Site badges
ALTER TABLE public.site_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active badges"
  ON public.site_badges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage badges"
  ON public.site_badges FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Traffic sources
ALTER TABLE public.site_traffic_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view traffic sources"
  ON public.site_traffic_sources FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Site owners can view their traffic"
  ON public.site_traffic_sources FOR SELECT
  USING (user_owns_site(site_id));

CREATE POLICY "System can insert traffic data"
  ON public.site_traffic_sources FOR INSERT
  WITH CHECK (true);

-- User behavior
ALTER TABLE public.site_user_behavior ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view user behavior"
  ON public.site_user_behavior FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Site owners can view their behavior data"
  ON public.site_user_behavior FOR SELECT
  USING (user_owns_site(site_id));

-- SEO metrics
ALTER TABLE public.site_seo_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view SEO scores"
  ON public.site_seo_metrics FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage SEO metrics"
  ON public.site_seo_metrics FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Site owners can view their SEO metrics"
  ON public.site_seo_metrics FOR SELECT
  USING (user_owns_site(site_id));

-- Keywords
ALTER TABLE public.site_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site owners can view their keywords"
  ON public.site_keywords FOR SELECT
  USING (user_owns_site(site_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage keywords"
  ON public.site_keywords FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Popularity metrics
ALTER TABLE public.site_popularity_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view popularity metrics"
  ON public.site_popularity_metrics FOR SELECT
  USING (true);

CREATE POLICY "System can manage popularity metrics"
  ON public.site_popularity_metrics FOR ALL
  USING (true);

-- Review highlights
ALTER TABLE public.site_review_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active highlights"
  ON public.site_review_highlights FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage highlights"
  ON public.site_review_highlights FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- RPC FONKSİYONLARI
-- ============================================

-- İtibar skoru hesaplama
CREATE OR REPLACE FUNCTION public.calculate_reputation_score(p_site_id UUID)
RETURNS NUMERIC AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tüm sitelerin itibar skorunu hesapla
CREATE OR REPLACE FUNCTION public.calculate_all_reputation_scores()
RETURNS void AS $$
DECLARE
  v_site RECORD;
BEGIN
  FOR v_site IN SELECT id FROM betting_sites WHERE is_active = true LOOP
    PERFORM calculate_reputation_score(v_site.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SEO skoru hesaplama
CREATE OR REPLACE FUNCTION public.calculate_seo_score(p_site_id UUID)
RETURNS NUMERIC AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_site_reputation_site_id ON site_reputation_scores(site_id);
CREATE INDEX IF NOT EXISTS idx_site_badges_site_id ON site_badges(site_id);
CREATE INDEX IF NOT EXISTS idx_site_badges_active ON site_badges(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_traffic_sources_site_date ON site_traffic_sources(site_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_user_behavior_site_date ON site_user_behavior(site_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_seo_metrics_site_id ON site_seo_metrics(site_id);
CREATE INDEX IF NOT EXISTS idx_keywords_site_id ON site_keywords(site_id);
CREATE INDEX IF NOT EXISTS idx_keywords_rank ON site_keywords(current_rank) WHERE current_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_popularity_site_date ON site_popularity_metrics(site_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_popularity_trending ON site_popularity_metrics(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_review_highlights_site ON site_review_highlights(site_id, is_active);

-- Trigger'lar
CREATE TRIGGER update_reputation_updated_at
  BEFORE UPDATE ON site_reputation_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_traffic_sources_updated_at
  BEFORE UPDATE ON site_traffic_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_behavior_updated_at
  BEFORE UPDATE ON site_user_behavior
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_metrics_updated_at
  BEFORE UPDATE ON site_seo_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at
  BEFORE UPDATE ON site_keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_popularity_updated_at
  BEFORE UPDATE ON site_popularity_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();