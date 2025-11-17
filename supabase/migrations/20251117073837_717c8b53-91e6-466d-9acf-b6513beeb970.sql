-- Trigger'ı ve function'ı düzelt
DROP TRIGGER IF EXISTS sync_email_on_profile_insert ON profiles;
DROP FUNCTION IF EXISTS sync_profile_email() CASCADE;

CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Yeni kullanıcı için profile oluşturulduğunda email'i ekle
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET email = (SELECT email FROM auth.users WHERE id = NEW.id)
    WHERE id = NEW.id AND email IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger'ı yeniden oluştur
CREATE TRIGGER sync_email_on_profile_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_email();