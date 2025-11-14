-- Add user_segments column to site_notifications table
ALTER TABLE site_notifications 
ADD COLUMN user_segments text[] DEFAULT ARRAY['all']::text[];

COMMENT ON COLUMN site_notifications.user_segments IS 'Target audience segments: all, new_visitor, returning_visitor, registered, anonymous';

-- Update existing notifications to target all segments
UPDATE site_notifications 
SET user_segments = ARRAY['all']::text[] 
WHERE user_segments IS NULL;