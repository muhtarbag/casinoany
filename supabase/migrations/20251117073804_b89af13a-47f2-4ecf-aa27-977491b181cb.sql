-- Profile'ları güncelle - auth.users'daki email'i profiles'a ekle
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Yeni kullanıcı için profile oluşturulduğunda email'i ekle
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET email = (SELECT email FROM auth.users WHERE id = NEW.id)
    WHERE id = NEW.id AND email IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger ekle
DROP TRIGGER IF EXISTS sync_email_on_profile_insert ON profiles;
CREATE TRIGGER sync_email_on_profile_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_email();

-- Mevcut profiller için email'leri güncelle
UPDATE profiles p
SET email = (SELECT email FROM auth.users u WHERE u.id = p.id)
WHERE p.email IS NULL;