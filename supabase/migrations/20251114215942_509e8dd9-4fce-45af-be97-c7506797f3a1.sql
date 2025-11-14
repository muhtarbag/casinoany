-- Fix remaining security warnings

-- 1. Fix update_affiliate_updated_at function (add search_path)
CREATE OR REPLACE FUNCTION public.update_affiliate_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Move pg_net extension to extensions schema (if not exists)
-- Note: This is safe because we're using ALTER EXTENSION
DO $$
BEGIN
  -- Check if extensions schema exists, create if not
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
    CREATE SCHEMA extensions;
  END IF;
  
  -- Move pg_net to extensions schema
  -- This will also move all related objects (functions, types, etc.)
  ALTER EXTENSION pg_net SET SCHEMA extensions;
  
  -- Grant usage on extensions schema
  GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
EXCEPTION
  WHEN OTHERS THEN
    -- If moving fails (already in extensions or other issue), just continue
    RAISE NOTICE 'Could not move pg_net to extensions schema: %', SQLERRM;
END $$;