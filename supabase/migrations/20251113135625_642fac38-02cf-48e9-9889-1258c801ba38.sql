-- Add primary_site_id to blog_posts for site-specific blogs
ALTER TABLE public.blog_posts
ADD COLUMN primary_site_id UUID REFERENCES public.betting_sites(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_blog_posts_primary_site_id ON public.blog_posts(primary_site_id);

-- Add comment
COMMENT ON COLUMN public.blog_posts.primary_site_id IS 'The primary betting site this blog post is about - for site-specific blog sections';