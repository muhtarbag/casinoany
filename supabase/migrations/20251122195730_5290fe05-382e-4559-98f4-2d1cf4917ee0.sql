-- handle_new_user trigger'ına user_roles insert'ini de ekle

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_type text;
  v_user_role app_role;
BEGIN
  -- Account type'ı al
  v_account_type := COALESCE(NEW.raw_user_meta_data->>'accountType', 'user');
  
  -- Role'ü belirle
  v_user_role := CASE 
    WHEN v_account_type = 'site_owner' THEN 'user'::app_role  -- Site owner'lar da başlangıçta user
    ELSE 'user'::app_role
  END;

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
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', LOWER(SPLIT_PART(NEW.email, '@', 1))),
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
    'approved',  -- Otomatik onaylı
    NOW()
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Eksik rol kayıtlarını ekle (mevcut kullanıcılar için)
INSERT INTO public.user_roles (user_id, role, status, created_at)
SELECT 
  p.id,
  'user'::app_role,
  'approved',
  NOW()
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE ur.id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;