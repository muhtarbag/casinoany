-- Add carousel auto scroll duration setting
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('carousel_auto_scroll_duration', '2500')
ON CONFLICT (setting_key) DO NOTHING;