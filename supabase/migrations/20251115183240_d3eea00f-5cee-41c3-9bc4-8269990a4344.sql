-- ============================================================
-- PHASE 1: CRITICAL INDEX DEPLOYMENT
-- High Impact Performance Indexes (0-7 Days Priority)
-- Expected Impact: 70% query speed improvement
-- Note: Indexes created without CONCURRENTLY for transaction compatibility
-- Impact: Brief locks (< 5 seconds per index with current data size)
-- ============================================================

-- ====================================
-- ANALYTICS & TRACKING (Highest Traffic)
-- ====================================

-- Page Views: Core analytics table
CREATE INDEX IF NOT EXISTS idx_page_views_created_at 
  ON page_views(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_path_created 
  ON page_views(page_path, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_session_id 
  ON page_views(session_id) 
  WHERE session_id IS NOT NULL;

-- Analytics Sessions: Session tracking
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id 
  ON analytics_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_created_at 
  ON analytics_sessions(created_at DESC);

-- Conversions: Critical for metrics
CREATE INDEX IF NOT EXISTS idx_conversions_site_created 
  ON conversions(site_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversions_type_created 
  ON conversions(conversion_type, created_at DESC);

-- ====================================
-- USER-FACING PERFORMANCE
-- ====================================

-- Site Reviews: Most displayed data
CREATE INDEX IF NOT EXISTS idx_site_reviews_site_approved 
  ON site_reviews(site_id, is_approved) 
  WHERE is_approved = true;

CREATE INDEX IF NOT EXISTS idx_site_reviews_created_at 
  ON site_reviews(created_at DESC);

-- ====================================
-- BLOG SYSTEM
-- ====================================

-- Blog Posts: SEO critical
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date 
  ON blog_posts(is_published, published_at DESC) 
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug 
  ON blog_posts(slug) 
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_blog_posts_category_published 
  ON blog_posts(category_id, is_published, published_at DESC);

-- Blog Comments: Engagement
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_approved 
  ON blog_comments(post_id, is_approved);

-- ====================================
-- CORE ENTITIES
-- ====================================

-- Betting Sites: Main entity
CREATE INDEX IF NOT EXISTS idx_betting_sites_active_featured 
  ON betting_sites(is_active, is_featured, display_order) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_betting_sites_slug 
  ON betting_sites(slug) 
  WHERE is_active = true;