-- Add slug column to site_complaints table for SEO-friendly URLs
ALTER TABLE site_complaints ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS site_complaints_slug_idx ON site_complaints(slug);

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_complaint_slug(title_text text, site_slug text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert title to lowercase and replace spaces/special chars with hyphens
  base_slug := lower(regexp_replace(
    regexp_replace(
      regexp_replace(title_text, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  ));
  
  -- Trim leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Limit to 100 characters
  base_slug := substring(base_slug from 1 for 100);
  
  -- Combine with site slug
  final_slug := site_slug || '/' || base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM site_complaints WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := site_slug || '/' || base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Generate slugs for existing complaints
UPDATE site_complaints sc
SET slug = generate_complaint_slug(sc.title, bs.slug)
FROM betting_sites bs
WHERE sc.site_id = bs.id
AND sc.slug IS NULL;

-- Create trigger to auto-generate slug on insert
CREATE OR REPLACE FUNCTION set_complaint_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := generate_complaint_slug(
      NEW.title,
      (SELECT slug FROM betting_sites WHERE id = NEW.site_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_complaint_slug_trigger ON site_complaints;
CREATE TRIGGER set_complaint_slug_trigger
  BEFORE INSERT ON site_complaints
  FOR EACH ROW
  EXECUTE FUNCTION set_complaint_slug();

-- Add comment
COMMENT ON COLUMN site_complaints.slug IS 'SEO-friendly URL slug in format: site-slug/complaint-title-slug';