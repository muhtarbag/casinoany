-- İlk kayıt olan kullanıcıyı otomatik admin yapan fonksiyonu güncelle
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  admin_count integer;
BEGIN
  -- Profil oluştur
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );

  -- Admin sayısını kontrol et
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';

  -- Eğer hiç admin yoksa, bu kullanıcıyı admin yap
  IF admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
    
    -- Log için (opsiyonel)
    RAISE NOTICE 'İlk kullanıcı admin olarak atandı: %', NEW.email;
  ELSE
    -- Normal kullanıcı rolü ata
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;

  RETURN NEW;
END;
$function$;