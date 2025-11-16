-- FIX: Update has_role function to check status='approved'
-- Critical fix for admin panel access issues

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = _role
      AND status = 'approved'::user_status  -- CRITICAL: Only approved users!
  )
$$;

COMMENT ON FUNCTION public.has_role(uuid, app_role) IS 
  'Checks if user has specified role AND status is approved. Used in ALL RLS policies.';
