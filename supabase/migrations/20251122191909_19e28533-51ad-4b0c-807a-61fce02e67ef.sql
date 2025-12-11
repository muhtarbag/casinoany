
-- ========================================
-- SECURITY: Move Extensions to Schema
-- ========================================

-- Problem: Extensions (pg_trgm, unaccent, etc.) public schema'da
-- Solution: extensions schema'ya taşı

-- 1. Extensions schema oluştur (varsa skip)
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. pg_trgm extension'ı taşı
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    ALTER EXTENSION pg_trgm SET SCHEMA extensions;
  END IF;
END $$;

-- 3. unaccent extension'ı taşı (varsa)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'unaccent') THEN
    ALTER EXTENSION unaccent SET SCHEMA extensions;
  END IF;
END $$;

-- 4. uuid-ossp extension'ı taşı (varsa)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
  END IF;
END $$;

-- ✅ Extensions artık özel schema'da, public namespace kirletmiyor
COMMENT ON SCHEMA extensions IS 'PostgreSQL extensions - isolated from public schema';
