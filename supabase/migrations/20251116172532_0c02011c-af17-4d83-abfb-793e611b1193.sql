-- Add social media click tracking columns to site_stats
ALTER TABLE site_stats
ADD COLUMN IF NOT EXISTS email_clicks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS whatsapp_clicks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS telegram_clicks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS twitter_clicks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS instagram_clicks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS facebook_clicks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS youtube_clicks integer DEFAULT 0;