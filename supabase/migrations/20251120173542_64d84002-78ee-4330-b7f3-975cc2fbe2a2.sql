
-- Fix handle_new_user function to use correct column names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
    username,
    city,
    district,
    favorite_team,
    interests,
    favorite_game_providers,
    company_name,
    company_tax_number,
    company_type,
    company_authorized_person,
    company_phone,
    company_email,
    company_address,
    company_website,
    company_description,
    contact_person_name,
    contact_teams,
    contact_telegram,
    contact_whatsapp,
    social_facebook,
    social_twitter,
    social_instagram,
    social_linkedin,
    social_youtube,
    social_telegram_channel,
    social_kick,
    social_discord,
    bio_link,
    support_email,
    social_pinterest
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    v_user_type::user_type,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'district',
    new.raw_user_meta_data->>'favoriteTeam',
    CASE 
      WHEN new.raw_user_meta_data->>'interests' IS NOT NULL 
      THEN string_to_array(new.raw_user_meta_data->>'interests', ',')
      ELSE NULL
    END,
    CASE 
      WHEN new.raw_user_meta_data->>'favoriteGameProviders' IS NOT NULL 
      THEN string_to_array(new.raw_user_meta_data->>'favoriteGameProviders', ',')
      ELSE NULL
    END,
    new.raw_user_meta_data->>'companyName',
    new.raw_user_meta_data->>'companyTaxNumber',
    new.raw_user_meta_data->>'companyType',
    new.raw_user_meta_data->>'companyAuthorizedPerson',
    new.raw_user_meta_data->>'companyPhone',
    new.raw_user_meta_data->>'companyEmail',
    new.raw_user_meta_data->>'companyAddress',
    new.raw_user_meta_data->>'companyWebsite',
    new.raw_user_meta_data->>'companyDescription',
    new.raw_user_meta_data->>'contactPersonName',
    new.raw_user_meta_data->>'contactTeams',
    new.raw_user_meta_data->>'contactTelegram',
    new.raw_user_meta_data->>'contactWhatsapp',
    new.raw_user_meta_data->>'socialFacebook',
    new.raw_user_meta_data->>'socialTwitter',
    new.raw_user_meta_data->>'socialInstagram',
    new.raw_user_meta_data->>'socialLinkedin',
    new.raw_user_meta_data->>'socialYoutube',
    new.raw_user_meta_data->>'socialTelegramChannel',
    new.raw_user_meta_data->>'socialKick',
    new.raw_user_meta_data->>'socialDiscord',
    new.raw_user_meta_data->>'bioLink',
    new.raw_user_meta_data->>'supportEmail',
    new.raw_user_meta_data->>'socialPinterest'
  );

  -- Insert role
  INSERT INTO public.user_roles (
    user_id,
    role,
    status
  )
  VALUES (
    new.id,
    v_role,
    CASE 
      WHEN v_account_type = 'site_owner' THEN 'pending'::user_status
      ELSE 'approved'::user_status
    END
  );

  -- Create initial loyalty points record with correct column names
  INSERT INTO public.user_loyalty_points (user_id, total_points, lifetime_points, tier)
  VALUES (new.id, 0, 0, 'bronze')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$function$;
