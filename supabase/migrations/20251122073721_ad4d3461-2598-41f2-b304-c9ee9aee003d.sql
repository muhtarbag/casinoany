-- Create storage bucket for ad banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ad-banners',
  'ad-banners',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ad banners
CREATE POLICY "Anyone can view ad banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-banners');

CREATE POLICY "Admins can upload ad banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ad-banners' 
  AND auth.uid() IN (
    SELECT user_id FROM user_roles 
    WHERE role = 'admin' AND status = 'approved'
  )
);

CREATE POLICY "Admins can update ad banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ad-banners' 
  AND auth.uid() IN (
    SELECT user_id FROM user_roles 
    WHERE role = 'admin' AND status = 'approved'
  )
);

CREATE POLICY "Admins can delete ad banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ad-banners' 
  AND auth.uid() IN (
    SELECT user_id FROM user_roles 
    WHERE role = 'admin' AND status = 'approved'
  )
);