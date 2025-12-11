-- Add scheduled publishing to blog posts
ALTER TABLE public.blog_posts
ADD COLUMN scheduled_publish_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient scheduled post queries
CREATE INDEX idx_blog_posts_scheduled 
ON public.blog_posts(scheduled_publish_at) 
WHERE is_published = false AND scheduled_publish_at IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.blog_posts.scheduled_publish_at IS 'Zamanlanmış yayınlama tarihi. Null ise hemen yayınlanır, dolu ise bu tarihte otomatik yayınlanır.';