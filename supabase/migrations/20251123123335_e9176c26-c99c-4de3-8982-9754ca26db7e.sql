-- Phase 2B: Add SET search_path = public to all database functions
-- This prevents SQL injection through search_path manipulation

-- Ad Management Functions
ALTER FUNCTION public.increment_banner_stats(uuid, text) SET search_path = public;
ALTER FUNCTION public.get_active_banner(text, integer) SET search_path = public;
ALTER FUNCTION public.calculate_daily_ad_revenue(date) SET search_path = public;

-- Loyalty & Points Functions
ALTER FUNCTION public.award_points_on_blog_comment_approval() SET search_path = public;
ALTER FUNCTION public.award_points_on_review_approval() SET search_path = public;
ALTER FUNCTION public.award_points_on_complaint_resolution() SET search_path = public;
ALTER FUNCTION public.award_loyalty_points(uuid, integer, text, text, jsonb) SET search_path = public;
ALTER FUNCTION public.check_and_award_achievements(uuid) SET search_path = public;
ALTER FUNCTION public.notify_points_earned() SET search_path = public;
ALTER FUNCTION public.notify_tier_upgrade() SET search_path = public;
ALTER FUNCTION public.update_user_loyalty_tier() SET search_path = public;
ALTER FUNCTION public.update_loyalty_points_updated_at() SET search_path = public;

-- User Management Functions
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_email_verification() SET search_path = public;
ALTER FUNCTION public.sync_profile_email() SET search_path = public;
ALTER FUNCTION public.normalize_username() SET search_path = public;
ALTER FUNCTION public.is_username_available(text) SET search_path = public;
ALTER FUNCTION public.auto_approve_verified_individual() SET search_path = public;
ALTER FUNCTION public.get_user_role_status(uuid) SET search_path = public;
ALTER FUNCTION public.has_role_cached(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.update_user_roles_updated_at() SET search_path = public;

-- Notification Functions
ALTER FUNCTION public.notify_new_bonus() SET search_path = public;
ALTER FUNCTION public.notify_user_status_change() SET search_path = public;
ALTER FUNCTION public.get_unread_notification_count(uuid) SET search_path = public;
ALTER FUNCTION public.mark_notification_as_read(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.create_default_notification_preferences() SET search_path = public;
ALTER FUNCTION public.create_site_notification(uuid, text, text, text, text) SET search_path = public;
ALTER FUNCTION public.notify_on_new_complaint() SET search_path = public;
ALTER FUNCTION public.notify_on_new_review() SET search_path = public;

-- Analytics & Stats Functions
ALTER FUNCTION public.increment_news_view_count(uuid) SET search_path = public;
ALTER FUNCTION public.increment_site_stats(uuid, text) SET search_path = public;
ALTER FUNCTION public.track_conversion(text, text, uuid, numeric, text, jsonb) SET search_path = public;
ALTER FUNCTION public.track_search(text) SET search_path = public;
ALTER FUNCTION public.update_analytics_daily_summary(date) SET search_path = public;
ALTER FUNCTION public.daily_analytics_maintenance() SET search_path = public;
ALTER FUNCTION public.refresh_daily_site_metrics() SET search_path = public;
ALTER FUNCTION public.refresh_all_materialized_views() SET search_path = public;
ALTER FUNCTION public.update_site_review_stats() SET search_path = public;
ALTER FUNCTION public.update_blog_post_like_count() SET search_path = public;
ALTER FUNCTION public.update_affiliate_updated_at() SET search_path = public;

-- Domain Tracking Functions
ALTER FUNCTION public.track_betting_sites_domains() SET search_path = public;
ALTER FUNCTION public.track_review_domains() SET search_path = public;
ALTER FUNCTION public.track_complaint_domains() SET search_path = public;
ALTER FUNCTION public.track_complaint_response_domains() SET search_path = public;
ALTER FUNCTION public.track_blog_post_domains() SET search_path = public;
ALTER FUNCTION public.track_blog_comment_domains() SET search_path = public;
ALTER FUNCTION public.extract_domains_from_text(text) SET search_path = public;
ALTER FUNCTION public.track_domains_in_record(text, uuid, uuid, text, text) SET search_path = public;
ALTER FUNCTION public.scan_existing_content_for_domains() SET search_path = public;

-- Internal Links Functions
ALTER FUNCTION public.track_internal_link_click(uuid) SET search_path = public;
ALTER FUNCTION public.get_related_links(text, integer) SET search_path = public;
ALTER FUNCTION public.update_link_ctr() SET search_path = public;

-- Domain Management Functions
ALTER FUNCTION public.get_primary_domain() SET search_path = public;
ALTER FUNCTION public.get_next_available_domain() SET search_path = public;

-- Utility Functions
ALTER FUNCTION public.cleanup_old_rate_limits() SET search_path = public;
ALTER FUNCTION public.update_categories_updated_at() SET search_path = public;
ALTER FUNCTION public.set_complaint_slug() SET search_path = public;
ALTER FUNCTION public.log_system_event(text, text, text, text, jsonb, uuid, text, integer, integer, text) SET search_path = public;