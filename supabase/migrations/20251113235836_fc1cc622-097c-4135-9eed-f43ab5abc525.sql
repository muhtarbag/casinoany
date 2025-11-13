-- Drop and recreate view with SECURITY INVOKER (safer)
DROP VIEW IF EXISTS public.site_stats_with_details;

CREATE OR REPLACE VIEW public.site_stats_with_details 
WITH (security_invoker = true) AS
SELECT 
  ss.id,
  ss.site_id,
  ss.views,
  ss.clicks,
  ss.created_at,
  ss.updated_at,
  bs.name as site_name,
  bs.slug as site_slug,
  bs.rating as site_rating,
  bs.bonus as site_bonus,
  bs.is_active as site_is_active
FROM public.site_stats ss
INNER JOIN public.betting_sites bs ON ss.site_id = bs.id
WHERE bs.is_active = true;