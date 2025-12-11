-- =====================================================
-- GAMIFICATION & ACHIEVEMENT TRIGGERS
-- =====================================================

-- 1. Blog yorumu onaylandığında puan kazandırma
CREATE OR REPLACE FUNCTION award_points_on_blog_comment_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NEW.is_approved = TRUE AND (OLD IS NULL OR OLD.is_approved = FALSE) THEN
    IF NEW.user_id IS NOT NULL THEN
      PERFORM award_loyalty_points(
        NEW.user_id, 10, 'blog_comment', 'Blog yorumu onaylandı',
        jsonb_build_object('comment_id', NEW.id)
      );
      PERFORM check_and_award_achievements(NEW.user_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_award_points_blog_comment ON blog_comments;
CREATE TRIGGER trigger_award_points_blog_comment
  AFTER UPDATE ON blog_comments
  FOR EACH ROW
  WHEN (NEW.is_approved = TRUE AND (OLD.is_approved = FALSE OR OLD.is_approved IS NULL))
  EXECUTE FUNCTION award_points_on_blog_comment_approval();


-- 2. Review onaylandığında puan kazandırma
CREATE OR REPLACE FUNCTION award_points_on_review_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NEW.is_approved = TRUE AND (OLD IS NULL OR OLD.is_approved = FALSE) THEN
    IF NEW.user_id IS NOT NULL THEN
      PERFORM award_loyalty_points(
        NEW.user_id, 20, 'site_review', 'Site değerlendirmesi onaylandı',
        jsonb_build_object('review_id', NEW.id, 'rating', NEW.rating)
      );
      PERFORM check_and_award_achievements(NEW.user_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_award_points_review ON site_reviews;
CREATE TRIGGER trigger_award_points_review
  AFTER UPDATE ON site_reviews
  FOR EACH ROW
  WHEN (NEW.is_approved = TRUE AND (OLD.is_approved = FALSE OR OLD.is_approved IS NULL))
  EXECUTE FUNCTION award_points_on_review_approval();


-- 3. Şikayet çözüldüğünde puan kazandırma
CREATE OR REPLACE FUNCTION award_points_on_complaint_resolution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NEW.status = 'resolved' AND (OLD.status IS NULL OR OLD.status != 'resolved') THEN
    IF NEW.user_id IS NOT NULL THEN
      PERFORM award_loyalty_points(
        NEW.user_id, 15, 'complaint_resolved', 'Şikayetiniz çözüldü',
        jsonb_build_object('complaint_id', NEW.id)
      );
      PERFORM check_and_award_achievements(NEW.user_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_award_points_complaint ON site_complaints;
CREATE TRIGGER trigger_award_points_complaint
  AFTER UPDATE ON site_complaints
  FOR EACH ROW
  WHEN (NEW.status = 'resolved' AND (OLD.status IS NULL OR OLD.status != 'resolved'))
  EXECUTE FUNCTION award_points_on_complaint_resolution();


-- 4. Hoş geldin puanı
CREATE OR REPLACE FUNCTION award_welcome_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  PERFORM award_loyalty_points(
    NEW.id, 5, 'welcome', 'Platforma hoş geldiniz!',
    jsonb_build_object('user_id', NEW.id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_award_welcome_points ON profiles;
CREATE TRIGGER trigger_award_welcome_points
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION award_welcome_points();


-- Retroaktif puanlar (mevcut kullanıcılar için)
DO $$
DECLARE
  rec RECORD;
BEGIN
  -- Blog yorumları
  FOR rec IN 
    SELECT DISTINCT user_id, id FROM blog_comments 
    WHERE is_approved = TRUE AND user_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM loyalty_transactions 
        WHERE user_id = blog_comments.user_id 
          AND source = 'blog_comment'
          AND metadata->>'comment_id' = blog_comments.id::text
      )
  LOOP
    PERFORM award_loyalty_points(rec.user_id, 10, 'blog_comment', 
      'Blog yorumu onaylandı (geçmiş)', jsonb_build_object('comment_id', rec.id));
  END LOOP;

  -- Review'ler
  FOR rec IN 
    SELECT DISTINCT user_id, id, rating FROM site_reviews 
    WHERE is_approved = TRUE AND user_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM loyalty_transactions 
        WHERE user_id = site_reviews.user_id 
          AND source = 'site_review'
          AND metadata->>'review_id' = site_reviews.id::text
      )
  LOOP
    PERFORM award_loyalty_points(rec.user_id, 20, 'site_review',
      'Site değerlendirmesi onaylandı (geçmiş)', 
      jsonb_build_object('review_id', rec.id, 'rating', rec.rating));
  END LOOP;

  -- Çözülmüş şikayetler
  FOR rec IN 
    SELECT DISTINCT user_id, id FROM site_complaints 
    WHERE status = 'resolved' AND user_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM loyalty_transactions 
        WHERE user_id = site_complaints.user_id 
          AND source = 'complaint_resolved'
          AND metadata->>'complaint_id' = site_complaints.id::text
      )
  LOOP
    PERFORM award_loyalty_points(rec.user_id, 15, 'complaint_resolved',
      'Şikayetiniz çözüldü (geçmiş)', jsonb_build_object('complaint_id', rec.id));
  END LOOP;

  -- Achievement kontrolü
  FOR rec IN SELECT DISTINCT id FROM profiles
  LOOP
    PERFORM check_and_award_achievements(rec.id);
  END LOOP;
END $$;