-- FIX: Remove duplicate notification triggers and consolidate

-- Drop duplicate review approval trigger (award_points_on_review_approval already sends notification)
DROP TRIGGER IF EXISTS trigger_notify_review_approval ON site_reviews;
DROP FUNCTION IF EXISTS notify_user_on_review_approval();

-- Drop duplicate blog comment approval triggers
DROP TRIGGER IF EXISTS trigger_notify_blog_comment ON blog_comments;
DROP TRIGGER IF EXISTS trigger_notify_blog_comment_approved ON blog_comments;
DROP FUNCTION IF EXISTS notify_user_on_blog_comment_approval();
DROP FUNCTION IF EXISTS notify_blog_comment_approved();

-- Update blog comment approval function to include notification
CREATE OR REPLACE FUNCTION public.award_points_on_blog_comment_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user_type TEXT;
  v_post_title TEXT;
  v_post_slug TEXT;
BEGIN
  IF NEW.is_approved = TRUE AND (OLD IS NULL OR OLD.is_approved = FALSE) THEN
    IF NEW.user_id IS NOT NULL THEN
      -- Award points
      PERFORM award_loyalty_points(
        NEW.user_id, 10, 'blog_comment', 'Blog yorumu onaylandı',
        jsonb_build_object('comment_id', NEW.id)
      );
      
      -- Check and award achievements
      PERFORM check_and_award_achievements(NEW.user_id);
      
      -- Get user type
      SELECT user_type INTO v_user_type FROM profiles WHERE id = NEW.user_id;
      
      -- Get post details
      SELECT title, slug INTO v_post_title, v_post_slug FROM blog_posts WHERE id = NEW.post_id;
      
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
        '✅ Yorumunuz Onaylandı',
        v_post_title || ' yazısına yaptığınız yorum onaylandı ve yayınlandı. 10 puan kazandınız!',
        'comment_approved',
        CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
        'normal',
        '/blog/' || v_post_slug,
        'Yorumu Gör',
        'message-circle',
        now() + interval '30 days'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Update complaint resolution function to include notification
CREATE OR REPLACE FUNCTION public.award_points_on_complaint_resolution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user_type TEXT;
  v_complaint_title TEXT;
  v_complaint_slug TEXT;
BEGIN
  IF NEW.status = 'resolved' AND (OLD.status IS NULL OR OLD.status != 'resolved') THEN
    IF NEW.user_id IS NOT NULL THEN
      -- Award points
      PERFORM award_loyalty_points(
        NEW.user_id, 15, 'complaint_resolved', 'Şikayetiniz çözüldü',
        jsonb_build_object('complaint_id', NEW.id)
      );
      
      -- Check and award achievements
      PERFORM check_and_award_achievements(NEW.user_id);
      
      -- Get user type
      SELECT user_type INTO v_user_type FROM profiles WHERE id = NEW.user_id;
      
      -- Get complaint details
      SELECT title, slug INTO v_complaint_title, v_complaint_slug FROM site_complaints WHERE id = NEW.id;
      
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
        '✅ Şikayetiniz Çözüldü',
        v_complaint_title || ' şikayetiniz başarıyla çözüldü. 15 puan kazandınız!',
        'success',
        CASE WHEN v_user_type = 'corporate' THEN 'corporate' ELSE 'individual' END,
        'normal',
        '/sikayet/' || v_complaint_slug,
        'Şikayeti Gör',
        'check-circle',
        now() + interval '30 days'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;