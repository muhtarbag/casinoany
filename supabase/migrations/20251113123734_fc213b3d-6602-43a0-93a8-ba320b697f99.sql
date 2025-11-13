-- site_reviews tablosuna anonim yorum için name ve email kolonları ekle
ALTER TABLE public.site_reviews
ADD COLUMN name TEXT,
ADD COLUMN email TEXT;

-- user_id kolonunu nullable yap (anonim yorumlar için)
ALTER TABLE public.site_reviews
ALTER COLUMN user_id DROP NOT NULL;

-- Mevcut "Authenticated users can insert reviews" politikasını sil
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.site_reviews;

-- Yeni politika: Herkes anonim yorum ekleyebilir
CREATE POLICY "Anyone can insert reviews anonymously" 
ON public.site_reviews 
FOR INSERT 
WITH CHECK (true);