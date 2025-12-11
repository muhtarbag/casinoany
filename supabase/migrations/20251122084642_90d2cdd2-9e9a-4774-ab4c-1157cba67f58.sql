-- Add image_url column to bonus_offers table
ALTER TABLE bonus_offers 
ADD COLUMN image_url text;

COMMENT ON COLUMN bonus_offers.image_url IS 'URL of the bonus offer image/banner';