
-- ==================================================================
-- FAZ 1: KRİTİK GÜVENLİK VE PERFORMANS DÜZELTMELERİ
-- ==================================================================

-- 1. Site stats için thread-safe UPSERT fonksiyonu
-- Race condition'ı çözer, atomic işlem yapar
CREATE OR REPLACE FUNCTION public.increment_site_stats(
  p_site_id UUID,
  p_metric_type TEXT DEFAULT 'view'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Single atomic operation - no race condition
  INSERT INTO public.site_stats (
    site_id, 
    views, 
    clicks,
    email_clicks,
    whatsapp_clicks,
    telegram_clicks,
    twitter_clicks,
    instagram_clicks,
    facebook_clicks,
    youtube_clicks
  )
  VALUES (
    p_site_id,
    CASE WHEN p_metric_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN p_metric_type = 'click' THEN 1 ELSE 0 END,
    CASE WHEN p_metric_type = 'email_click' THEN 1 ELSE 0 END,
    CASE WHEN p_metric_type = 'whatsapp_click' THEN 1 ELSE 0 END,
    CASE WHEN p_metric_type = 'telegram_click' THEN 1 ELSE 0 END,
    CASE WHEN p_metric_type = 'twitter_click' THEN 1 ELSE 0 END,
    CASE WHEN p_metric_type = 'instagram_click' THEN 1 ELSE 0 END,
    CASE WHEN p_metric_type = 'facebook_click' THEN 1 ELSE 0 END,
    CASE WHEN p_metric_type = 'youtube_click' THEN 1 ELSE 0 END
  )
  ON CONFLICT (site_id) 
  DO UPDATE SET
    views = site_stats.views + CASE WHEN p_metric_type = 'view' THEN 1 ELSE 0 END,
    clicks = site_stats.clicks + CASE WHEN p_metric_type = 'click' THEN 1 ELSE 0 END,
    email_clicks = site_stats.email_clicks + CASE WHEN p_metric_type = 'email_click' THEN 1 ELSE 0 END,
    whatsapp_clicks = site_stats.whatsapp_clicks + CASE WHEN p_metric_type = 'whatsapp_click' THEN 1 ELSE 0 END,
    telegram_clicks = site_stats.telegram_clicks + CASE WHEN p_metric_type = 'telegram_click' THEN 1 ELSE 0 END,
    twitter_clicks = site_stats.twitter_clicks + CASE WHEN p_metric_type = 'twitter_click' THEN 1 ELSE 0 END,
    instagram_clicks = site_stats.instagram_clicks + CASE WHEN p_metric_type = 'instagram_click' THEN 1 ELSE 0 END,
    facebook_clicks = site_stats.facebook_clicks + CASE WHEN p_metric_type = 'facebook_click' THEN 1 ELSE 0 END,
    youtube_clicks = site_stats.youtube_clicks + CASE WHEN p_metric_type = 'youtube_click' THEN 1 ELSE 0 END,
    updated_at = now();
END;
$$;

-- 2. User roles için güvenlik kontrolü fonksiyonu
-- Null role durumlarını da handle eder
CREATE OR REPLACE FUNCTION public.get_user_role_status(p_user_id UUID)
RETURNS TABLE(
  role app_role,
  status user_status,
  has_role BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    role,
    status,
    TRUE as has_role
  FROM public.user_roles
  WHERE user_id = p_user_id
    AND status = 'approved'
  LIMIT 1;
$$;

-- 3. Auth trigger'ı güçlendir - daha güvenli kayıt
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE
  v_user_type text;
  v_account_type text;
  v_role app_role;
BEGIN
  -- Get account type from metadata
  v_account_type := new.raw_user_meta_data->>'accountType';
  
  -- Determine user_type for profiles table
  IF v_account_type = 'site_owner' THEN
    v_user_type := 'corporate';
    v_role := 'site_owner'::app_role;
  ELSE
    v_user_type := 'individual';
    v_role := 'user'::app_role;
  END IF;

  -- Insert profile with all data
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    phone,
    user_type,
    company_name,
    company_tax_number,
    company_type,
    company_authorized_person,
    company_phone,
    company_email,
    company_address,
    company_website
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    v_user_type::user_type,
    new.raw_user_meta_data->>'companyName',
    new.raw_user_meta_data->>'companyTaxNumber',
    new.raw_user_meta_data->>'companyType',
    new.raw_user_meta_data->>'companyAuthorizedPerson',
    new.raw_user_meta_data->>'companyPhone',
    new.raw_user_meta_data->>'companyEmail',
    new.raw_user_meta_data->>'companyAddress',
    new.raw_user_meta_data->>'companyWebsite'
  );

  -- Insert role (with proper status)
  INSERT INTO public.user_roles (
    user_id,
    role,
    status
  )
  VALUES (
    new.id,
    v_role,
    -- site_owner -> pending, others -> approved
    CASE 
      WHEN v_account_type = 'site_owner' THEN 'pending'::user_status
      ELSE 'approved'::user_status
    END
  );

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 4. User roles tablosuna index ekle (performance)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_status 
  ON public.user_roles(user_id, status);

CREATE INDEX IF NOT EXISTS idx_user_roles_role_status 
  ON public.user_roles(role, status);

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.increment_site_stats TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role_status TO authenticated, anon;

COMMENT ON FUNCTION public.increment_site_stats IS 'Thread-safe atomic site stats increment - fixes race condition';
COMMENT ON FUNCTION public.get_user_role_status IS 'Safe user role check with null handling';
