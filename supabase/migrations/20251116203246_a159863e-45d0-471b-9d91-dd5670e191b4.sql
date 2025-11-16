-- Add new social media fields to site_owners table
ALTER TABLE site_owners 
ADD COLUMN IF NOT EXISTS social_telegram_channel TEXT,
ADD COLUMN IF NOT EXISTS social_kick TEXT,
ADD COLUMN IF NOT EXISTS social_discord TEXT,
ADD COLUMN IF NOT EXISTS social_bio_link TEXT;

-- Add comments
COMMENT ON COLUMN site_owners.social_telegram_channel IS 'Company Telegram channel URL';
COMMENT ON COLUMN site_owners.social_kick IS 'Company Kick.com URL';
COMMENT ON COLUMN site_owners.social_discord IS 'Company Discord server URL';
COMMENT ON COLUMN site_owners.social_bio_link IS 'Company bio/link in bio page URL';