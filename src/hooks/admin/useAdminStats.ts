import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * LIGHTWEIGHT ADMIN STATS - Analytics Removed
 * Only fetches critical business metrics for maximum performance
 */
export const useAdminStats = () => {
  // Main dashboard statistics (critical metrics only)
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Sites count
      const { count: sitesCount } = await supabase
        .from('betting_sites')
        .select('*', { count: 'exact', head: true });

      // Reviews count
      const { count: reviewsCount } = await supabase
        .from('site_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true);

      // Blog posts count
      const { count: blogCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Blog comments count
      const { count: commentsCount } = await supabase
        .from('blog_comments')
        .select('*', { count: 'exact', head: true });

      // Affiliate clicks (critical metric)
      const { count: totalClicks } = await supabase
        .from('conversions')
        .select('*', { count: 'exact', head: true })
        .eq('conversion_type', 'affiliate_click');

      return {
        totalSites: sitesCount || 0,
        totalReviews: reviewsCount || 0,
        totalBlogPosts: blogCount || 0,
        totalComments: commentsCount || 0,
        totalClicks: totalClicks || 0,
      };
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  return {
    dashboardStats,
    isLoadingStats,
  };
};
