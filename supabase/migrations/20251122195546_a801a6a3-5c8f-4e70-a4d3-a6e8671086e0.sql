-- handle_new_user fonksiyonunu güncelle - username ve metadata desteği ekle

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    COALESCE((NEW.raw_user_meta_data->>'accountType')::user_type, 'user'),
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
  
  RETURN NEW;
END;
$$;