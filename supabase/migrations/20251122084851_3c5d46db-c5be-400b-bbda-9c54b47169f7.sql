-- Create storage bucket for bonus images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bonus-images',
  'bonus-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- RLS Policies for bonus-images bucket
CREATE POLICY "Admins can upload bonus images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bonus-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Site owners can upload bonus images for their sites"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bonus-images' AND
  auth.uid() IN (
    SELECT user_id FROM site_owners 
    WHERE status = 'approved'
  )
);

CREATE POLICY "Anyone can view bonus images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bonus-images');

CREATE POLICY "Admins can update bonus images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'bonus-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Site owners can update their bonus images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'bonus-images' AND
  auth.uid() IN (
    SELECT user_id FROM site_owners 
    WHERE status = 'approved'
  )
);

CREATE POLICY "Admins can delete bonus images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'bonus-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Site owners can delete their bonus images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'bonus-images' AND
  auth.uid() IN (
    SELECT user_id FROM site_owners 
    WHERE status = 'approved'
  )
);