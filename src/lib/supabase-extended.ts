/**
 * Extended Supabase Helpers - Comprehensive Type-Safe Wrappers
 * Eliminates need for 'as any' across the application
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Core table types from Database
type Tables = Database['public']['Tables'];

// Extended query builders for ALL tables with relations
export const TypedDB = {
  // ===== SITES =====
  bettingSites: () => supabase.from('betting_sites').select('*'),
  
  bettingSitesActive: () => 
    supabase.from('betting_sites')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),
  
  bettingSitesFull: () => 
    supabase.from('betting_sites_full')
      .select('*')
      .eq('is_active', true),
  
  bettingSiteBySlug: (slug: string) =>
    supabase.from('betting_sites')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle(), // ✅ FIX: Use maybeSingle to prevent crash
  
  bettingSiteWithStats: (siteId: string) =>
    supabase.from('betting_sites')
      .select(`
        *,
        affiliate:betting_sites_affiliate(*),
        content:betting_sites_content(*),
        social:betting_sites_social(*)
      `)
      .eq('id', siteId)
      .maybeSingle(), // ✅ FIX: Use maybeSingle

  // ===== BLOG =====
  blogPosts: () => supabase.from('blog_posts').select('*'),
  
  blogPostWithRelations: (postId: string) =>
    supabase.from('blog_posts')
      .select(`
        *,
        related_sites:blog_post_related_sites(
          site_id,
          display_order,
          site:betting_sites(*)
        ),
        category:categories(*)
      `)
      .eq('id', postId)
      .maybeSingle(), // ✅ FIX: Use maybeSingle
  
  blogComments: (postId: string) =>
    supabase.from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false }),

  // ===== REVIEWS =====
  siteReviews: () => 
    supabase.from('site_reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false }),
  
  reviewsWithSites: () =>
    supabase.from('site_reviews')
      .select(`
        *,
        site:betting_sites(id, name, logo_url, slug)
      `)
      .eq('is_approved', true),

  // ===== NOTIFICATIONS =====
  activeNotifications: () =>
    supabase.from('site_notifications')
      .select('*')
      .eq('is_active', true)
      .gte('expire_at', new Date().toISOString())
      .order('priority', { ascending: false }),

  // ===== CATEGORIES =====
  activeCategories: () =>
    supabase.from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),

  // ===== BONUS =====
  bonusOffers: (siteId?: string) => {
    const query = supabase.from('bonus_offers').select('*').eq('is_active', true);
    return siteId ? query.eq('site_id', siteId) : query;
  },

  // ===== AFFILIATE =====
  affiliateMetrics: (siteId: string) =>
    supabase.from('affiliate_metrics')
      .select('*')
      .eq('site_id', siteId)
      .order('metric_date', { ascending: false }),

  // ===== NEWS =====
  publishedNews: () =>
    supabase.from('news_articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false }),
  
  newsArticleBySlug: (slug: string) =>
    supabase.from('news_articles')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle(), // ✅ FIX: Use maybeSingle
  
  // ===== SITE STATS =====
  siteStats: (siteIds: string[]) =>
    supabase.from('site_stats')
      .select('site_id, views, clicks')
      .in('site_id', siteIds),
  
  // ===== RECOMMENDED SITES =====
  recommendedSitesPool: () =>
    supabase.from('recommended_sites_pool')
      .select(`
        *,
        site:betting_sites(*)
      `)
      .order('display_order'),
  
  // ===== CASINO CONTENT =====
  casinoContentVersions: (siteId: string) =>
    supabase.from('casino_content_versions')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false }),
  
  // ===== ADVANCED ANALYTICS =====
  reputationScore: (siteId: string) =>
    supabase.from('site_reputation_scores')
      .select('*')
      .eq('site_id', siteId)
      .maybeSingle(),
  
  siteBadges: (siteId: string) =>
    supabase.from('site_badges')
      .select('*')
      .eq('site_id', siteId)
      .eq('is_active', true)
      .order('display_order'),
  
  seoMetrics: (siteId: string) =>
    supabase.from('site_seo_metrics')
      .select('*')
      .eq('site_id', siteId)
      .maybeSingle(),
  
  siteKeywords: (siteId: string) =>
    supabase.from('site_keywords')
      .select('*')
      .eq('site_id', siteId)
      .order('priority', { ascending: false })
      .order('current_rank', { ascending: true, nullsFirst: false }),
  
  reviewHighlights: (siteId: string) =>
    supabase.from('site_review_highlights')
      .select(`
        *,
        review:review_id(*)
      `)
      .eq('site_id', siteId)
      .eq('is_active', true)
      .order('display_order'),
};

/**
 * Type-safe mutation helpers
 */
