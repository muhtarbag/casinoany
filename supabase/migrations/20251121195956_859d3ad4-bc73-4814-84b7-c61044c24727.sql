-- ============================================================================
-- PART 3: SITE OWNER PERFORMANCE & ALERTS
-- ============================================================================

-- Function: Notify site owner on reputation score milestone
CREATE OR REPLACE FUNCTION public.notify_site_owner_on_reputation_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_site_owner_id UUID;
  v_site_name TEXT;
  v_site_slug TEXT;
BEGIN
  -- Get site owner
  SELECT owner_id, name, slug INTO v_site_owner_id, v_site_name, v_site_slug
  FROM betting_sites
  WHERE id = NEW.site_id;
  
  -- Skip if no owner
  IF v_site_owner_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Notify on trust level change
  IF OLD.trust_level IS DISTINCT FROM NEW.trust_level THEN
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
      CASE NEW.trust_level
        WHEN 'excellent' THEN 'Mükemmel Güven Seviyesi! 🌟'
        WHEN 'trusted' THEN 'Güvenilir Seviyeye Ulaştınız! ⭐'
        WHEN 'verified' THEN 'Doğrulanmış Seviye! ✓'
        ELSE 'Seviye Güncellendi'
      END,
      v_site_name || ' siteniz ' || NEW.overall_score || ' puana ulaştı ve ' || 
      CASE NEW.trust_level
        WHEN 'excellent' THEN 'mükemmel'
        WHEN 'trusted' THEN 'güvenilir'
        WHEN 'verified' THEN 'doğrulanmış'
        ELSE 'gelişen'
      END || ' seviyesinde!',
      'success',
      'corporate',
      'high',
      '/panel/site-management',
      'Detayları Gör',
      '📊',
      true,
      now() + interval '30 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function: Notify site owner on review count milestone
CREATE OR REPLACE FUNCTION public.notify_site_owner_on_review_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_site_owner_id UUID;
  v_site_name TEXT;
  v_review_count INTEGER;
BEGIN
  -- Only on INSERT of approved reviews
  IF NEW.is_approved = TRUE THEN
    -- Get site details
    SELECT owner_id, name, review_count INTO v_site_owner_id, v_site_name, v_review_count
    FROM betting_sites
    WHERE id = NEW.site_id;
    
    -- Skip if no owner
    IF v_site_owner_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Notify on milestones (100, 500, 1000)
    IF v_review_count IN (100, 500, 1000) THEN
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
        'Yeni Milestone! 🎯',
        v_site_name || ' siteniz ' || v_review_count || ' değerlendirmeye ulaştı!',
        'success',
        'corporate',
        'high',
        '/panel/site-management',
        'İstatistikleri Gör',
        '🎯',
        true,
        now() + interval '60 days'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function: Notify site owner on low rating
CREATE OR REPLACE FUNCTION public.notify_site_owner_on_rating_drop()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_site_owner_id UUID;
  v_site_name TEXT;
BEGIN
  -- Only on significant rating drops (0.5+)
  IF OLD.avg_rating IS NOT NULL AND NEW.avg_rating < OLD.avg_rating - 0.5 THEN
    -- Get site owner
    SELECT owner_id, name INTO v_site_owner_id, v_site_name
    FROM betting_sites
    WHERE id = NEW.id;
    
    -- Skip if no owner
    IF v_site_owner_id IS NULL THEN
      RETURN NEW;
    END IF;
    
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
      'Dikkat: Puanınız Düştü ⚠️',
      v_site_name || ' sitenizin puanı ' || ROUND(OLD.avg_rating::numeric, 1) || 
      ' yıldızdan ' || ROUND(NEW.avg_rating::numeric, 1) || ' yıldıza düştü. Son yorumları inceleyin.',
      'warning',
      'corporate',
      'urgent',
      '/panel/site-management',
      'Yorumları İncele',
      '⚠️',
      true,
      now() + interval '30 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PART 4: WELCOME & ONBOARDING NOTIFICATIONS
-- ============================================================================

-- Function: Send welcome notification to new users
CREATE OR REPLACE FUNCTION public.send_welcome_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Send welcome notification
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
    'Hoş Geldiniz! 👋',
    'Platformumuza katıldığınız için teşekkürler! İlk adımlarınızı atın ve avantajları keşfedin.',
    'info',
    CASE WHEN NEW.user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
    'normal',
    '/profile/getting-started',
    'Başlayın',
    '🎉',
    true,
    now() + interval '30 days'
  );
  
  RETURN NEW;
END;
$$;

