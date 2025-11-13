-- Add analytics fields to notification_views
ALTER TABLE notification_views ADD COLUMN IF NOT EXISTS clicked boolean DEFAULT false;
ALTER TABLE notification_views ADD COLUMN IF NOT EXISTS clicked_at timestamp with time zone;

-- Add trigger system to site_notifications
ALTER TABLE site_notifications ADD COLUMN IF NOT EXISTS trigger_type text DEFAULT 'instant';
ALTER TABLE site_notifications ADD COLUMN IF NOT EXISTS trigger_conditions jsonb DEFAULT '{}';

-- Add comment for trigger_type values
COMMENT ON COLUMN site_notifications.trigger_type IS 'instant, time_on_page, scroll_depth, exit_intent, page_count';

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_notification_views_clicked ON notification_views(notification_id, clicked);
CREATE INDEX IF NOT EXISTS idx_notification_views_viewed_at ON notification_views(notification_id, viewed_at);