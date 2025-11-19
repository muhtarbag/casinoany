-- 1. Önce tüm eski duplicate policy'leri sil
DROP POLICY IF EXISTS "Admin users can delete site logos" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update site logos" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can upload site logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow temporary logo uploads during registration" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view site logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload site logos" ON storage.objects;
DROP POLICY IF EXISTS "Public access to view site logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view site logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own site logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own site logos" ON storage.objects;

-- 2. Temiz, basit, açık policy'ler oluştur
-- Public READ (herkes görebilir)
CREATE POLICY "site_logos_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-logos');

-- Authenticated INSERT (giriş yapmış herkes upload edebilir)
CREATE POLICY "site_logos_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-logos');

-- Authenticated UPDATE (giriş yapmış herkes güncelleyebilir)
CREATE POLICY "site_logos_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-logos')
WITH CHECK (bucket_id = 'site-logos');

-- Authenticated DELETE (giriş yapmış herkes silebilir)
CREATE POLICY "site_logos_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-logos');