
-- =====================================================
-- BONUS RLS POLİTİKALARI GÜNCELLENMESİ
-- =====================================================
-- Finance rolüne de bonus görüntüleme ve yönetme yetkisi ver
-- =====================================================

-- Mevcut admin politikasını kaldır
DROP POLICY IF EXISTS "Admins can manage bonus offers" ON bonus_offers;

-- Yeni politika: Admin VE Finance rolü bonus yönetebilir
CREATE POLICY "Admins and Finance can manage bonus offers"
ON bonus_offers
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'finance'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'finance'::app_role)
);
