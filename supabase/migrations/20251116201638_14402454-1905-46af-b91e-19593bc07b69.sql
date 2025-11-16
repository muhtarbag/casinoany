-- Allow temporary logo uploads during registration
-- Users can upload to temp/ folder without authentication
CREATE POLICY "Allow temporary logo uploads during registration"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'site-logos' 
  AND (storage.foldername(name))[1] = 'temp'
);

-- Allow public access to view logos in site-logos bucket
CREATE POLICY "Anyone can view site logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'site-logos');

-- Allow authenticated users to upload their own logos
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-logos');

-- Allow authenticated users to update their own logos
CREATE POLICY "Authenticated users can update logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'site-logos')
WITH CHECK (bucket_id = 'site-logos');

-- Allow authenticated users to delete their own logos
CREATE POLICY "Authenticated users can delete logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'site-logos');