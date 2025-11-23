-- Update review approval trigger to send user notification
CREATE OR REPLACE FUNCTION public.award_points_on_review_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user_type TEXT;
  v_site_name TEXT;
BEGIN
  IF NEW.is_approved = TRUE AND (OLD IS NULL OR OLD.is_approved = FALSE) THEN
    IF NEW.user_id IS NOT NULL THEN
      -- Award points
      PERFORM award_loyalty_points(
        NEW.user_id, 20, 'site_review', 'Site değerlendirmesi onaylandı',
        jsonb_build_object('review_id', NEW.id, 'rating', NEW.rating)
      );
      
      -- Check and award achievements
      PERFORM check_and_award_achievements(NEW.user_id);
      
      -- Get user type for notification
      SELECT user_type INTO v_user_type FROM profiles WHERE id = NEW.user_id;
      
      -- Get site name
      SELECT name INTO v_site_name FROM betting_sites WHERE id = NEW.site_id;
      
      -- Create notification for user
      INSERT INTO user_notifications (
        title, 
        message, 
        notification_type, 
        target_audience, 
        priority,
        action_url, 
        action_label, 
        icon, 
        expires_at
      ) VALUES (
        '✅ Değerlendirmeniz Onaylandı',
        v_site_name || ' için yaptığınız değerlendirme onaylandı ve yayınlandı. 20 puan kazandınız!',
        'review_approved',
        CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
        'normal',
        '/profile/reviews',
        'Değerlendirmelerimi Gör',
        'check-circle',
        now() + interval '30 days'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;