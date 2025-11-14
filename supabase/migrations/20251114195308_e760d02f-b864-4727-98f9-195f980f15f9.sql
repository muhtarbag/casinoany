-- Add form_fields column to site_notifications table for bonus form popups
ALTER TABLE public.site_notifications 
ADD COLUMN IF NOT EXISTS form_fields JSONB DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.site_notifications.form_fields IS 'Bonus form configuration: email_label, phone_label, submit_text, success_message, privacy_text';