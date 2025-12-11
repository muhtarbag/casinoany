-- 1. Email doğrulaması yapıldığında otomatik is_verified = true yap
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Email onaylandığında is_verified'ı true yap
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE profiles
    SET is_verified = true, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger'ı oluştur
DROP TRIGGER IF EXISTS on_email_verified ON auth.users;
CREATE TRIGGER on_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_email_verification();

-- 2. handle_new_user'ı güncelle - site sahipleri için site isminden username türet
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_type text;
  v_user_role app_role;
  v_username text;
  v_site_id uuid;
  v_site_name text;
BEGIN
  -- Account type'ı al
  v_account_type := COALESCE(NEW.raw_user_meta_data->>'accountType', 'user');
  
  -- Role'ü belirle
  v_user_role := 'user'::app_role;

  -- Username'i belirle
  IF v_account_type = 'site_owner' THEN
    -- Site owner için: önce metadata'dan username kontrol et, yoksa email'den
    v_username := NEW.raw_user_meta_data->>'username';
    
    -- Eğer metadata'da username yoksa email'den türet
    IF v_username IS NULL THEN
      v_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
    END IF;
  ELSE
    -- Individual user için: metadata'dan veya email'den
    v_username := COALESCE(
      NEW.raw_user_meta_data->>'username',
      LOWER(SPLIT_PART(NEW.email, '@', 1))
    );
  END IF;

  -- 1. Profile kaydını oluştur
  INSERT INTO public.profiles (
    id,
    email,
    username,
    first_name,
    last_name,
    phone,
    user_type,
    company_name,
    company_description,
    company_website,
    contact_person_name,
    support_email,
    contact_telegram,
    contact_whatsapp,
    social_facebook,
    social_twitter,
    social_instagram,
    social_youtube,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_username,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'accountType')::user_type, 'individual'),
    NEW.raw_user_meta_data->>'companyName',
    NEW.raw_user_meta_data->>'companyDescription',
    NEW.raw_user_meta_data->>'companyWebsite',
    NEW.raw_user_meta_data->>'contactPersonName',
    NEW.raw_user_meta_data->>'supportEmail',
    NEW.raw_user_meta_data->>'contactTelegram',
    NEW.raw_user_meta_data->>'contactWhatsapp',
    NEW.raw_user_meta_data->>'socialFacebook',
    NEW.raw_user_meta_data->>'socialTwitter',
    NEW.raw_user_meta_data->>'socialInstagram',
    NEW.raw_user_meta_data->>'socialYoutube',
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(EXCLUDED.username, profiles.username),
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    user_type = COALESCE(EXCLUDED.user_type, profiles.user_type),
    company_name = COALESCE(EXCLUDED.company_name, profiles.company_name),
    company_description = COALESCE(EXCLUDED.company_description, profiles.company_description),
    company_website = COALESCE(EXCLUDED.company_website, profiles.company_website),
    contact_person_name = COALESCE(EXCLUDED.contact_person_name, profiles.contact_person_name),
    support_email = COALESCE(EXCLUDED.support_email, profiles.support_email),
    contact_telegram = COALESCE(EXCLUDED.contact_telegram, profiles.contact_telegram),
    contact_whatsapp = COALESCE(EXCLUDED.contact_whatsapp, profiles.contact_whatsapp),
    social_facebook = COALESCE(EXCLUDED.social_facebook, profiles.social_facebook),
    social_twitter = COALESCE(EXCLUDED.social_twitter, profiles.social_twitter),
    social_instagram = COALESCE(EXCLUDED.social_instagram, profiles.social_instagram),
    social_youtube = COALESCE(EXCLUDED.social_youtube, profiles.social_youtube),
    updated_at = NOW();
  
  -- 2. User role kaydını oluştur (APPROVED olarak)
  INSERT INTO public.user_roles (
    user_id,
    role,
    status,
    created_at
  )
  VALUES (
    NEW.id,
    v_user_role,
    'approved',
    NOW()
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 3. Email onayı yapılmış kullanıcıları otomatik verify et
UPDATE profiles p
SET is_verified = true, updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id
  AND u.email_confirmed_at IS NOT NULL
  AND p.is_verified = false;