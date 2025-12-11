
-- =====================================================
-- SECURİTY FİX: SEARCH PATH
-- =====================================================

-- notify_new_bonus fonksiyonunu search_path ile yeniden oluştur
CREATE OR REPLACE FUNCTION notify_new_bonus()
RETURNS TRIGGER AS $$
DECLARE
  v_site_name TEXT;
  v_site_slug TEXT;
BEGIN
  -- Site bilgilerini al
  SELECT name, slug INTO v_site_name, v_site_slug
  FROM betting_sites
  WHERE id = NEW.site_id;

  -- Tüm kullanıcılara bildirim gönder
  IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
    INSERT INTO user_notifications (
      title, message, notification_type, target_audience, priority,
      action_url, action_label, icon, expires_at
    ) VALUES (
      '🎁 Yeni Bonus!',
      v_site_name || ' - ' || NEW.title || ': ' || NEW.bonus_amount,
      'announcement', 'all', 'high', '/casinos/' || v_site_slug,
      'Bonusu Gör', 'gift', now() + interval '7 days'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
