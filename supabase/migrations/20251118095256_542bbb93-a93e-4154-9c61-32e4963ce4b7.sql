-- ========================================
-- PHASE 1 & 2: Database Schema Updates
-- ========================================

-- Add new fields to profiles table for individual users
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS favorite_game_providers TEXT[],
ADD COLUMN IF NOT EXISTS favorite_team TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[];

-- Add new fields to profiles table for corporate users
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS contact_person_name TEXT,
ADD COLUMN IF NOT EXISTS contact_teams TEXT,
ADD COLUMN IF NOT EXISTS contact_telegram TEXT,
ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS social_facebook TEXT,
ADD COLUMN IF NOT EXISTS social_twitter TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
ADD COLUMN IF NOT EXISTS social_youtube TEXT,
ADD COLUMN IF NOT EXISTS social_telegram_channel TEXT,
ADD COLUMN IF NOT EXISTS social_kick TEXT,
ADD COLUMN IF NOT EXISTS social_discord TEXT,
ADD COLUMN IF NOT EXISTS bio_link TEXT;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Create table for user status notifications
CREATE TABLE IF NOT EXISTS user_status_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('approval', 'rejection', 'status_change')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Enable RLS on notifications table
ALTER TABLE user_status_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON user_status_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON user_status_notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can create notifications
CREATE POLICY "Admins can create notifications"
ON user_status_notifications
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_status_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_status_notifications(created_at DESC);

-- Update handle_new_user trigger to support new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

  -- Insert profile with all data including new fields
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
    bio_link
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
    new.raw_user_meta_data->>'bioLink'
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
    CASE 
      WHEN v_account_type = 'site_owner' THEN 'pending'::user_status
      ELSE 'approved'::user_status
    END
  );

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$function$;

-- Function to send notification when user status changes
CREATE OR REPLACE FUNCTION notify_user_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only notify on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO user_status_notifications (
      user_id,
      notification_type,
      title,
      message
    )
    VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'approval'
        WHEN NEW.status = 'rejected' THEN 'rejection'
        ELSE 'status_change'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Başvurunuz Onaylandı'
        WHEN NEW.status = 'rejected' THEN 'Başvurunuz Reddedildi'
        ELSE 'Durum Değişikliği'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Başvurunuz başarıyla onaylandı. Artık panele erişebilirsiniz.'
        WHEN NEW.status = 'rejected' THEN 'Başvurunuz değerlendirmeye alındı ancak şu anda onaylanamamıştır.'
        ELSE 'Başvuru durumunuz güncellendi: ' || NEW.status
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for user status notifications
DROP TRIGGER IF EXISTS user_status_notification_trigger ON user_roles;
CREATE TRIGGER user_status_notification_trigger
AFTER UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION notify_user_status_change();

-- Create admin notification preference table
CREATE TABLE IF NOT EXISTS admin_notification_preferences (
  admin_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_new_registrations BOOLEAN DEFAULT TRUE,
  notify_via_email BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage own preferences"
ON admin_notification_preferences
FOR ALL
TO authenticated
USING (auth.uid() = admin_id)
WITH CHECK (auth.uid() = admin_id);

COMMENT ON TABLE profiles IS 'User profiles with individual and corporate fields';
COMMENT ON COLUMN profiles.username IS 'Unique username for individual users';
COMMENT ON COLUMN profiles.company_description IS 'Company/site description for corporate users';
COMMENT ON TABLE user_status_notifications IS 'Notifications sent to users about their account status changes';