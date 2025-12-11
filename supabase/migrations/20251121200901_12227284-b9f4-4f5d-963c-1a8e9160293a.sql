-- Fix all triggers to use notification_type instead of type

-- 1. Points earned
DROP TRIGGER IF EXISTS trigger_notify_points_earned ON loyalty_transactions;
DROP FUNCTION IF EXISTS notify_points_earned();

CREATE OR REPLACE FUNCTION notify_points_earned()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type TEXT;
BEGIN
  SELECT user_type INTO v_user_type FROM profiles WHERE id = NEW.user_id;
  
  IF NEW.points > 0 AND NEW.transaction_type = 'earn' THEN
    INSERT INTO user_notifications (
      title, message, notification_type, target_audience, priority,
      action_url, action_label, icon, expires_at
    ) VALUES (
      '🎉 Puan Kazandınız!',
      NEW.points || ' puan kazandınız: ' || NEW.description,
      'points_earned',
      CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      'normal', '/profile/loyalty', 'Puanlarımı Gör', 'trophy',
      now() + interval '30 days'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trigger_notify_points_earned
AFTER INSERT ON loyalty_transactions FOR EACH ROW
EXECUTE FUNCTION notify_points_earned();

-- 2. Tier upgrade
DROP TRIGGER IF EXISTS trigger_notify_tier_upgrade ON user_loyalty_points;
DROP FUNCTION IF EXISTS notify_tier_upgrade();

CREATE OR REPLACE FUNCTION notify_tier_upgrade()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type TEXT;
  v_tier_name TEXT;
  v_tier_emoji TEXT;
BEGIN
  IF OLD.tier IS DISTINCT FROM NEW.tier AND NEW.tier > OLD.tier THEN
    SELECT user_type INTO v_user_type FROM profiles WHERE id = NEW.user_id;
    
    CASE NEW.tier
      WHEN 'silver' THEN v_tier_name := 'Silver'; v_tier_emoji := '🥈';
      WHEN 'gold' THEN v_tier_name := 'Gold'; v_tier_emoji := '🥇';
      WHEN 'platinum' THEN v_tier_name := 'Platinum'; v_tier_emoji := '💎';
      ELSE v_tier_name := 'Bronze'; v_tier_emoji := '🥉';
    END CASE;
    
    INSERT INTO user_notifications (
      title, message, notification_type, target_audience, priority,
      action_url, action_label, icon, expires_at
    ) VALUES (
      v_tier_emoji || ' Seviye Atladınız!',
      'Tebrikler! ' || v_tier_name || ' seviyesine yükseldiniz!',
      'tier_upgrade',
      CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      'high', '/profile/loyalty', 'Ayrıcalıklarımı Gör', 'star',
      now() + interval '30 days'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trigger_notify_tier_upgrade
AFTER UPDATE ON user_loyalty_points FOR EACH ROW
EXECUTE FUNCTION notify_tier_upgrade();

-- 3. Achievement unlocked
DROP TRIGGER IF EXISTS trigger_notify_achievement_unlocked ON user_achievements;
DROP FUNCTION IF EXISTS notify_achievement_unlocked();

CREATE OR REPLACE FUNCTION notify_achievement_unlocked()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type TEXT;
  v_achievement_name TEXT;
  v_achievement_desc TEXT;
  v_achievement_icon TEXT;
BEGIN
  SELECT user_type INTO v_user_type FROM profiles WHERE id = NEW.user_id;
  SELECT name, description, icon 
  INTO v_achievement_name, v_achievement_desc, v_achievement_icon
  FROM achievement_definitions WHERE code = NEW.achievement_code;
  
  INSERT INTO user_notifications (
    title, message, notification_type, target_audience, priority,
    action_url, action_label, icon, expires_at
  ) VALUES (
    '🏆 Yeni Rozet Kazandınız!',
    v_achievement_name || ': ' || v_achievement_desc,
    'achievement_unlocked',
    CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
    'high', '/profile/achievements', 'Rozetlerimi Gör', v_achievement_icon,
    now() + interval '30 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trigger_notify_achievement_unlocked
AFTER INSERT ON user_achievements FOR EACH ROW
EXECUTE FUNCTION notify_achievement_unlocked();

-- 4. Referral success
DROP TRIGGER IF EXISTS trigger_notify_referral_success ON referral_history;
DROP FUNCTION IF EXISTS notify_referral_success();

CREATE OR REPLACE FUNCTION notify_referral_success()
RETURNS TRIGGER AS $$
DECLARE
  v_referrer_type TEXT;
  v_referred_username TEXT;
BEGIN
  IF NEW.status = 'completed' THEN
    SELECT user_type INTO v_referrer_type FROM profiles WHERE id = NEW.referrer_id;
    SELECT COALESCE(username, first_name, email) INTO v_referred_username 
    FROM profiles WHERE id = NEW.referred_id;
    
    INSERT INTO user_notifications (
      title, message, notification_type, target_audience, priority,
      action_url, action_label, icon, expires_at
    ) VALUES (
      '👥 Arkadaşınız Katıldı!',
      v_referred_username || ' davetinizi kabul etti. ' || NEW.points_awarded || ' puan kazandınız!',
      'referral_success',
      CASE WHEN v_referrer_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      'high', '/profile/referrals', 'Davetlerimi Gör', 'users',
      now() + interval '30 days'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trigger_notify_referral_success
AFTER INSERT OR UPDATE ON referral_history FOR EACH ROW
EXECUTE FUNCTION notify_referral_success();

-- 5. Blog comment approved
DROP TRIGGER IF EXISTS trigger_notify_blog_comment_approved ON blog_comments;
DROP FUNCTION IF EXISTS notify_blog_comment_approved();

CREATE OR REPLACE FUNCTION notify_blog_comment_approved()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type TEXT;
  v_post_title TEXT;
BEGIN
  IF NEW.is_approved = TRUE AND (OLD IS NULL OR OLD.is_approved = FALSE) AND NEW.user_id IS NOT NULL THEN
    SELECT user_type INTO v_user_type FROM profiles WHERE id = NEW.user_id;
    SELECT title INTO v_post_title FROM blog_posts WHERE id = NEW.post_id;
    
    INSERT INTO user_notifications (
      title, message, notification_type, target_audience, priority,
      action_url, action_label, icon, expires_at
    ) VALUES (
      '✅ Yorumunuz Onaylandı!',
      '"' || v_post_title || '" yazısına yaptığınız yorum yayınlandı.',
      'comment_approved',
      CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      'normal', '/blog/' || (SELECT slug FROM blog_posts WHERE id = NEW.post_id),
      'Yorumu Gör', 'message-circle', now() + interval '30 days'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trigger_notify_blog_comment_approved
AFTER INSERT OR UPDATE ON blog_comments FOR EACH ROW
EXECUTE FUNCTION notify_blog_comment_approved();

-- 6. Complaint support
DROP TRIGGER IF EXISTS trigger_notify_complaint_support ON complaint_likes;
DROP FUNCTION IF EXISTS notify_complaint_support();

CREATE OR REPLACE FUNCTION notify_complaint_support()
RETURNS TRIGGER AS $$
DECLARE
  v_complaint_owner_id UUID;
  v_user_type TEXT;
  v_complaint_title TEXT;
  v_like_count INTEGER;
BEGIN
  SELECT user_id, title INTO v_complaint_owner_id, v_complaint_title
  FROM site_complaints WHERE id = NEW.complaint_id;
  
  SELECT user_type INTO v_user_type FROM profiles WHERE id = v_complaint_owner_id;
  SELECT COUNT(*) INTO v_like_count FROM complaint_likes WHERE complaint_id = NEW.complaint_id;
  
  IF v_like_count IN (1, 5, 10, 25, 50, 100) THEN
    INSERT INTO user_notifications (
      title, message, notification_type, target_audience, priority,
      action_url, action_label, icon, expires_at
    ) VALUES (
      CASE 
        WHEN v_like_count = 1 THEN '👍 İlk Destek Geldi!'
        WHEN v_like_count >= 100 THEN '🔥 Popüler İçerik!'
        ELSE '❤️ Destek Geldi!'
      END,
      'Şikayetiniz "' || v_complaint_title || '" ' || v_like_count || ' kişi tarafından desteklendi.',
      'complaint_support',
      CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      CASE WHEN v_like_count >= 10 THEN 'high' ELSE 'normal' END,
      '/complaints/' || (SELECT slug FROM site_complaints WHERE id = NEW.complaint_id),
      'Şikayeti Gör', 'heart', now() + interval '30 days'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trigger_notify_complaint_support
AFTER INSERT ON complaint_likes FOR EACH ROW
EXECUTE FUNCTION notify_complaint_support();

-- 7. New bonus
DROP TRIGGER IF EXISTS trigger_notify_new_bonus ON bonus_offers;
DROP FUNCTION IF EXISTS notify_new_bonus();

CREATE OR REPLACE FUNCTION notify_new_bonus()
RETURNS TRIGGER AS $$
DECLARE
  v_site_name TEXT;
  v_site_slug TEXT;
BEGIN
  IF NEW.is_active = TRUE THEN
    SELECT name, slug INTO v_site_name, v_site_slug FROM betting_sites WHERE id = NEW.site_id;
    
    INSERT INTO user_notifications (
      title, message, notification_type, target_audience, priority,
      action_url, action_label, icon, expires_at
    ) VALUES (
      '🎁 Yeni Bonus!',
      v_site_name || ' - ' || NEW.title || ': ' || NEW.bonus_amount,
      'new_bonus', 'all', 'high', '/casinos/' || v_site_slug,
      'Bonusu Gör', 'gift', now() + interval '7 days'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trigger_notify_new_bonus
AFTER INSERT ON bonus_offers FOR EACH ROW
EXECUTE FUNCTION notify_new_bonus();

-- 8. Reputation increase
DROP TRIGGER IF EXISTS trigger_notify_reputation_increase ON site_reputation_scores;
DROP FUNCTION IF EXISTS notify_reputation_increase();

CREATE OR REPLACE FUNCTION notify_reputation_increase()
RETURNS TRIGGER AS $$
DECLARE
  v_site_owner_id UUID;
  v_site_name TEXT;
BEGIN
  IF NEW.overall_score > OLD.overall_score + 5 THEN
    SELECT owner_id, name INTO v_site_owner_id, v_site_name FROM betting_sites WHERE id = NEW.site_id;
    
    IF v_site_owner_id IS NOT NULL THEN
      INSERT INTO user_notifications (
        title, message, notification_type, target_audience, priority,
        action_url, action_label, icon, expires_at
      ) VALUES (
        '📈 Puanınız Yükseldi!',
        v_site_name || ' reputasyon puanı ' || (NEW.overall_score - OLD.overall_score) || ' puan arttı!',
        'reputation_increase', 'corporate', 'normal', '/panel/site-management',
        'Detayları Gör', 'trending-up', now() + interval '30 days'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trigger_notify_reputation_increase
AFTER UPDATE ON site_reputation_scores FOR EACH ROW
EXECUTE FUNCTION notify_reputation_increase();

-- 9. Rating drop
DROP TRIGGER IF EXISTS trigger_notify_rating_drop ON betting_sites;
DROP FUNCTION IF EXISTS notify_rating_drop();

CREATE OR REPLACE FUNCTION notify_rating_drop()
RETURNS TRIGGER AS $$
DECLARE
  v_site_owner_id UUID;
  v_site_name TEXT;
BEGIN
  IF NEW.avg_rating < OLD.avg_rating - 0.5 THEN
    SELECT owner_id, name INTO v_site_owner_id, v_site_name FROM betting_sites WHERE id = NEW.site_id;
    
    IF v_site_owner_id IS NOT NULL THEN
      INSERT INTO user_notifications (
        title, message, notification_type, target_audience, priority,
        action_url, action_label, icon, expires_at
      ) VALUES (
        '⚠️ Puan Düştü',
        v_site_name || ' ortalama puanı ' || ROUND(NEW.avg_rating, 1) || ' oldu.',
        'rating_drop', 'corporate', 'high', '/panel/site-management',
        'İncelemeleri Gör', 'alert-triangle', now() + interval '30 days'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trigger_notify_rating_drop
AFTER UPDATE ON betting_sites FOR EACH ROW
EXECUTE FUNCTION notify_rating_drop();

-- 10. Welcome
DROP TRIGGER IF EXISTS trigger_notify_welcome ON profiles;
DROP FUNCTION IF EXISTS notify_welcome();

CREATE OR REPLACE FUNCTION notify_welcome()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_notifications (
    title, message, notification_type, target_audience, priority,
    action_url, action_label, icon, expires_at
  ) VALUES (
    '👋 Hoş Geldiniz!',
    'Aramıza hoş geldiniz ' || COALESCE(NEW.first_name, NEW.username, 'Kullanıcı') || '!',
    'welcome',
    CASE WHEN NEW.user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
    'high', '/', 'Keşfet', 'smile', now() + interval '7 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trigger_notify_welcome
AFTER INSERT ON profiles FOR EACH ROW
EXECUTE FUNCTION notify_welcome();

-- Fix daily job functions too
DROP FUNCTION IF EXISTS notify_expiring_campaigns();
DROP FUNCTION IF EXISTS notify_old_unresolved_complaints();

CREATE OR REPLACE FUNCTION notify_expiring_campaigns()
RETURNS void AS $$
BEGIN
  INSERT INTO user_notifications (
    title, message, notification_type, target_audience, priority,
    action_url, action_label, icon, expires_at
  )
  SELECT DISTINCT
    '⏰ Kampanya Sona Eriyor!',
    bs.name || ' - ' || bo.title || ' kampanyası yakında sona erecek!',
    'campaign_expiring', 'all', 'high', '/casinos/' || bs.slug,
    'Bonusu Kullan', 'clock', now() + interval '7 days'
  FROM bonus_offers bo
  JOIN betting_sites bs ON bs.id = bo.site_id
  WHERE bo.is_active = true
    AND bo.validity_period IS NOT NULL
    AND bo.validity_period::date BETWEEN CURRENT_DATE AND CURRENT_DATE + interval '3 days'
    AND NOT EXISTS (
      SELECT 1 FROM user_notifications un
      WHERE un.notification_type = 'campaign_expiring'
        AND un.message LIKE '%' || bo.title || '%'
        AND un.created_at > now() - interval '2 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION notify_old_unresolved_complaints()
RETURNS void AS $$
BEGIN
  INSERT INTO user_notifications (
    title, message, notification_type, target_audience, priority,
    action_url, action_label, icon, expires_at
  )
  SELECT DISTINCT
    '🚨 Çözülmeyen Şikayet',
    sc.title || ' şikayeti ' || (CURRENT_DATE - sc.created_at::date) || ' gündür çözülmedi.',
    'old_complaint', 'corporate', 'urgent', '/panel/site-management',
    'Yanıtla', 'alert-circle', now() + interval '7 days'
  FROM site_complaints sc
  JOIN betting_sites bs ON bs.id = sc.site_id
  WHERE sc.status NOT IN ('resolved', 'rejected')
    AND sc.created_at < now() - interval '7 days'
    AND bs.owner_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM user_notifications un
      WHERE un.notification_type = 'old_complaint'
        AND un.message LIKE '%' || sc.title || '%'
        AND un.created_at > now() - interval '3 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;