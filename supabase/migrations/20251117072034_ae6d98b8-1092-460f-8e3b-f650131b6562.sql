-- Create user type enum
CREATE TYPE public.user_type AS ENUM ('individual', 'corporate');

-- Add user type and corporate-specific fields to profiles
ALTER TABLE public.profiles
ADD COLUMN user_type user_type DEFAULT 'individual' NOT NULL,
ADD COLUMN company_name text,
ADD COLUMN company_tax_number text,
ADD COLUMN company_type text,
ADD COLUMN company_authorized_person text,
ADD COLUMN company_phone text,
ADD COLUMN company_address text,
ADD COLUMN company_email text,
ADD COLUMN company_website text,
ADD COLUMN is_verified boolean DEFAULT false;

-- Add unique constraint for company tax number (for corporate users)
CREATE UNIQUE INDEX unique_company_tax_number 
ON public.profiles (company_tax_number) 
WHERE company_tax_number IS NOT NULL;

-- Add check constraint to ensure corporate users have company name
ALTER TABLE public.profiles
ADD CONSTRAINT check_corporate_has_company_name
CHECK (
  (user_type = 'individual') OR 
  (user_type = 'corporate' AND company_name IS NOT NULL)
);

-- Create index for faster filtering by user type
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);

COMMENT ON COLUMN public.profiles.user_type IS 'Kullanıcı tipi: bireysel veya kurumsal';
COMMENT ON COLUMN public.profiles.company_name IS 'Kurumsal kullanıcılar için şirket adı';
COMMENT ON COLUMN public.profiles.company_tax_number IS 'Kurumsal kullanıcılar için vergi numarası';
COMMENT ON COLUMN public.profiles.is_verified IS 'Kurumsal kullanıcı için doğrulama durumu';