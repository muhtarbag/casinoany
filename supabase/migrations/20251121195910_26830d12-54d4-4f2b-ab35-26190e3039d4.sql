-- ============================================================================
-- PART 1: LOYALTY & GAMIFICATION NOTIFICATIONS
-- ============================================================================

-- Function: Notify when user earns points
CREATE OR REPLACE FUNCTION public.notify_user_on_points_earned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_type TEXT;
BEGIN
  -- Get user type
  SELECT user_type INTO v_user_type
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Only notify for significant point gains (10+)
  IF NEW.points >= 10 THEN
    INSERT INTO public.user_notifications (
      title,
      message,
      notification_type,
      target_audience,
      priority,
      action_url,
      action_label,
      icon,
      is_active,
      expires_at
    ) VALUES (
      'Puan Kazandınız! 🎉',
      NEW.description || ' - ' || NEW.points || ' puan kazandınız!',
      'success',
      CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      'normal',
      '/profile/loyalty',
      'Puanlarımı Gör',
      '🏆',
      true,
      now() + interval '15 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function: Notify when user changes tier
CREATE OR REPLACE FUNCTION public.notify_user_on_tier_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_type TEXT;
  v_tier_name TEXT;
  v_tier_emoji TEXT;
BEGIN
  -- Only notify on tier upgrade
  IF OLD.tier IS DISTINCT FROM NEW.tier THEN
    -- Get user type
    SELECT user_type INTO v_user_type
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Set tier display name and emoji
    CASE NEW.tier
      WHEN 'bronze' THEN
        v_tier_name := 'Bronz';
        v_tier_emoji := '🥉';
      WHEN 'silver' THEN
        v_tier_name := 'Gümüş';
        v_tier_emoji := '🥈';
      WHEN 'gold' THEN
        v_tier_name := 'Altın';
        v_tier_emoji := '🥇';
      WHEN 'platinum' THEN
        v_tier_name := 'Platin';
        v_tier_emoji := '💎';
    END CASE;
    
    INSERT INTO public.user_notifications (
      title,
      message,
      notification_type,
      target_audience,
      priority,
      action_url,
      action_label,
      icon,
      is_active,
      expires_at
    ) VALUES (
      'Seviye Atladınız! ' || v_tier_emoji,
      'Tebrikler! ' || v_tier_name || ' seviyesine ulaştınız. Yeni ayrıcalıklarınızı keşfedin!',
      'success',
      CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      'high',
      '/profile/loyalty',
      'Ayrıcalıklarımı Gör',
      v_tier_emoji,
      true,
      now() + interval '30 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function: Notify when user earns achievement
CREATE OR REPLACE FUNCTION public.notify_user_on_achievement_earned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_type TEXT;
  v_achievement_name TEXT;
  v_achievement_icon TEXT;
  v_achievement_points INTEGER;
BEGIN
  -- Get user type
  SELECT user_type INTO v_user_type
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Get achievement details
  SELECT name, icon, points_reward
  INTO v_achievement_name, v_achievement_icon, v_achievement_points
  FROM achievement_definitions
  WHERE code = NEW.achievement_code;
  
  INSERT INTO public.user_notifications (
    title,
    message,
    notification_type,
    target_audience,
    priority,
    action_url,
    action_label,
    icon,
    is_active,
    expires_at
  ) VALUES (
    'Yeni Rozet Kazandınız! 🏅',
    v_achievement_name || ' rozetini kazandınız' || 
    CASE WHEN v_achievement_points > 0 
      THEN ' ve ' || v_achievement_points || ' puan aldınız!'
      ELSE '!'
    END,
    'success',
    CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
    'high',
    '/profile/achievements',
    'Rozetlerimi Gör',
    COALESCE(v_achievement_icon, '🏅'),
    true,
    now() + interval '30 days'
  );
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PART 2: SOCIAL INTERACTION NOTIFICATIONS
-- ============================================================================

-- Function: Notify on referral signup
CREATE OR REPLACE FUNCTION public.notify_user_on_referral_success()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_type TEXT;
  v_referrer_name TEXT;
BEGIN
  -- Only notify on completed referrals
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    -- Get referrer's user type and name
    SELECT p.user_type, COALESCE(p.first_name || ' ' || p.last_name, p.username, p.email)
    INTO v_user_type, v_referrer_name
    FROM profiles p
    WHERE p.id = NEW.referrer_id;
    
    -- Notify referrer
    INSERT INTO public.user_notifications (
      title,
      message,
      notification_type,
      target_audience,
      priority,
      action_url,
      action_label,
      icon,
      is_active,
      expires_at
    ) VALUES (
      'Arkadaşınız Katıldı! 🎊',
      'Davetiniz kabul edildi ve ' || NEW.points_awarded || ' puan kazandınız!',
      'success',
      CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      'normal',
      '/profile/referrals',
      'Referral Geçmişim',
      '🎁',
      true,
      now() + interval '15 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function: Notify on blog comment approval
CREATE OR REPLACE FUNCTION public.notify_user_on_blog_comment_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_type TEXT;
  v_post_title TEXT;
  v_post_slug TEXT;
BEGIN
  -- Only notify on approval
  IF NEW.is_approved = TRUE AND (OLD IS NULL OR OLD.is_approved = FALSE) THEN
    -- Skip if no user_id (anonymous comment)
    IF NEW.user_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Get user type
    SELECT user_type INTO v_user_type
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Get post details
    SELECT title, slug INTO v_post_title, v_post_slug
    FROM blog_posts
    WHERE id = NEW.post_id;
    
    INSERT INTO public.user_notifications (
      title,
      message,
      notification_type,
      target_audience,
      priority,
      action_url,
      action_label,
      icon,
      is_active,
      expires_at
    ) VALUES (
      'Blog Yorumunuz Onaylandı 💬',
      '"' || v_post_title || '" yazısına yaptığınız yorum yayınlandı.',
      'success',
      CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      'normal',
      '/blog/' || v_post_slug,
      'Yorumu Gör',
      '💬',
      true,
      now() + interval '15 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function: Notify when complaint receives helpful mark
CREATE OR REPLACE FUNCTION public.notify_user_on_complaint_helpful()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_type TEXT;
  v_complaint_title TEXT;
  v_complaint_slug TEXT;
  v_complaint_user_id UUID;
  v_helpful_count INTEGER;
BEGIN
  -- Get complaint details
  SELECT title, slug, user_id, helpful_count
  INTO v_complaint_title, v_complaint_slug, v_complaint_user_id, v_helpful_count
  FROM site_complaints
  WHERE id = NEW.complaint_id;
  
  -- Get user type
  SELECT user_type INTO v_user_type
  FROM profiles
  WHERE id = v_complaint_user_id;
  
  -- Notify on milestone helpful counts (10, 50, 100)
  IF v_helpful_count = 10 OR v_helpful_count = 50 OR v_helpful_count = 100 THEN
    INSERT INTO public.user_notifications (
      title,
      message,
      notification_type,
      target_audience,
      priority,
      action_url,
      action_label,
      icon,
      is_active,
      expires_at
    ) VALUES (
      'Popüler İçerik! 🔥',
      'Şikayetiniz "' || v_complaint_title || '" ' || v_helpful_count || ' kişi tarafından faydalı bulundu!',
      'success',
      CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      'normal',
      '/sikayet/' || v_complaint_slug,
      'Görüntüle',
      '🔥',
      true,
      now() + interval '30 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- TRIGGERS FOR PART 1 & 2
-- ============================================================================

-- Loyalty triggers
DROP TRIGGER IF EXISTS trigger_notify_points_earned ON loyalty_transactions;
CREATE TRIGGER trigger_notify_points_earned
  AFTER INSERT ON loyalty_transactions
  FOR EACH ROW
  WHEN (NEW.transaction_type = 'earn')
  EXECUTE FUNCTION notify_user_on_points_earned();

DROP TRIGGER IF EXISTS trigger_notify_tier_change ON user_loyalty_points;
CREATE TRIGGER trigger_notify_tier_change
  AFTER UPDATE OF tier ON user_loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_tier_change();

DROP TRIGGER IF EXISTS trigger_notify_achievement ON user_achievements;
CREATE TRIGGER trigger_notify_achievement
  AFTER INSERT ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_achievement_earned();

-- Social triggers
DROP TRIGGER IF EXISTS trigger_notify_referral ON referral_history;
CREATE TRIGGER trigger_notify_referral
  AFTER INSERT OR UPDATE OF status ON referral_history
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_referral_success();

DROP TRIGGER IF EXISTS trigger_notify_blog_comment ON blog_comments;
CREATE TRIGGER trigger_notify_blog_comment
  AFTER UPDATE OF is_approved ON blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_blog_comment_approval();

DROP TRIGGER IF EXISTS trigger_notify_complaint_helpful ON complaint_likes;
CREATE TRIGGER trigger_notify_complaint_helpful
  AFTER INSERT ON complaint_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_complaint_helpful();