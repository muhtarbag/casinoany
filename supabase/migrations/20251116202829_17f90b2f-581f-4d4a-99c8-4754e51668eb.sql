-- Make site_id nullable in site_owners table
ALTER TABLE site_owners 
ALTER COLUMN site_id DROP NOT NULL;