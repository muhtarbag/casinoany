
-- ============================================
-- FIX: Security Definer View
-- ============================================
-- Convert betting_sites_full to SECURITY INVOKER
-- This ensures the view respects RLS policies

DROP VIEW IF EXISTS public.betting_sites_full;

CREATE VIEW public.betting_sites_full
WITH (security_invoker = on)
AS
SELECT 
  bs.id,
  bs.name,
  bs.slug,
  bs.logo_url,
  bs.rating,
  bs.bonus,
  bs.is_active,
  bs.is_featured,
  bs.display_order,
  bs.review_count,
  bs.avg_rating,
  bs.created_at,
  bs.updated_at,
  bsc.pros,
  bsc.cons,
  bsc.features,
  bsc.expert_review,
  bsc.verdict,
  bsc.login_guide,
  bsc.withdrawal_guide,
  bsc.game_categories,
  bsc.faq,
  bsc.block_styles,
  bsa.affiliate_link,
  bsa.affiliate_commission_percentage,
  bsa.affiliate_monthly_payment,
  bsa.affiliate_has_monthly_payment,
  bsa.affiliate_contract_date,
  bsa.affiliate_contract_terms,
  bsa.affiliate_notes,
  bsa.affiliate_panel_url,
  bsa.affiliate_panel_username,
  bsa.affiliate_panel_password,
  bss.email,
  bss.whatsapp,
  bss.telegram,
  bss.twitter,
  bss.instagram,
  bss.facebook,
  bss.youtube
FROM betting_sites bs
LEFT JOIN betting_sites_content bsc ON bsc.site_id = bs.id
LEFT JOIN betting_sites_affiliate bsa ON bsa.site_id = bs.id
LEFT JOIN betting_sites_social bss ON bss.site_id = bs.id;

-- Log success
DO $$
BEGIN
  RAISE NOTICE 'betting_sites_full view converted to SECURITY INVOKER';
  RAISE NOTICE 'View now respects RLS policies properly';
END $$;
