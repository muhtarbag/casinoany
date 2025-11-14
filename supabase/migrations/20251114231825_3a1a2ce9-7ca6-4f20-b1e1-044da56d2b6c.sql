-- Add mobile_image_url column to site_banners table
ALTER TABLE site_banners 
ADD COLUMN mobile_image_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN site_banners.mobile_image_url IS 'Separate image URL optimized for mobile devices';