-- Function: Remind users to complete profile
CREATE OR REPLACE FUNCTION public.check_incomplete_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  -- Find profiles created 3+ days ago with incomplete info
  FOR v_profile IN
    SELECT id, user_type, created_at
    FROM profiles
    WHERE created_at < now() - interval '3 days'
      AND created_at > now() - interval '30 days'
      AND (
        first_name IS NULL OR 
        last_name IS NULL OR
        phone IS NULL
      )
      AND NOT EXISTS (
        SELECT 1 
        FROM user_notifications 
        WHERE action_url = '/profile/edit'
          AND created_at > now() - interval '7 days'
      )
  LOOP
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
      'Profilinizi Tamamlayın 📝',
      'Profilinizi tamamlayarak daha iyi bir deneyim yaşayın ve özel fırsatlardan yararlanın!',
      'info',
      CASE WHEN v_profile.user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      'normal',
      '/profile/edit',
      'Profili Düzenle',
      '📝',
      true,
      now() + interval '15 days'
    );
  END LOOP;
END;
$$;

-- ============================================================================
-- PART 5: RE-ENGAGEMENT NOTIFICATIONS
-- ============================================================================

-- Function: Send re-engagement notifications to inactive users
CREATE OR REPLACE FUNCTION public.send_reengagement_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user RECORD;
  v_last_login TIMESTAMP;
  v_new_complaints_count INTEGER;
  v_new_reviews_count INTEGER;
BEGIN
  -- Find users inactive for 30+ days
  FOR v_user IN
    SELECT 
      p.id,
      p.user_type,
      p.email
    FROM profiles p
    WHERE p.created_at < now() - interval '30 days'
      AND NOT EXISTS (
        -- Check if already sent re-engagement in last 30 days
        SELECT 1 
        FROM user_notifications un
        WHERE un.title LIKE '%Özledik%'
          AND un.created_at > now() - interval '30 days'
      )
  LOOP
    -- Check last activity (this is approximate - you'd need to track user sessions)
    SELECT created_at INTO v_last_login
    FROM page_views
    WHERE user_id = v_user.id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Skip if user was active recently
    IF v_last_login > now() - interval '30 days' THEN
      CONTINUE;
    END IF;
    
    -- Count new content since last visit
    SELECT COUNT(*) INTO v_new_complaints_count
    FROM site_complaints
    WHERE created_at > COALESCE(v_last_login, now() - interval '30 days')
      AND status = 'approved';
    
    SELECT COUNT(*) INTO v_new_reviews_count
    FROM site_reviews
    WHERE created_at > COALESCE(v_last_login, now() - interval '30 days')
      AND is_approved = true;
    
    -- Send re-engagement notification
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
      'Seni Özledik! 💙',
      'Uzun zamandır görüşemedik! ' || 
      CASE 
        WHEN (v_new_complaints_count + v_new_reviews_count) > 0 
        THEN (v_new_complaints_count + v_new_reviews_count)::text || ' yeni içerik seni bekliyor!'
        ELSE 'Neler olup bittiğini keşfet!'
      END,
      'info',
      CASE WHEN v_user.user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      'normal',
      '/',
      'Keşfet',
      '💙',
      true,
      now() + interval '15 days'
    );
  END LOOP;
END;
$$;

-- ============================================================================
-- TRIGGERS FOR PART 3, 4, 5
-- ============================================================================

-- Site owner performance triggers
DROP TRIGGER IF EXISTS trigger_notify_reputation_milestone ON site_reputation_scores;
CREATE TRIGGER trigger_notify_reputation_milestone
  AFTER UPDATE OF trust_level ON site_reputation_scores
  FOR EACH ROW
  EXECUTE FUNCTION notify_site_owner_on_reputation_milestone();

DROP TRIGGER IF EXISTS trigger_notify_review_milestone ON site_reviews;
CREATE TRIGGER trigger_notify_review_milestone
  AFTER INSERT ON site_reviews
  FOR EACH ROW
  WHEN (NEW.is_approved = true)
  EXECUTE FUNCTION notify_site_owner_on_review_milestone();

DROP TRIGGER IF EXISTS trigger_notify_rating_drop ON betting_sites;
CREATE TRIGGER trigger_notify_rating_drop
  AFTER UPDATE OF avg_rating ON betting_sites
  FOR EACH ROW
  EXECUTE FUNCTION notify_site_owner_on_rating_drop();

-- Welcome trigger
DROP TRIGGER IF EXISTS trigger_send_welcome ON profiles;
CREATE TRIGGER trigger_send_welcome
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_notification();

-- Add comments for scheduled functions
COMMENT ON FUNCTION check_incomplete_profiles() IS 
'SCHEDULED: Run daily to remind users with incomplete profiles. Call via cron job.';

COMMENT ON FUNCTION send_reengagement_notifications() IS 
'SCHEDULED: Run daily to send re-engagement notifications to inactive users (30+ days). Call via cron job.';

COMMENT ON FUNCTION notify_pending_complaints() IS 
'SCHEDULED: Run daily to notify users about complaints waiting for responses (3+ days). Call via cron job.';