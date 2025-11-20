
-- Tüm aktif siteler için site_stats kayıtları oluştur
INSERT INTO site_stats (site_id, views, clicks, email_clicks, whatsapp_clicks, telegram_clicks, twitter_clicks, instagram_clicks, facebook_clicks, youtube_clicks)
SELECT 
  id,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0
FROM betting_sites
WHERE is_active = true
  AND id NOT IN (SELECT site_id FROM site_stats WHERE site_id IS NOT NULL)
ON CONFLICT (site_id) DO NOTHING;
