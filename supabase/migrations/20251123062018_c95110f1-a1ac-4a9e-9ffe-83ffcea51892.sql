-- =====================================================
-- GAMIFICATION NOTIFICATION TYPES
-- =====================================================
-- Notification type'lara gamification değerleri ekliyoruz
-- =====================================================

-- Önce constraint'i kaldır
ALTER TABLE user_notifications DROP CONSTRAINT IF EXISTS user_notifications_notification_type_check;

-- Yeni constraint ekle (gamification type'larıyla birlikte)
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
  'comment_approved'::text,
  'review_approved'::text
]));