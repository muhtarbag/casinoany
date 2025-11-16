-- Add new_site_name column to site_owners table
ALTER TABLE site_owners 
ADD COLUMN IF NOT EXISTS new_site_name TEXT;

-- Add comment
COMMENT ON COLUMN site_owners.new_site_name IS 'If provided, admin will create a new site with this name upon approval';