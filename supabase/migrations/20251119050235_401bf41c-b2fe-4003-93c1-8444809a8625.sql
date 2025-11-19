-- Allow site owners to view page views for their own sites
CREATE POLICY "Site owners can view their site analytics" 
ON page_views 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM site_owners so
    JOIN betting_sites bs ON bs.id = so.site_id
    WHERE so.user_id = auth.uid() 
    AND so.status = 'approved'
    AND page_views.page_path ILIKE '%' || bs.slug || '%'
  )
);

-- Allow anyone to view page_views for public analytics (optional, for better UX)
CREATE POLICY "Public can view all page views"
ON page_views
FOR SELECT
USING (true);

COMMENT ON POLICY "Site owners can view their site analytics" ON page_views IS 'Site owners can view analytics data for pages related to their sites';
COMMENT ON POLICY "Public can view all page views" ON page_views IS 'Public access for general analytics visibility';