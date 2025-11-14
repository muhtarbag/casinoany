-- Add form_fields column to site_notifications table
ALTER TABLE public.site_notifications 
ADD COLUMN IF NOT EXISTS form_fields JSONB DEFAULT NULL;