-- Fix search_path for the new functions
CREATE OR REPLACE FUNCTION generate_complaint_slug(title_text text, site_slug text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION set_complaint_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := generate_complaint_slug(
      NEW.title,
      (SELECT slug FROM betting_sites WHERE id = NEW.site_id)
    );
  END IF;
  RETURN NEW;
END;
$$;