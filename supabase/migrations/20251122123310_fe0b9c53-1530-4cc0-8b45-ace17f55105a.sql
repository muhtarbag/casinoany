-- Site sahipleri kendi sitelerine ait private şikayetleri görebilsin
CREATE POLICY "Site owners can view private complaints about their sites"
ON public.site_complaints
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.site_owners
    WHERE site_owners.user_id = auth.uid()
    AND site_owners.site_id = site_complaints.site_id
    AND site_owners.status = 'approved'
  )
);

-- Private şikayetler için ek güvenlik - is_public=false ise site sahibi olmalı veya admin olmalı veya kendi şikayeti olmalı
-- Bu policy'yi eklemeye gerek yok çünkü zaten varolan policy'ler yeterli