-- Add content fields to categories table for SEO articles
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS content_updated_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.categories.content IS 'SEO and E-E-A-T focused article content for category pages';
COMMENT ON COLUMN public.categories.content_updated_at IS 'Last update timestamp for category content';