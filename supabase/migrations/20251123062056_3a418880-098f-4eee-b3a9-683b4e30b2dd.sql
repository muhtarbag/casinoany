-- =====================================================
-- GAMIFICATION NOTIFICATION TYPE EKLENTİSİ
-- =====================================================

ALTER TABLE user_notifications DROP CONSTRAINT IF EXISTS user_notifications_notification_type_check;

ALTER TABLE user_notifications ADD CONSTRAINT user_notifications_notification_type_check 
CHECK (notification_type = ANY (ARRAY[
  'info'::text, 
  'success'::text, 
  'warning'::text, 
  'error'::text, 
  'announcement'::text, 
  'welcome'::text,
  'points_earned'::text,
  'tier_upgrade'::text,
  'achievement_earned'::text,
  'achievement_unlocked'::text,
  'comment_approved'::text,
  'review_approved'::text
]));