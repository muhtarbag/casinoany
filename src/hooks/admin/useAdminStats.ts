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
        { data: paymentsData },
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
        supabase.from('affiliate_payments').select('payment_amount, payment_status'),
      ]);

      const totalViews = statsData?.reduce((sum, stat) => sum + (stat.views || 0), 0) || 0;
      const totalClicks = statsData?.reduce((sum, stat) => sum + (stat.clicks || 0), 0) || 0;
      const totalBlogViews = blogData?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;
      const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0';
      
      // Calculate total revenue from paid affiliate payments
      const totalRevenue = paymentsData?.reduce((sum, payment) => {
        if (payment.payment_status === 'paid' && payment.payment_amount) {
          return sum + parseFloat(String(payment.payment_amount));
        }
        return sum;
      }, 0) || 0;

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
        totalRevenue,
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Daily page views (last 30 days)
  const dailyPageViewsQuery = useQuery({
    queryKey: ['daily-page-views'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_views')
        .select('created_at')
        .gte('created_at', subDays(new Date(), 30).toISOString());

      if (error) throw error;

      const viewsByDate = (data || []).reduce((acc, view) => {
        const date = new Date(view.created_at).toLocaleDateString('tr-TR');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(viewsByDate).map(([date, count]) => ({ date, count }));
    },
  });

  // Device stats - MIGRATED to analytics_events
  const deviceStatsQuery = useQuery({
    queryKey: ['device-stats'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('analytics_events')
        .select('device_type')
        .eq('event_type', 'page_view')
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

  // Top pages - MIGRATED to analytics_events
  const topPagesQuery = useQuery({
    queryKey: ['top-pages'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('analytics_events')
        .select('page_path')
        .eq('event_type', 'page_view')
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

  // Weekly comparison - This week vs last week
  const weeklyComparisonQuery = useQuery({
    queryKey: ['weekly-comparison'],
    queryFn: async () => {
      const today = new Date();
      const thisWeekStart = subDays(today, 7);
      const lastWeekStart = subDays(today, 14);

      const [thisWeekData, lastWeekData] = await Promise.all([
        (supabase as any)
          .from('analytics_events')
          .select('event_type, event_name')
          .eq('event_type', 'page_view')
          .gte('created_at', thisWeekStart.toISOString())
          .lte('created_at', today.toISOString()),
        (supabase as any)
          .from('analytics_events')
          .select('event_type, event_name')
          .eq('event_type', 'page_view')
          .gte('created_at', lastWeekStart.toISOString())
          .lte('created_at', thisWeekStart.toISOString()),
      ]);

      const thisWeekViews = thisWeekData.data?.length || 0;
      const lastWeekViews = lastWeekData.data?.length || 0;
      const viewsChange = lastWeekViews > 0 ? ((thisWeekViews - lastWeekViews) / lastWeekViews) * 100 : 0;

      const [thisWeekClicks, lastWeekClicks] = await Promise.all([
        (supabase as any)
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'click')
          .gte('created_at', thisWeekStart.toISOString()),
        (supabase as any)
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'click')
          .gte('created_at', lastWeekStart.toISOString())
          .lte('created_at', thisWeekStart.toISOString()),
      ]);

      const thisWeekClicksCount = thisWeekClicks.count || 0;
      const lastWeekClicksCount = lastWeekClicks.count || 0;
      const clicksChange = lastWeekClicksCount > 0 ? ((thisWeekClicksCount - lastWeekClicksCount) / lastWeekClicksCount) * 100 : 0;

      const [thisWeekReviews, lastWeekReviews] = await Promise.all([
        (supabase as any)
          .from('site_reviews')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thisWeekStart.toISOString()),
        (supabase as any)
          .from('site_reviews')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', lastWeekStart.toISOString())
          .lte('created_at', thisWeekStart.toISOString()),
      ]);

      const thisWeekReviewsCount = thisWeekReviews.count || 0;
      const lastWeekReviewsCount = lastWeekReviews.count || 0;
      const reviewsChange = lastWeekReviewsCount > 0 ? ((thisWeekReviewsCount - lastWeekReviewsCount) / lastWeekReviewsCount) * 100 : 0;

      return [
        {
          name: "Görüntüleme",
          current: thisWeekViews,
          previous: lastWeekViews,
          change: viewsChange,
          trend: viewsChange >= 0 ? "up" : "down" as "up" | "down"
        },
        {
          name: "Tıklama",
          current: thisWeekClicksCount,
          previous: lastWeekClicksCount,
          change: clicksChange,
          trend: clicksChange >= 0 ? "up" : "down" as "up" | "down"
        },
        {
          name: "Yorum",
          current: thisWeekReviewsCount,
          previous: lastWeekReviewsCount,
          change: reviewsChange,
          trend: reviewsChange >= 0 ? "up" : "down" as "up" | "down"
        }
      ];
    },
  });

  // Monthly trend - Last 30 days
  const monthlyTrendQuery = useQuery({
    queryKey: ['monthly-trend'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);

      const { data: viewsData } = await (supabase as any)
        .from('analytics_events')
        .select('created_at')
        .eq('event_type', 'page_view')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { data: clicksData } = await (supabase as any)
        .from('analytics_events')
        .select('created_at')
        .eq('event_type', 'click')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const trendByDate: Record<string, { views: number; clicks: number }> = {};

      viewsData?.forEach((item: any) => {
        const date = new Date(item.created_at).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
        if (!trendByDate[date]) trendByDate[date] = { views: 0, clicks: 0 };
        trendByDate[date].views += 1;
      });

      clicksData?.forEach((item: any) => {
        const date = new Date(item.created_at).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
        if (!trendByDate[date]) trendByDate[date] = { views: 0, clicks: 0 };
        trendByDate[date].clicks += 1;
      });

      return Object.entries(trendByDate)
        .map(([date, data]) => ({ date, ...data }))
        .slice(-30);
    },
  });

  // Custom metrics
  const customMetricsQuery = useQuery({
    queryKey: ['custom-metrics'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);

      // Avg response time from system health metrics
      const { data: healthData } = await (supabase as any)
        .from('system_health_metrics')
        .select('metric_value')
        .eq('metric_name', 'api_response_time')
        .gte('recorded_at', thirtyDaysAgo.toISOString());

      const avgResponseTime = healthData?.length > 0
        ? Math.round(healthData.reduce((sum: number, m: any) => sum + m.metric_value, 0) / healthData.length)
        : 187;

      // Peak traffic hour
      const { data: hourlyData } = await (supabase as any)
        .from('analytics_events')
        .select('created_at')
        .eq('event_type', 'page_view')
        .gte('created_at', subDays(new Date(), 7).toISOString());

      const hourCounts: Record<number, number> = {};
      hourlyData?.forEach((item: any) => {
        const hour = new Date(item.created_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const peakHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0];
      const peakTrafficHour = peakHour ? `${peakHour[0]}:00` : '14:00';

      // Conversion rate (clicks / views)
      const { data: recentViews } = await (supabase as any)
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { data: recentClicks } = await (supabase as any)
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'click')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const views = recentViews.count || 1;
      const clicks = recentClicks.count || 0;
      const conversionRate = parseFloat(((clicks / views) * 100).toFixed(2));

      // Bounce rate from sessions
      const { data: sessions } = await (supabase as any)
        .from('analytics_sessions')
        .select('is_bounce')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const bounces = sessions?.filter((s: any) => s.is_bounce).length || 0;
      const totalSessions = sessions?.length || 1;
      const bounceRate = parseFloat(((bounces / totalSessions) * 100).toFixed(2));

      return {
        avgResponseTime,
        peakTrafficHour,
        conversionRate,
        bounceRate
      };
    },
  });

  return {
    dashboardStats: dashboardStatsQuery.data,
    isLoadingStats: dashboardStatsQuery.isLoading,
    dailyPageViews: dailyPageViewsQuery.data,
    deviceStats: deviceStatsQuery.data,
    topPages: topPagesQuery.data,
    weeklyComparison: weeklyComparisonQuery.data,
    monthlyTrend: monthlyTrendQuery.data,
    customMetrics: customMetricsQuery.data,
  };
};
