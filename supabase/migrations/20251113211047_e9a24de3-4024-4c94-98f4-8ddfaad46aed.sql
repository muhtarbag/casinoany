-- Kalan güvenlik düzeltmeleri - increment_blog_view_count ve increment_casino_analytics

CREATE OR REPLACE FUNCTION public.increment_blog_view_count(post_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_casino_analytics(p_site_id uuid, p_block_name text DEFAULT NULL::text, p_is_affiliate_click boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.casino_content_analytics (site_id, view_date, total_views, affiliate_clicks, block_interactions)
  VALUES (
    p_site_id, 
    CURRENT_DATE, 
    CASE WHEN p_block_name IS NULL THEN 1 ELSE 0 END,
    CASE WHEN p_is_affiliate_click THEN 1 ELSE 0 END,
    CASE WHEN p_block_name IS NOT NULL THEN jsonb_build_object(p_block_name, 1) ELSE '{}'::jsonb END
  )
  ON CONFLICT (site_id, view_date) 
  DO UPDATE SET
    total_views = casino_content_analytics.total_views + CASE WHEN p_block_name IS NULL THEN 1 ELSE 0 END,
    affiliate_clicks = casino_content_analytics.affiliate_clicks + CASE WHEN p_is_affiliate_click THEN 1 ELSE 0 END,
    block_interactions = CASE 
      WHEN p_block_name IS NOT NULL THEN
        casino_content_analytics.block_interactions || 
        jsonb_build_object(
          p_block_name, 
          COALESCE((casino_content_analytics.block_interactions->p_block_name)::int, 0) + 1
        )
      ELSE casino_content_analytics.block_interactions
    END,
    updated_at = now();
END;
$function$;