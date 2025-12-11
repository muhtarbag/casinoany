-- Username sorunlarını adım adım düzelt

-- 1. Önce boş username'lere email'den türetilmiş benzersiz değerler ata
UPDATE profiles
SET username = LOWER(
  REGEXP_REPLACE(
    SPLIT_PART(COALESCE(email, id::text), '@', 1) || '_' || SUBSTRING(id::text, 1, 8),
    '[^a-z0-9_]',
    '',
    'g'
  )
)
WHERE username IS NULL;

-- 2. Tüm usernameleri lowercase yap ve özel karakterleri temizle
UPDATE profiles
SET username = LOWER(REGEXP_REPLACE(username, '[^a-z0-9_]', '', 'g'))
WHERE username IS NOT NULL;

-- 3. Alt çizgi ile başlayan/biten veya çift alt çizgi içerenleri düzelt
UPDATE profiles
SET username = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(username, '^_+', '', 'g'),
    '_+$', '', 'g'
  ),
  '__+', '_', 'g'
)
WHERE username ~ '(^_|_$|__+)';

-- 4. 3 karakterden kısa olanları düzelt
UPDATE profiles
SET username = username || '_' || SUBSTRING(id::text, 1, 4)
WHERE LENGTH(username) < 3;

-- 5. 30 karakterden uzun olanları kısalt
UPDATE profiles
SET username = SUBSTRING(username, 1, 30)
WHERE LENGTH(username) > 30;

-- 6. Username'i NOT NULL yap
ALTER TABLE profiles
ALTER COLUMN username SET NOT NULL;

-- 7. Username için index ekle
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 8. Yardımcı fonksiyon: Username kullanılabilirlik kontrolü
CREATE OR REPLACE FUNCTION public.is_username_available(check_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE LOWER(username) = LOWER(check_username)
  );
END;
$$;

-- 9. Username normalize fonksiyonu
CREATE OR REPLACE FUNCTION public.normalize_username()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Username'i lowercase yap ve temizle
  NEW.username := LOWER(REGEXP_REPLACE(NEW.username, '[^a-z0-9_]', '', 'g'));
  
  -- Alt çizgi sorunlarını düzelt
  NEW.username := REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(NEW.username, '^_+', '', 'g'),
      '_+$', '', 'g'
    ),
    '__+', '_', 'g'
  );
  
  -- Minimum 3 karakter kontrolü
  IF LENGTH(NEW.username) < 3 THEN
    RAISE EXCEPTION 'Username en az 3 karakter olmalıdır';
  END IF;
  
  -- Maksimum 30 karakter
  IF LENGTH(NEW.username) > 30 THEN
    NEW.username := SUBSTRING(NEW.username, 1, 30);
  END IF;
  
  RETURN NEW;
END;
$$;

-- 10. Trigger
DROP TRIGGER IF EXISTS normalize_username_trigger ON profiles;
CREATE TRIGGER normalize_username_trigger
  BEFORE INSERT OR UPDATE OF username ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION normalize_username();

-- 11. Validation constraint (daha esnek)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'username_length_check'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT username_length_check 
    CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 30);
  END IF;
END $$;