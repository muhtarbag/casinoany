-- ✅ FIX: Remove duplicate/conflicting RLS policies on betting_sites
-- This was causing infinite loading on public pages

-- Drop conflicting policies
DROP POLICY IF EXISTS "Admins can delete sites" ON public.betting_sites;
DROP POLICY IF EXISTS "Admins can insert sites" ON public.betting_sites;
DROP POLICY IF EXISTS "Admins can update sites" ON public.betting_sites;
DROP POLICY IF EXISTS "Anyone can view active sites" ON public.betting_sites;

-- Keep only these clean policies:
-- 1. Public read for active sites (NO AUTH REQUIRED)
-- 2. Admin full access

-- Ensure public can view active sites WITHOUT authentication
CREATE POLICY "Public can view active betting sites"
ON public.betting_sites
FOR SELECT
TO public
USING (is_active = true);

-- Admins can manage all sites
CREATE POLICY "Admins have full access to betting sites"
ON public.betting_sites
FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Site owners can view their sites
CREATE POLICY "Site owners can view their own sites"
ON public.betting_sites
FOR SELECT
TO authenticated
USING (user_owns_site(id) OR is_admin_user());