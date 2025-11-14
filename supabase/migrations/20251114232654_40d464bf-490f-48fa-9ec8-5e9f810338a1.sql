-- Add advanced styling options to site_notifications table
ALTER TABLE site_notifications 
ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS font_size text DEFAULT 'base',
ADD COLUMN IF NOT EXISTS border_radius text DEFAULT 'lg',
ADD COLUMN IF NOT EXISTS max_width text DEFAULT 'md',
ADD COLUMN IF NOT EXISTS padding text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS border_color text,
ADD COLUMN IF NOT EXISTS border_width text DEFAULT '0',
ADD COLUMN IF NOT EXISTS shadow_size text DEFAULT 'lg';

COMMENT ON COLUMN site_notifications.font_family IS 'Font family: Inter, Roboto, Poppins, Playfair Display, etc.';
COMMENT ON COLUMN site_notifications.font_size IS 'Text size: xs, sm, base, lg, xl, 2xl';
COMMENT ON COLUMN site_notifications.border_radius IS 'Border radius: none, sm, md, lg, xl, 2xl, full';
COMMENT ON COLUMN site_notifications.max_width IS 'Max width: sm, md, lg, xl, 2xl, full';
COMMENT ON COLUMN site_notifications.padding IS 'Padding: tight, normal, relaxed, loose';
COMMENT ON COLUMN site_notifications.border_color IS 'Border color in hex format';
COMMENT ON COLUMN site_notifications.border_width IS 'Border width: 0, 1, 2, 4, 8';
COMMENT ON COLUMN site_notifications.shadow_size IS 'Shadow size: none, sm, md, lg, xl, 2xl';