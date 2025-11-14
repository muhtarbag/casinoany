import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

export const useAdminStats = () => {
  // Dashboard stats
  const dashboardStatsQuery = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [
        { count: sitesCount },
        { count: activeSitesCount },
        { count: usersCount },
        { count: reviewsCount },
        { count: pendingReviewsCount },
        { count: approvedReviewsCount },
        { count: blogPostsCount },
        { count: publishedBlogsCount },
        { count: blogCommentsCount },
        { count: pendingCommentsCount },
        { data: statsData },
        { data: blogData },
      ] = await Promise.all([
        supabase.from('betting_sites').select('*', { count: 'exact', head: true }),
        supabase.from('betting_sites').select('*', { count: 'exact', head: true }).eq('is_active', true),
        (supabase as any).from('profiles').select('*', { count: 'exact', head: true }),
        (supabase as any).from('site_reviews').select('*', { count: 'exact', head: true }),
        (supabase as any).from('site_reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        (supabase as any).from('site_reviews').select('*', { count: 'exact', head: true }).eq('is_approved', true),
        (supabase as any).from('blog_posts').select('*', { count: 'exact', head: true }),
        (supabase as any).from('blog_posts').select('*', { count: 'exact', head: true }).eq('is_published', true),
        (supabase as any).from('blog_comments').select('*', { count: 'exact', head: true }),
        (supabase as any).from('blog_comments').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        (supabase as any).from('site_stats').select('views, clicks'),
        (supabase as any).from('blog_posts').select('view_count'),
      ]);

      const totalViews = statsData?.reduce((sum, stat) => sum + (stat.views || 0), 0) || 0;
      const totalClicks = statsData?.reduce((sum, stat) => sum + (stat.clicks || 0), 0) || 0;
      const totalBlogViews = blogData?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;
      const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0';

      return {
        totalSites: sitesCount || 0,
        activeSites: activeSitesCount || 0,
        totalUsers: usersCount || 0,
        totalReviews: reviewsCount || 0,
        pendingReviews: pendingReviewsCount || 0,
        approvedReviews: approvedReviewsCount || 0,
        totalBlogPosts: blogPostsCount || 0,
        publishedBlogs: publishedBlogsCount || 0,
        totalBlogComments: blogCommentsCount || 0,
        pendingComments: pendingCommentsCount || 0,
        totalViews,
        totalClicks,
        totalBlogViews,
        ctr,
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Daily page views (last 30 days)
  const dailyPageViewsQuery = useQuery({
    queryKey: ['daily-page-views'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('page_views')
        .select('created_at')
        .gte('created_at', subDays(new Date(), 30).toISOString());

      if (error) throw error;

      const viewsByDate = data.reduce((acc, view) => {
        const date = new Date(view.created_at).toLocaleDateString('tr-TR');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(viewsByDate).map(([date, count]) => ({ date, count }));
    },
  });

  // Device stats
  const deviceStatsQuery = useQuery({
    queryKey: ['device-stats'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('page_views')
        .select('device_type')
        .gte('created_at', subDays(new Date(), 30).toISOString());

      if (error) throw error;

      const deviceCounts = data.reduce((acc, view) => {
        const device = view.device_type || 'Unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));
    },
  });

  // Top pages
  const topPagesQuery = useQuery({
    queryKey: ['top-pages'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('page_views')
        .select('page_path')
        .gte('created_at', subDays(new Date(), 30).toISOString());

      if (error) throw error;

      const pageCounts = data.reduce((acc, view) => {
        const path = view.page_path || '/';
        acc[path] = (acc[path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(pageCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([page, views]) => ({ page, views: views as number }));
    },
  });

  return {
    dashboardStats: dashboardStatsQuery.data,
    isLoadingStats: dashboardStatsQuery.isLoading,
    dailyPageViews: dailyPageViewsQuery.data,
    deviceStats: deviceStatsQuery.data,
    topPages: topPagesQuery.data,
  };
};
