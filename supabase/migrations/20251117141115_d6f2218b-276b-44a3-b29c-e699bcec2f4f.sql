-- ================================================================
-- CRITICAL SECURITY FIX: Server-side admin verification
-- ================================================================
-- This migration adds server-side admin verification to prevent
-- privilege escalation attacks. All admin checks must now use
-- the is_admin_user() function which runs with SECURITY DEFINER.
-- ================================================================

-- Step 1: Create admin verification function (SECURITY DEFINER)
-- This function checks if the current authenticated user has admin role
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND status = 'approved'
  );
END;
$$;

-- Step 2: Create site owner verification function
CREATE OR REPLACE FUNCTION public.is_site_owner_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'site_owner'
      AND status = 'approved'
  );
END;
$$;

-- Step 3: Create function to check if user owns specific site
CREATE OR REPLACE FUNCTION public.user_owns_site(site_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.site_owners
    WHERE user_id = auth.uid()
      AND site_id = site_id_param
      AND status = 'approved'
  );
END;
$$;

-- Step 4: Apply RLS policies for admin-only operations on betting_sites
-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can manage all sites" ON public.betting_sites;
DROP POLICY IF EXISTS "Site owners can view their sites" ON public.betting_sites;
DROP POLICY IF EXISTS "Public can view active sites" ON public.betting_sites;

-- Public can view active sites
CREATE POLICY "Public can view active sites"
ON public.betting_sites
FOR SELECT
TO public
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage all sites"
ON public.betting_sites
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Site owners can view their own sites
CREATE POLICY "Site owners can view their sites"
ON public.betting_sites
FOR SELECT
TO authenticated
USING (
  public.user_owns_site(id) OR 
  public.is_admin_user()
);

-- Step 5: Apply RLS on user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_user());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Step 6: Apply RLS on site_owners table
DROP POLICY IF EXISTS "Users can view their ownerships" ON public.site_owners;
DROP POLICY IF EXISTS "Admins can manage ownerships" ON public.site_owners;

CREATE POLICY "Users can view their ownerships"
ON public.site_owners
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_user());

CREATE POLICY "Admins can manage ownerships"
ON public.site_owners
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Step 7: Create helper function to get user roles (for client use)
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE (
  role app_role,
  status user_status,
  owned_sites UUID[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.role,
    ur.status,
    COALESCE(
      ARRAY_AGG(so.site_id) FILTER (WHERE so.site_id IS NOT NULL),
      ARRAY[]::UUID[]
    ) as owned_sites
  FROM user_roles ur
  LEFT JOIN site_owners so ON so.user_id = ur.user_id AND so.status = 'approved'
  WHERE ur.user_id = auth.uid()
    AND ur.status = 'approved'
  GROUP BY ur.role, ur.status;
END;
$$;

-- Step 8: Add helpful comments
COMMENT ON FUNCTION public.is_admin_user() IS 
  'SECURITY: Returns true if current user is an approved admin. Uses SECURITY DEFINER to prevent client manipulation.';

COMMENT ON FUNCTION public.is_site_owner_user() IS 
  'SECURITY: Returns true if current user is an approved site owner. Uses SECURITY DEFINER to prevent client manipulation.';

COMMENT ON FUNCTION public.user_owns_site(UUID) IS 
  'SECURITY: Returns true if current user owns the specified site. Uses SECURITY DEFINER to prevent client manipulation.';

COMMENT ON FUNCTION public.get_current_user_roles() IS 
  'Helper function for client to fetch current user roles and owned sites securely.';