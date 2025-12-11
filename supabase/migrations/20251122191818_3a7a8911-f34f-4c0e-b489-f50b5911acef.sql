
-- ========================================
-- FIX: System Logs RLS
-- ========================================

-- Mevcut policy'leri kontrol et
-- "Public can insert user action logs" zaten var
-- "Admins can insert system logs" zaten var

-- Problem: log_system_event() SECURITY DEFINER olmasına rağmen RLS violation alıyor
-- Çözüm: Herkesin kendi log'larını yazmasına izin ver

DROP POLICY IF EXISTS "Public can insert user action logs" ON public.system_logs;

-- Herkese kendi user_id'si ile log yazma yetkisi ver
CREATE POLICY "Users can insert their own logs"
ON public.system_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Anonim kullanıcılar için (performans tracking vs)
CREATE POLICY "Anonymous can insert performance logs"
ON public.system_logs
FOR INSERT
TO anon
WITH CHECK (log_type IN ('performance', 'analytics') AND user_id IS NULL);

-- ✅ Şimdi hem authenticated hem de anonymous kullanıcılar log yazabilecek
COMMENT ON TABLE public.system_logs IS 'System logging - Flexible RLS for all user types';
