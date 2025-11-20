/**
 * Query Optimization Utilities
 * Merkezi query optimizasyon stratejileri
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Optimized column selections for different use cases
 * Her tablo için hangi kolonların ne zaman gerekli olduğunu tanımlar
 */
export const OPTIMIZED_SELECTS = {
  // Betting Sites - farklı use case'ler için farklı kolonlar
  bettingSites: {
    // List view için minimal kolonlar (70% daha az veri)
    list: 'id, name, slug, logo_url, bonus, rating, avg_rating, review_count, is_featured, display_order',
    
    // Card view için
    card: 'id, name, slug, logo_url, bonus, rating, avg_rating, review_count, is_featured, features, pros',
    
    // Full detail page için (tüm kolonlar)
    detail: '*',
    
    // Admin panel için (hassas bilgiler dahil)
    admin: '*',
  },
  
  // Reviews - optimize edilmiş select'ler
  reviews: {
    list: 'id, site_id, user_id, rating, title, comment, created_at, is_approved',
    detail: '*',
  },
  
  // Blog posts
  blogPosts: {
    list: 'id, title, slug, excerpt, featured_image, category, created_at, published_at, view_count',
    card: 'id, title, slug, excerpt, featured_image, category, published_at, read_time',
    detail: '*',
  },
  
  // Profiles
  profiles: {
    minimal: 'id, username, avatar_url',
    basic: 'id, username, avatar_url, first_name, last_name, user_type',
    full: '*',
  },
  
  // Stats - sadece ihtiyaç duyulan metrikler
  stats: {
    site: 'site_id, views, clicks, email_clicks, whatsapp_clicks, telegram_clicks',
    analytics: 'id, site_id, view_date, total_views, affiliate_clicks, bounce_rate',
  }
} as const;

/**
 * Smart query builder - otomatik olarak en optimize select'i kullanır
 */
export const OptimizedQueries = {
  /**
   * Betting Sites List - Admin değilse minimal kolonlar
   */
  bettingSitesList: (isAdmin = false) => {
    const select = isAdmin ? OPTIMIZED_SELECTS.bettingSites.admin : OPTIMIZED_SELECTS.bettingSites.list;
    return supabase
      .from('betting_sites')
      .select(select)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
  },

  /**
   * Betting Site Detail - sadece detail sayfası için full data
   */
  bettingSiteDetail: (slugOrId: string, bySlug = true) => {
    return supabase
      .from('betting_sites')
      .select(OPTIMIZED_SELECTS.bettingSites.detail)
      .eq('is_active', true)
      .eq(bySlug ? 'slug' : 'id', slugOrId)
      .maybeSingle();
  },

  /**
   * Reviews with minimal profile info
   */
  reviewsWithProfiles: (siteId: string) => {
    return supabase
      .from('site_reviews')
      .select(`
        ${OPTIMIZED_SELECTS.reviews.list},
        profiles:user_id (${OPTIMIZED_SELECTS.profiles.minimal})
      `)
      .eq('site_id', siteId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
  },

  /**
   * Blog posts for listing (minimal data)
   */
  blogPostsList: (limit = 10) => {
    return supabase
      .from('blog_posts')
      .select(OPTIMIZED_SELECTS.blogPosts.card)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit);
  },
};

/**
 * Count-only queries (head: true for performance)
 * Sadece sayı döndürür, veri çekmez - 90% daha hızlı
 */
export const CountQueries = {
  totalSites: () => 
    supabase.from('betting_sites').select('*', { count: 'exact', head: true }),
  
  totalReviews: () => 
    supabase.from('site_reviews').select('*', { count: 'exact', head: true }).eq('is_approved', true),
  
  totalBlogPosts: () => 
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('is_published', true),
  
  siteReviewCount: (siteId: string) =>
    supabase.from('site_reviews').select('*', { count: 'exact', head: true }).eq('site_id', siteId).eq('is_approved', true),
};

/**
 * Pagination helper - consistent pagination across the app
 */
export const paginateQuery = <T>(
  query: any,
  page: number = 1,
  pageSize: number = 20
) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return query.range(from, to);
};

/**
 * Batch operations - birden fazla query'yi paralel çalıştır
 */
export const batchQueries = {
  /**
   * Site ile ilgili tüm verileri paralel çek
   */
  async siteDetailsBundle(siteId: string) {
    const [site, stats, reviews] = await Promise.all([
      OptimizedQueries.bettingSiteDetail(siteId, false),
      supabase.from('site_stats').select('*').eq('site_id', siteId).maybeSingle(),
      CountQueries.siteReviewCount(siteId),
    ]);

    return {
      site: site.data,
      stats: stats.data,
      reviewCount: reviews.count || 0,
    };
  },

  /**
   * Admin dashboard stats - tüm sayıları paralel çek
   */
  async adminStats() {
    const [sites, reviews, blogs, comments] = await Promise.all([
      CountQueries.totalSites(),
      CountQueries.totalReviews(),
      CountQueries.totalBlogPosts(),
      supabase.from('blog_comments').select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalSites: sites.count || 0,
      totalReviews: reviews.count || 0,
      totalBlogPosts: blogs.count || 0,
      totalComments: comments.count || 0,
    };
  },
};
