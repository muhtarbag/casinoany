-- Create junction table for blog posts and related betting sites
CREATE TABLE public.blog_post_related_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, site_id)
);

-- Create indexes for better performance
CREATE INDEX idx_blog_post_related_sites_post_id ON public.blog_post_related_sites(post_id);
CREATE INDEX idx_blog_post_related_sites_site_id ON public.blog_post_related_sites(site_id);

-- Enable RLS
ALTER TABLE public.blog_post_related_sites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view related sites
CREATE POLICY "Anyone can view related sites"
ON public.blog_post_related_sites
FOR SELECT
USING (true);

-- Admins can insert related sites
CREATE POLICY "Admins can insert related sites"
ON public.blog_post_related_sites
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update related sites
CREATE POLICY "Admins can update related sites"
ON public.blog_post_related_sites
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete related sites
CREATE POLICY "Admins can delete related sites"
ON public.blog_post_related_sites
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

COMMENT ON TABLE public.blog_post_related_sites IS 'Junction table linking blog posts with related betting sites';