-- Add support_email and social_pinterest columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS support_email text,
ADD COLUMN IF NOT EXISTS social_pinterest text;

-- Add support_email and social_pinterest columns to site_owners table
ALTER TABLE site_owners 
ADD COLUMN IF NOT EXISTS support_email text,
ADD COLUMN IF NOT EXISTS social_pinterest text;

COMMENT ON COLUMN profiles.support_email IS 'Destek email adresi';
COMMENT ON COLUMN profiles.social_pinterest IS 'Pinterest profil linki';
COMMENT ON COLUMN site_owners.support_email IS 'Site destek email adresi';
COMMENT ON COLUMN site_owners.social_pinterest IS 'Site Pinterest profil linki';