-- Add RLS policies for site owners to manage their own site content

-- Site owners can manage their own site's content
CREATE POLICY "Site owners can manage their site content"
ON public.betting_sites_content
FOR ALL
TO public
USING (
  site_id IN (
    SELECT bs.id 
    FROM public.betting_sites bs
    WHERE bs.owner_id = auth.uid()
  )
)
WITH CHECK (
  site_id IN (
    SELECT bs.id 
    FROM public.betting_sites bs
    WHERE bs.owner_id = auth.uid()
  )
);

-- Site owners can manage their own site's affiliate data
CREATE POLICY "Site owners can manage their site affiliate"
ON public.betting_sites_affiliate
FOR ALL
TO public
USING (
  site_id IN (
    SELECT bs.id 
    FROM public.betting_sites bs
    WHERE bs.owner_id = auth.uid()
  )
)
WITH CHECK (
  site_id IN (
    SELECT bs.id 
    FROM public.betting_sites bs
    WHERE bs.owner_id = auth.uid()
  )
);

-- Add comment for clarity
COMMENT ON POLICY "Site owners can manage their site content" ON public.betting_sites_content IS 'Allows site owners to edit content (pros, cons, review, etc.) for their own sites';
COMMENT ON POLICY "Site owners can manage their site affiliate" ON public.betting_sites_affiliate IS 'Allows site owners to manage affiliate settings for their own sites';