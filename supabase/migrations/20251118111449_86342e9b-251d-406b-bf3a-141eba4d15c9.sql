-- Phase 1: Update existing 97 owner_ids for approved applications
-- This fixes the issue where betting_sites.owner_id was never set during approval

UPDATE betting_sites
SET owner_id = so.user_id, updated_at = NOW()
FROM site_owners so
WHERE betting_sites.id = so.site_id
  AND so.status = 'approved'
  AND betting_sites.owner_id IS NULL;

-- Phase 4: Create ownership_verifications table
CREATE TABLE IF NOT EXISTS public.ownership_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES site_owners(id) ON DELETE CASCADE NOT NULL,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('email', 'domain_txt', 'domain_meta')),
  verification_code TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add admin_notes column to site_owners
ALTER TABLE public.site_owners 
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS ownership_verified BOOLEAN DEFAULT false;

-- Add ownership_verified flag to betting_sites
ALTER TABLE public.betting_sites 
ADD COLUMN IF NOT EXISTS ownership_verified BOOLEAN DEFAULT false;

-- Enable RLS on ownership_verifications
ALTER TABLE public.ownership_verifications ENABLE ROW LEVEL SECURITY;

-- Phase 6: RLS Policies

-- Ownership verifications policies
CREATE POLICY "Users can view own verifications"
ON public.ownership_verifications FOR SELECT
TO authenticated
USING (
  application_id IN (
    SELECT id FROM site_owners WHERE user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can manage verifications"
ON public.ownership_verifications FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Site owners policies updates
CREATE POLICY "Users can view own applications"
ON public.site_owners FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Betting sites policies for site owners
CREATE POLICY "Site owners can view own sites"
ON public.betting_sites FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR is_active = true
);

CREATE POLICY "Site owners can update own sites"
ON public.betting_sites FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ownership_verifications_application_id 
ON ownership_verifications(application_id);

CREATE INDEX IF NOT EXISTS idx_ownership_verifications_verified_at 
ON ownership_verifications(verified_at) WHERE verified_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_site_owners_site_id_status 
ON site_owners(site_id, status);

CREATE INDEX IF NOT EXISTS idx_betting_sites_owner_id 
ON betting_sites(owner_id) WHERE owner_id IS NOT NULL;