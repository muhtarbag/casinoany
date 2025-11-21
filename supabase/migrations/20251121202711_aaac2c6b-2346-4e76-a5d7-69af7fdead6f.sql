
-- ============================================
-- NOTIFICATION SYSTEM TRIGGERS (Corrected Function Names)
-- ============================================

-- 1. Points Earned Trigger
DROP TRIGGER IF EXISTS trigger_notify_points_earned ON loyalty_transactions;
CREATE TRIGGER trigger_notify_points_earned
  AFTER INSERT ON loyalty_transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_points_earned();

-- 2. Tier Upgrade Trigger
DROP TRIGGER IF EXISTS trigger_notify_tier_upgrade ON user_loyalty_points;
CREATE TRIGGER trigger_notify_tier_upgrade
  AFTER UPDATE ON user_loyalty_points
  FOR EACH ROW
  WHEN (OLD.tier IS DISTINCT FROM NEW.tier)
  EXECUTE FUNCTION notify_tier_upgrade();

-- 3. Achievement Unlocked Trigger
DROP TRIGGER IF EXISTS trigger_notify_achievement_unlocked ON user_achievements;
CREATE TRIGGER trigger_notify_achievement_unlocked
  AFTER INSERT ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION notify_achievement_unlocked();

-- 4. Referral Success Trigger
DROP TRIGGER IF EXISTS trigger_notify_referral_success ON referral_history;
CREATE TRIGGER trigger_notify_referral_success
  AFTER INSERT ON referral_history
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION notify_referral_success();

-- 5. Blog Comment Approved Trigger
DROP TRIGGER IF EXISTS trigger_notify_blog_comment_approved ON blog_comments;
CREATE TRIGGER trigger_notify_blog_comment_approved
  AFTER UPDATE ON blog_comments
  FOR EACH ROW
  WHEN (NEW.is_approved = TRUE AND (OLD.is_approved = FALSE OR OLD.is_approved IS NULL))
  EXECUTE FUNCTION notify_blog_comment_approved();

-- 6. Complaint Support Trigger
DROP TRIGGER IF EXISTS trigger_notify_complaint_support ON complaint_likes;
CREATE TRIGGER trigger_notify_complaint_support
  AFTER INSERT ON complaint_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_complaint_support();

-- 7. New Bonus Added Trigger
DROP TRIGGER IF EXISTS trigger_notify_new_bonus ON bonus_offers;
CREATE TRIGGER trigger_notify_new_bonus
  AFTER INSERT ON bonus_offers
  FOR EACH ROW
  WHEN (NEW.is_active = TRUE)
  EXECUTE FUNCTION notify_new_bonus();

-- 8. Rating Drop Trigger
DROP TRIGGER IF EXISTS trigger_notify_rating_drop ON betting_sites;
CREATE TRIGGER trigger_notify_rating_drop
  AFTER UPDATE ON betting_sites
  FOR EACH ROW
  WHEN (NEW.avg_rating < OLD.avg_rating AND (OLD.avg_rating - NEW.avg_rating) >= 0.5)
  EXECUTE FUNCTION notify_rating_drop();

-- 9. Welcome Notification Trigger
DROP TRIGGER IF EXISTS trigger_notify_welcome ON profiles;
CREATE TRIGGER trigger_notify_welcome
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_welcome();

-- 10. Complaint Status Change Trigger (using correct function name)
DROP TRIGGER IF EXISTS trigger_notify_complaint_status ON site_complaints;
CREATE TRIGGER trigger_notify_complaint_status
  AFTER INSERT OR UPDATE ON site_complaints
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_complaint_status_change();

-- 11. Complaint Response Trigger (using correct function name)
DROP TRIGGER IF EXISTS trigger_notify_complaint_response ON complaint_responses;
CREATE TRIGGER trigger_notify_complaint_response
  AFTER INSERT ON complaint_responses
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_complaint_response();

-- 12. Review Approval Trigger (using correct function name)
DROP TRIGGER IF EXISTS trigger_notify_review_approval ON site_reviews;
CREATE TRIGGER trigger_notify_review_approval
  AFTER UPDATE ON site_reviews
  FOR EACH ROW
  WHEN (NEW.is_approved = TRUE AND (OLD.is_approved = FALSE OR OLD.is_approved IS NULL))
  EXECUTE FUNCTION notify_user_on_review_approval();
