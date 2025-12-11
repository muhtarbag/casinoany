
-- Önce view'ı drop et
DROP VIEW IF EXISTS site_stats_with_details;

-- Sosyal medya kolonlarıyla yeni view oluştur
CREATE VIEW site_stats_with_details AS
SELECT 
  s.id,
  s.site_id,
  s.views,
  s.clicks,
  s.email_clicks,
  s.whatsapp_clicks,
  s.telegram_clicks,
  s.twitter_clicks,
  s.instagram_clicks,
  s.facebook_clicks,
  s.youtube_clicks,
  s.created_at,
  s.updated_at,
  b.name as site_name,
  b.slug as site_slug,
  b.rating as site_rating,
  b.bonus as site_bonus,
  b.logo_url as site_logo_url,
  b.is_active as site_is_active
FROM site_stats s
LEFT JOIN betting_sites b ON s.site_id = b.id;
