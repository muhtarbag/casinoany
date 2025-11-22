-- Drop the old policy that only checks owner_id
DROP POLICY IF EXISTS "Site owners can update own sites" ON public.betting_sites;

-- Create new policy that checks site_owners table
CREATE POLICY "Site owners can update their sites"
ON public.betting_sites
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT site_id 
    FROM public.site_owners 
    WHERE user_id = auth.uid() 
      AND status = 'approved'
  )
)
WITH CHECK (
  id IN (
    SELECT site_id 
    FROM public.site_owners 
    WHERE user_id = auth.uid() 
      AND status = 'approved'
  )
);

COMMENT ON POLICY "Site owners can update their sites" ON public.betting_sites 
IS 'Allows approved site owners (from site_owners table) to update their sites';