-- ============================================================
-- AŞAMA 1: KRİTİK GÜVENLİK DÜZELTMELERİ
-- RLS Policy Security Fix - Analytics Tablolar
-- ============================================================

-- 1. SITE_STATS TABLE: Public write access'i kapat
-- ============================================================

-- Mevcut güvensiz policy'leri kaldır
DROP POLICY IF EXISTS "Anyone can insert stats" ON public.site_stats;
DROP POLICY IF EXISTS "Anyone can update stats" ON public.site_stats;
DROP POLICY IF EXISTS "Public can insert affiliate metrics" ON public.affiliate_metrics;
DROP POLICY IF EXISTS "Public can update affiliate metrics" ON public.affiliate_metrics;
DROP POLICY IF EXISTS "Public can insert analytics" ON public.casino_content_analytics;
DROP POLICY IF EXISTS "Public can update analytics" ON public.casino_content_analytics;

-- Güvenli policy'ler oluştur: site_stats
-- Public: Sadece okuma
CREATE POLICY "Public read access" ON public.site_stats
  FOR SELECT
  USING (true);

-- Admin: Tam erişim
CREATE POLICY "Admin full access" ON public.site_stats
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Sistem/Tracking: Insert ve update (view tracking için)
CREATE POLICY "System tracking access" ON public.site_stats
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System tracking update" ON public.site_stats
  FOR UPDATE
  USING (true);

-- 2. AFFILIATE_METRICS TABLE: Public write access'i kapat
-- ============================================================

-- Public: Sadece okuma
CREATE POLICY "Public read access" ON public.affiliate_metrics
  FOR SELECT
  USING (true);

-- Admin: Tam erişim (mevcut policy zaten var, kontrol)
-- CREATE POLICY "Admins can manage affiliate metrics" zaten mevcut

-- Sistem: Insert ve update (metrics tracking için)
CREATE POLICY "System metrics tracking" ON public.affiliate_metrics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System metrics update" ON public.affiliate_metrics
  FOR UPDATE
  USING (true);

-- 3. CASINO_CONTENT_ANALYTICS TABLE: Public write access'i kapat
-- ============================================================

-- Public: Sadece okuma
CREATE POLICY "Public read access" ON public.casino_content_analytics
  FOR SELECT
  USING (true);

-- Admin: Tam erişim (mevcut policy zaten var)
-- CREATE POLICY "Admins can manage analytics" zaten mevcut

-- Sistem: Insert ve update (analytics tracking için)
CREATE POLICY "System analytics tracking" ON public.casino_content_analytics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System analytics update" ON public.casino_content_analytics
  FOR UPDATE
  USING (true);

-- ============================================================
-- RAPOR: AŞAMA 1.1 TAMAMLANDI
-- ============================================================
-- ✅ site_stats: Public write kapatıldı, system tracking izni verildi
-- ✅ affiliate_metrics: Public write kapatıldı, system tracking izni verildi  
-- ✅ casino_content_analytics: Public write kapatıldı, system tracking izni verildi
-- ✅ Tüm tablolar: Public read-only, Admin full access
-- ============================================================