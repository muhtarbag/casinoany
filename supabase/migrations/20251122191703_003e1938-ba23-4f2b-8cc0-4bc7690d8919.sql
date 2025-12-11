
-- ========================================
-- CRITICAL SECURITY FIX: Site Stats RLS
-- ========================================
-- Problem: Herkes site istatistiklerini manipüle edebiliyor
-- Solution: Public INSERT/UPDATE policy'lerini kaldır, sadece RPC function kullan

-- 1. Tehlikeli policy'leri kaldır
DROP POLICY IF EXISTS "System tracking access" ON public.site_stats;
DROP POLICY IF EXISTS "System tracking update" ON public.site_stats;

-- 2. Sadece admin'lerin doğrudan erişimini koru
-- (Diğer kullanıcılar increment_site_stats() RPC fonksiyonunu kullanacak)
-- "Admin full access" policy zaten var, o yeterli

-- 3. View için public read policy'yi koru
-- "Public read access" ve "Anyone can view stats" zaten var

-- 4. increment_site_stats() fonksiyonu zaten SECURITY DEFINER olarak çalışıyor
-- Bu sayede RLS bypass edilip güvenli şekilde güncelleme yapılabiliyor

-- ✅ Artık sadece:
-- - Admin: Full access (SELECT, INSERT, UPDATE, DELETE)
-- - Public: Read-only (SELECT)
-- - Stats Update: Sadece increment_site_stats() RPC function ile

COMMENT ON TABLE public.site_stats IS 'Site statistics - Updates only through increment_site_stats() RPC function';
