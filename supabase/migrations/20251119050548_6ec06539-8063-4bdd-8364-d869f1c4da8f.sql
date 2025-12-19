-- Drop existing check constraint if it exists
ALTER TABLE public.site_owner_notifications 
DROP CONSTRAINT IF EXISTS site_owner_notifications_type_check;

-- Add updated check constraint with all notification types
ALTER TABLE public.site_owner_notifications 
ADD CONSTRAINT site_owner_notifications_type_check 
CHECK (type IN ('info', 'warning', 'success', 'error', 'review', 'complaint', 'bonus', 'update'));

COMMENT ON COLUMN public.site_owner_notifications.type IS 'Notification type: info, warning, success, error, review, complaint, bonus, or update';