-- Create site_owners table with all wizard fields
CREATE TABLE IF NOT EXISTS site_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES betting_sites(id) ON DELETE CASCADE NOT NULL,
  company_name text,
  description text,
  logo_url text,
  social_facebook text,
  social_twitter text,
  social_instagram text,
  social_linkedin text,
  social_youtube text,
  infrastructure_provider text,
  infrastructure_notes text,
  contact_person_name text,
  contact_email text,
  contact_teams text,
  contact_telegram text,
  contact_whatsapp text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id, site_id)
);

-- Enable RLS
ALTER TABLE site_owners ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all site owners" 
ON site_owners FOR SELECT
TO authenticated 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Site owners can view own records" 
ON site_owners FOR SELECT
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can create site owner requests"
ON site_owners FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage site owners" 
ON site_owners FOR ALL
TO authenticated 
USING (has_role(auth.uid(), 'admin'));

-- Create storage bucket for site logos if not exists
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'site-logos',
    'site-logos',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  )
  ON CONFLICT (id) DO NOTHING;
END$$;

-- Create RLS policies for site logos bucket
DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view site logos'
  ) THEN
    CREATE POLICY "Public can view site logos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'site-logos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload site logos'
  ) THEN
    CREATE POLICY "Authenticated users can upload site logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'site-logos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own site logos'
  ) THEN
    CREATE POLICY "Users can update their own site logos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'site-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own site logos'
  ) THEN
    CREATE POLICY "Users can delete their own site logos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'site-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END$$;