export const TypedMutations = {
  // Blog post related sites
  upsertBlogRelatedSites: async (postId: string, siteIds: string[]) => {
    // Delete existing
    await supabase.from('blog_post_related_sites').delete().eq('post_id', postId);
    
    // Insert new
    if (siteIds.length > 0) {
      const relations = siteIds.map((siteId, index) => ({
        post_id: postId,
        site_id: siteId,
        display_order: index
      }));
      
      return supabase.from('blog_post_related_sites').insert(relations);
    }
    
    return { data: null, error: null };
  },

  // Increment site clicks
  incrementSiteClicks: async (siteId: string) => {
    // Use RPC for atomic increment if available, otherwise manual
    const { data: stats } = await supabase
      .from('affiliate_metrics')
      .select('total_clicks')
      .eq('site_id', siteId)
      .eq('metric_date', new Date().toISOString().split('T')[0])
      .single();

    if (stats) {
      return supabase
        .from('affiliate_metrics')
        .update({ total_clicks: stats.total_clicks + 1 })
        .eq('site_id', siteId)
        .eq('metric_date', new Date().toISOString().split('T')[0]);
    }

    return supabase.from('affiliate_metrics').insert({
      site_id: siteId,
      total_clicks: 1,
      metric_date: new Date().toISOString().split('T')[0],
    });
  },

  // Track notification view
  trackNotificationView: async (notificationId: string, userId?: string) => {
    return supabase.from('notification_views').insert({
      notification_id: notificationId,
      user_id: userId || null,
      viewed_at: new Date().toISOString()
    });
  },

  // Track notification click
  trackNotificationClick: async (notificationId: string, userId?: string) => {
    return supabase.from('notification_views')
      .update({ 
        clicked: true, 
        clicked_at: new Date().toISOString() 
      })
      .eq('notification_id', notificationId)
      .is('clicked', null);
  },
};

/**
 * Type-safe RPC helpers
 */
export const TypedRPC = {
  trackSearch: (searchTerm: string) =>
    supabase.rpc('track_search', { p_search_term: searchTerm }),
  
  trackConversion: (params: {
    p_conversion_type: string;
    p_page_path: string;
    p_site_id?: string;
    p_conversion_value?: number;
    p_session_id?: string;
    p_metadata?: Record<string, any>;
  }) => supabase.rpc('track_conversion', params),
  
  incrementCasinoAnalytics: (params: {
    p_site_id: string;
    p_block_name?: string;
    p_is_affiliate_click?: boolean;
  }) => supabase.rpc('increment_casino_analytics', params),
  
  // ✅ YENİ: Thread-safe site stats increment
  incrementSiteStats: (params: {
    p_site_id: string;
    p_metric_type?: 'view' | 'click' | 'email_click' | 'whatsapp_click' | 'telegram_click' | 'twitter_click' | 'instagram_click' | 'facebook_click' | 'youtube_click';
  }) => supabase.rpc('increment_site_stats', params),
  
  // ✅ YENİ: Güvenli rol kontrolü
  getUserRoleStatus: (userId: string) => 
    supabase.rpc('get_user_role_status', { p_user_id: userId }),
  
  incrementBlogViewCount: (postId: string) =>
    supabase.rpc('increment_blog_view_count', { post_id: postId }),
  
  incrementNewsViewCount: (articleId: string) =>
    supabase.rpc('increment_news_view_count', { article_id: articleId }),
};

export default TypedDB;
