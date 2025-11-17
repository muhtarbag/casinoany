-- ============================================
-- HIGH #5: RLS Policy Optimization (Fixed)
-- Performance improvements for Row Level Security
-- ============================================

-- 1. Create materialized user roles cache (if not exists)
CREATE TABLE IF NOT EXISTS public.user_role_cache (
  user_id UUID PRIMARY KEY,
  role app_role NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour')
);

-- Enable RLS on cache table
ALTER TABLE public.user_role_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own role cache" ON public.user_role_cache;
DROP POLICY IF EXISTS "System can manage role cache" ON public.user_role_cache;

-- Policy: Users can view their own cached role
CREATE POLICY "Users can view own role cache"
ON public.user_role_cache
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: System can update role cache  
CREATE POLICY "System can manage role cache"
ON public.user_role_cache
FOR ALL
USING (true)
WITH CHECK (true);

-- 2. Create optimized has_role function with caching
CREATE OR REPLACE FUNCTION public.has_role_cached(user_id uuid, required_role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  cached_role app_role;
BEGIN
  -- Try to get from cache first
  SELECT role INTO cached_role
  FROM user_role_cache
  WHERE user_role_cache.user_id = has_role_cached.user_id
    AND expires_at > now();
  
  IF FOUND THEN
    RETURN cached_role = required_role;
  END IF;
  
  -- Cache miss or expired, get from user_roles
  SELECT ur.role INTO cached_role
  FROM user_roles ur
  WHERE ur.user_id = has_role_cached.user_id
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update cache
  INSERT INTO user_role_cache (user_id, role)
  VALUES (has_role_cached.user_id, cached_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = EXCLUDED.role,
    cached_at = now(),
    expires_at = now() + interval '1 hour';
  
  RETURN cached_role = required_role;
END;
$$;

-- 3. Create index for faster policy checks
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role
ON user_roles(user_id, role);

-- 4. Create function to invalidate role cache on role change
CREATE OR REPLACE FUNCTION public.invalidate_role_cache()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clear cache for affected user
  DELETE FROM user_role_cache
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 5. Attach trigger to user_roles table
DROP TRIGGER IF EXISTS invalidate_role_cache_trigger ON user_roles;
CREATE TRIGGER invalidate_role_cache_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION invalidate_role_cache();

-- 6. Documentation
COMMENT ON FUNCTION has_role_cached IS 'Optimized role checking with 1-hour cache. Use instead of has_role() for better performance.';
COMMENT ON TABLE user_role_cache IS 'Cache table for user roles to optimize RLS policy checks. Automatically invalidated on role changes.';

-- 7. Grant permissions
GRANT SELECT ON user_role_cache TO authenticated;
GRANT ALL ON user_role_cache TO service_role;

-- Performance note: This optimization reduces repeated has_role() calls
-- from O(n) database lookups to O(1) cache lookups