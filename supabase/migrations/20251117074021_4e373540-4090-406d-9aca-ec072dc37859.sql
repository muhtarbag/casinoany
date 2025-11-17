-- handle_new_user fonksiyonunu güncelle - user_type ve company bilgilerini ekle
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_type text;
  v_account_type text;
BEGIN
  -- accountType'ı kontrol et
  v_account_type := new.raw_user_meta_data->>'accountType';
  
  -- user_type'ı belirle (site_owner -> corporate, user -> individual)
  IF v_account_type = 'site_owner' THEN
    v_user_type := 'corporate';
  ELSE
    v_user_type := 'individual';
  END IF;

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
    v_user_type,
    new.raw_user_meta_data->>'companyName',
    new.raw_user_meta_data->>'companyTaxNumber',
    new.raw_user_meta_data->>'companyType',
    new.raw_user_meta_data->>'companyAuthorizedPerson',
    new.raw_user_meta_data->>'companyPhone',
    new.raw_user_meta_data->>'companyEmail',
    new.raw_user_meta_data->>'companyAddress',
    new.raw_user_meta_data->>'companyWebsite'
  );
  RETURN new;
END;
$function$;

-- Trigger'ı yeniden oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();