-- Add composite index for related news queries
-- This optimizes the query that fetches related articles based on category, tags, and published status

-- Index for category + published status
CREATE INDEX IF NOT EXISTS idx_news_articles_category_published 
ON news_articles(category, is_published, published_at DESC)
WHERE is_published = true;

-- Index for tags (GIN index for array operations)
CREATE INDEX IF NOT EXISTS idx_news_articles_tags 
ON news_articles USING GIN(tags)
WHERE is_published = true;

-- Index for view count (for popularity sorting)
CREATE INDEX IF NOT EXISTS idx_news_articles_view_count 
ON news_articles(view_count DESC)
WHERE is_published = true AND view_count IS NOT NULL;

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_news_articles_published_date 
ON news_articles(is_published, published_at DESC)
WHERE is_published = true;

-- Add comment
COMMENT ON INDEX idx_news_articles_category_published IS 'Optimizes related news queries by category';
COMMENT ON INDEX idx_news_articles_tags IS 'Optimizes tag-based related news queries';
COMMENT ON INDEX idx_news_articles_view_count IS 'Optimizes popularity-based sorting';
COMMENT ON INDEX idx_news_articles_published_date IS 'Optimizes published articles listing';