-- Add unique constraint to news_articles slug
-- First check if constraint already exists and drop it if it does
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'news_articles_slug_key'
    ) THEN
        ALTER TABLE news_articles DROP CONSTRAINT news_articles_slug_key;
    END IF;
END $$;

-- Add unique constraint
ALTER TABLE news_articles 
ADD CONSTRAINT news_articles_slug_unique UNIQUE (slug);

-- Add index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_news_articles_slug ON news_articles(slug);

-- Add comment
COMMENT ON CONSTRAINT news_articles_slug_unique ON news_articles IS 'Ensures slug uniqueness for SEO-friendly URLs';