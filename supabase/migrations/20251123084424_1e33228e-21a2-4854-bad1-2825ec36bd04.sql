-- Add featured image fields to news_articles table
ALTER TABLE news_articles 
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS featured_image_alt TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT;

-- Add comment for documentation
COMMENT ON COLUMN news_articles.featured_image IS 'Main featured image URL for the news article';
COMMENT ON COLUMN news_articles.featured_image_alt IS 'Alt text for featured image (SEO)';
COMMENT ON COLUMN news_articles.og_image IS 'Open Graph image URL (if different from featured_image)';