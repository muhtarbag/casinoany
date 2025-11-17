-- Enable public read access to betting_sites for active sites
CREATE POLICY "Public read access for active betting sites"
ON public.betting_sites
FOR SELECT
USING (is_active = true);

-- Also allow read access to site banners
CREATE POLICY "Public read access for active banners"
ON public.site_banners
FOR SELECT
USING (is_active = true);