-- Add slug column to betting_sites table
ALTER TABLE public.betting_sites 
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Generate slugs from existing site names
UPDATE public.betting_sites
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Make slug NOT NULL after populating
ALTER TABLE public.betting_sites 
ALTER COLUMN slug SET NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_betting_sites_slug ON public.betting_sites(slug);