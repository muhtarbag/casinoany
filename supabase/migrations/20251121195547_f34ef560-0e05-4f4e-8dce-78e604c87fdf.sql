-- Function to create user notification for complaint status changes
CREATE OR REPLACE FUNCTION public.notify_user_on_complaint_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_title TEXT;
  v_message TEXT;
  v_notification_type TEXT;
  v_action_url TEXT;
BEGIN
  -- Only notify on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Set notification details based on status
    CASE NEW.status
      WHEN 'approved' THEN
        v_title := 'Şikayetiniz Onaylandı';
        v_message := 'Şikayetiniz incelendi ve yayına alındı: ' || NEW.title;
        v_notification_type := 'success';
        v_action_url := '/sikayet/' || NEW.slug;
        
      WHEN 'resolved' THEN
        v_title := 'Şikayetiniz Çözüldü';
        v_message := 'Şikayetiniz "' || NEW.title || '" başarıyla çözüldü.';
        v_notification_type := 'success';
        v_action_url := '/sikayet/' || NEW.slug;
        
      WHEN 'rejected' THEN
        v_title := 'Şikayetiniz Reddedildi';
        v_message := 'Şikayetiniz "' || NEW.title || '" değerlendirmeye alındı ancak yayınlanmadı.';
        v_notification_type := 'warning';
        v_action_url := '/profile/complaints';
        
      ELSE
        RETURN NEW; -- No notification for other statuses
    END CASE;
    
    -- Get user's account type
    DECLARE
      v_user_type TEXT;
    BEGIN
      SELECT user_type INTO v_user_type
      FROM profiles
      WHERE id = NEW.user_id;
      
      -- Insert notification
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
        v_title,
        v_message,
        v_notification_type::TEXT,
        CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
        'normal',
        v_action_url,
        'Görüntüle',
        '📢',
        true,
        now() + interval '30 days'
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to notify when complaint receives a response
CREATE OR REPLACE FUNCTION public.notify_user_on_complaint_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_complaint_title TEXT;
  v_complaint_user_id UUID;
  v_complaint_slug TEXT;
  v_user_type TEXT;
  v_is_site_owner BOOLEAN;
BEGIN
  -- Get complaint details
  SELECT title, user_id, slug INTO v_complaint_title, v_complaint_user_id, v_complaint_slug
  FROM site_complaints
  WHERE id = NEW.complaint_id;
  
  -- Check if response is from site owner
  v_is_site_owner := NEW.is_site_owner_response OR NEW.is_official;
  
  -- Only notify complaint owner, not the responder themselves
  IF NEW.user_id != v_complaint_user_id THEN
    -- Get user type
    SELECT user_type INTO v_user_type
    FROM profiles
    WHERE id = v_complaint_user_id;
    
    -- Insert notification
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
      CASE 
        WHEN v_is_site_owner THEN 'Şikayetinize Resmi Cevap Geldi'
        ELSE 'Şikayetinize Cevap Geldi'
      END,
      'Şikayetiniz "' || v_complaint_title || '" hakkında yeni bir cevap aldınız.',
      'info',
      CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      CASE WHEN v_is_site_owner THEN 'high' ELSE 'normal' END,
      '/sikayet/' || v_complaint_slug,
      'Cevabı Gör',
      '💬',
      true,
      now() + interval '30 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to notify when review is approved
CREATE OR REPLACE FUNCTION public.notify_user_on_review_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_site_name TEXT;
  v_user_type TEXT;
BEGIN
  -- Only notify on approval (not rejection or initial creation)
  IF NEW.is_approved = TRUE AND (OLD IS NULL OR OLD.is_approved = FALSE) THEN
    -- Get site name
    SELECT name INTO v_site_name
    FROM betting_sites
    WHERE id = NEW.site_id;
    
    -- Get user type
    SELECT user_type INTO v_user_type
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Insert notification
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
      'Değerlendirmeniz Yayınlandı',
      v_site_name || ' için yaptığınız ' || NEW.rating || ' yıldızlı değerlendirme yayına alındı.',
      'success',
      CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      'normal',
      '/casino/' || (SELECT slug FROM betting_sites WHERE id = NEW.site_id),
      'Görüntüle',
      '⭐',
      true,
      now() + interval '30 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to notify users about pending complaints (scheduled notification)
CREATE OR REPLACE FUNCTION public.notify_pending_complaints()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_complaint RECORD;
  v_user_type TEXT;
BEGIN
  -- Find complaints that are pending for more than 3 days without responses
  FOR v_complaint IN
    SELECT 
      sc.id,
      sc.title,
      sc.slug,
      sc.user_id,
      sc.created_at
    FROM site_complaints sc
    WHERE sc.status = 'pending'
      AND sc.created_at < now() - interval '3 days'
      AND sc.response_count = 0
      AND NOT EXISTS (
        -- Don't notify if already notified in last 7 days
        SELECT 1 
        FROM user_notifications un
        WHERE un.action_url = '/sikayet/' || sc.slug
          AND un.title LIKE '%Bekleyen%'
          AND un.created_at > now() - interval '7 days'
      )
  LOOP
    -- Get user type
    SELECT user_type INTO v_user_type
    FROM profiles
    WHERE id = v_complaint.user_id;
    
    -- Send notification
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
      'Cevaplanmayı Bekleyen Şikayetiniz Var',
      'Şikayetiniz "' || v_complaint.title || '" henüz cevaplanmadı. Durumunu kontrol edebilirsiniz.',
      'info',
      CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
      'normal',
      '/sikayet/' || v_complaint.slug,
      'Şikayeti Gör',
      '⏳',
      true,
      now() + interval '15 days'
    );
  END LOOP;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_complaint_status ON site_complaints;
CREATE TRIGGER trigger_notify_complaint_status
  AFTER UPDATE OF status ON site_complaints
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_complaint_status_change();

DROP TRIGGER IF EXISTS trigger_notify_complaint_response ON complaint_responses;
CREATE TRIGGER trigger_notify_complaint_response
  AFTER INSERT ON complaint_responses
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_complaint_response();

DROP TRIGGER IF EXISTS trigger_notify_review_approval ON site_reviews;
CREATE TRIGGER trigger_notify_review_approval
  AFTER UPDATE OF is_approved ON site_reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_review_approval();

-- Add comment explaining the pending complaints function
COMMENT ON FUNCTION notify_pending_complaints() IS 'Call this function periodically (e.g., daily via cron) to notify users about complaints waiting for responses for more than 3 days';