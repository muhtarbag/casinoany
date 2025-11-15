-- Create RLS policies for site-logos bucket
-- Note: These policies work with the storage.objects table

-- Allow authenticated admin users to upload logos
CREATE POLICY "Admin users can upload site logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-logos'
  AND (SELECT has_role(auth.uid(), 'admin'::app_role))
);

-- Allow authenticated admin users to update logos
CREATE POLICY "Admin users can update site logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'site-logos'
  AND (SELECT has_role(auth.uid(), 'admin'::app_role))
)
WITH CHECK (
  bucket_id = 'site-logos'
  AND (SELECT has_role(auth.uid(), 'admin'::app_role))
);

-- Allow authenticated admin users to delete logos
CREATE POLICY "Admin users can delete site logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-logos'
  AND (SELECT has_role(auth.uid(), 'admin'::app_role))
);

-- Allow everyone to view logos (public access)
CREATE POLICY "Public access to view site logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'site-logos');