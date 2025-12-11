-- 1. notification_type constraint'ine 'welcome' ekle
ALTER TABLE public.user_notifications 
DROP CONSTRAINT IF EXISTS user_notifications_notification_type_check;

ALTER TABLE public.user_notifications 
ADD CONSTRAINT user_notifications_notification_type_check 
CHECK (notification_type = ANY (ARRAY['info'::text, 'success'::text, 'warning'::text, 'error'::text, 'announcement'::text, 'welcome'::text]));

-- 2. Mevcut kullanıcılar için eksik profilleri oluştur
INSERT INTO public.profiles (id, created_at, updated_at)
SELECT 
  u.id,
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3. Yeni kullanıcılar için otomatik profil oluşturan trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 4. Trigger'ı auth.users tablosuna ekle
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();