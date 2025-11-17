-- ============================================
-- HIGH #2: Database Query Optimization
-- Missing Indexes & Query Performance (Fixed)
-- ============================================

-- 1. Add indexes on frequently filtered columns
CREATE INDEX IF NOT EXISTS idx_site_owners_status 
ON site_owners(status) 
WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_site_owners_user_id 
ON site_owners(user_id);

CREATE INDEX IF NOT EXISTS idx_site_owners_site_id 
ON site_owners(site_id);

-- 2. Add composite indexes for common JOIN + filter patterns
CREATE INDEX IF NOT EXISTS idx_complaint_responses_complaint_user 
ON complaint_responses(complaint_id, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_approved 
ON blog_comments(post_id, is_approved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_views_user_viewed 
ON notification_views(user_id, viewed_at DESC) 
WHERE dismissed = false;

-- 3. Add indexes for site categories JOIN optimization
CREATE INDEX IF NOT EXISTS idx_site_categories_category_id 
ON site_categories(category_id);

CREATE INDEX IF NOT EXISTS idx_site_categories_site_display 
ON site_categories(site_id, display_order);

-- 4. Add indexes for blog post related sites
CREATE INDEX IF NOT EXISTS idx_blog_related_sites_post_order 
ON blog_post_related_sites(post_id, display_order);

CREATE INDEX IF NOT EXISTS idx_blog_related_sites_site_id 
ON blog_post_related_sites(site_id);

-- 5. Add GIN indexes for array columns (if not exists)
CREATE INDEX IF NOT EXISTS idx_betting_sites_features_gin 
ON betting_sites USING gin(features);

CREATE INDEX IF NOT EXISTS idx_betting_sites_pros_gin 
ON betting_sites USING gin(pros);

CREATE INDEX IF NOT EXISTS idx_betting_sites_cons_gin 
ON betting_sites USING gin(cons);

-- 6. Add indexes for metadata JSONB columns
CREATE INDEX IF NOT EXISTS idx_page_views_metadata_gin 
ON page_views USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_conversions_metadata_gin 
ON conversions USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_system_logs_metadata_gin 
ON system_logs USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_user_events_metadata_gin 
ON user_events USING gin(metadata);

-- 7. Add partial indexes for frequently filtered active records
CREATE INDEX IF NOT EXISTS idx_bonus_offers_active_display 
ON bonus_offers(is_active, display_order) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_categories_active_display 
ON categories(is_active, display_order) 
WHERE is_active = true;

-- 8. Add indexes for user_events analytics
CREATE INDEX IF NOT EXISTS idx_user_events_user_created 
ON user_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_events_event_type 
ON user_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_events_event_name 
ON user_events(event_name, created_at DESC);

-- 9. Add index for system_logs filtering (FIXED: use 'severity' not 'log_level')
CREATE INDEX IF NOT EXISTS idx_system_logs_severity_created 
ON system_logs(severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_logs_log_type_created 
ON system_logs(log_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_logs_user_id 
ON system_logs(user_id, created_at DESC);

-- 10. Optimize casino_content_versions queries
CREATE INDEX IF NOT EXISTS idx_casino_versions_source 
ON casino_content_versions(generation_source, created_at DESC);

-- Performance Analysis Comments
COMMENT ON INDEX idx_site_owners_status IS 'Optimizes site owner approval status queries';
COMMENT ON INDEX idx_complaint_responses_complaint_user IS 'Optimizes complaint response lookups with user filtering';
COMMENT ON INDEX idx_blog_comments_post_approved IS 'Optimizes blog comment queries by post and approval status';
COMMENT ON INDEX idx_notification_views_user_viewed IS 'Optimizes user notification history queries';
COMMENT ON INDEX idx_site_categories_site_display IS 'Optimizes category display ordering per site';
COMMENT ON INDEX idx_system_logs_severity_created IS 'Optimizes system log filtering by severity';
COMMENT ON INDEX idx_user_events_event_type IS 'Optimizes analytics event type filtering';

-- Analyze tables to update query planner statistics
ANALYZE betting_sites;
ANALYZE blog_posts;
ANALYZE site_reviews;
ANALYZE page_views;
ANALYZE notification_views;
ANALYZE site_categories;
ANALYZE blog_comments;
ANALYZE system_logs;
ANALYZE user_events;