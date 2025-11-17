-- Add RLS policy for site owners to view reviews of their sites
CREATE POLICY "Site owners can view reviews of their sites"
ON public.site_reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.site_owners
    WHERE site_owners.user_id = auth.uid()
      AND site_owners.site_id = site_reviews.site_id
      AND site_owners.status = 'approved'
  )
);