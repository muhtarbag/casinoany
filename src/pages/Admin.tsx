import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminStats } from '@/hooks/admin/useAdminStats';
import { LoadingFallback } from '@/components/admin/LoadingFallback';
import { Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Lazy loaded components
const DashboardTab = lazy(() => import('@/components/admin/DashboardTab').then(m => ({ default: m.DashboardTab })));
const SiteManagementContainer = lazy(() => import('@/features/sites/SiteManagementContainer').then(m => ({ default: m.SiteManagementContainer })));
const FeaturedSitesManagement = lazy(() => import('@/components/FeaturedSitesManagement').then(m => ({ default: m.FeaturedSitesManagement })));
const SiteStats = lazy(() => import('@/components/SiteStats'));
const BlogStats = lazy(() => import('@/components/BlogStats'));
const ReviewManagement = lazy(() => import('@/components/ReviewManagement'));
const BlogManagement = lazy(() => import('@/components/BlogManagement').then(m => ({ default: m.BlogManagement })));
const BlogCommentManagement = lazy(() => import('@/components/BlogCommentManagement').then(m => ({ default: m.BlogCommentManagement })));
const AIAssistant = lazy(() => import('@/components/AIAssistant').then(m => ({ default: m.AIAssistant })));
const AnalysisHistory = lazy(() => import('@/components/AnalysisHistory').then(m => ({ default: m.AnalysisHistory })));
const ContentPlanner = lazy(() => import('@/components/ContentPlanner').then(m => ({ default: m.ContentPlanner })));
const KeywordPerformance = lazy(() => import('@/components/KeywordPerformance').then(m => ({ default: m.KeywordPerformance })));
const CasinoContentManagement = lazy(() => import('@/components/CasinoContentManagement').then(m => ({ default: m.CasinoContentManagement })));
const CasinoContentAnalytics = lazy(() => import('@/components/CasinoContentAnalytics').then(m => ({ default: m.CasinoContentAnalytics })));
const NotificationManagement = lazy(() => import('@/components/NotificationManagement').then(m => ({ default: m.NotificationManagement })));
const CarouselSettings = lazy(() => import('@/components/CarouselSettings').then(m => ({ default: m.CarouselSettings })));
const AnalyticsDashboard = lazy(() => import('@/components/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const SystemHealthDashboard = lazy(() => import('@/components/SystemHealthDashboard').then(m => ({ default: m.SystemHealthDashboard })));
const SystemLogsViewer = lazy(() => import('@/components/SystemLogsViewer').then(m => ({ default: m.SystemLogsViewer })));
const NewsManagement = lazy(() => import('@/components/NewsManagement').then(m => ({ default: m.NewsManagement })));
const RealtimeAnalyticsDashboard = lazy(() => import('@/components/RealtimeAnalyticsDashboard').then(m => ({ default: m.RealtimeAnalyticsDashboard })));
const GSCSetupGuide = lazy(() => import('@/components/GSCSetupGuide'));
const BonusManagement = lazy(() => import('@/components/BonusManagement').then(m => ({ default: m.BonusManagement })));
const CMSContentManagement = lazy(() => import('@/components/CMSContentManagement').then(m => ({ default: m.CMSContentManagement })));
const AffiliateManagement = lazy(() => import('@/components/AffiliateManagement').then(m => ({ default: m.AffiliateManagement })));
const ChangeHistoryViewer = lazy(() => import('@/components/history/ChangeHistoryViewer').then(m => ({ default: m.ChangeHistoryViewer })));
const PerformanceMonitor = lazy(() => import('@/components/performance/PerformanceMonitor').then(m => ({ default: m.PerformanceMonitor })));
const PerformanceDashboard = lazy(() => import('@/components/performance/PerformanceDashboard').then(m => ({ default: m.PerformanceDashboard })));
const BonusRequestsManagement = lazy(() => import('@/components/BonusRequestsManagement').then(m => ({ default: m.BonusRequestsManagement })));

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
      toast.error('Bu sayfaya erişim yetkiniz yok.');
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Invalidate affiliate data when switching to affiliate tab
  useEffect(() => {
    if (activeTab === 'affiliate') {
      queryClient.invalidateQueries({ queryKey: ['affiliate-sites'] });
    }
  }, [activeTab, queryClient]);

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Use centralized stats hook
  const { dashboardStats, isLoadingStats, dailyPageViews, deviceStats, topPages } = useAdminStats();

  if (authLoading || isLoadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      username={userProfile?.username || 'Admin'}
    >
      <Suspense fallback={<LoadingFallback />}>
        {activeTab === 'dashboard' && dashboardStats && (
          <DashboardTab 
            dashboardStats={dashboardStats}
            dailyPageViews={dailyPageViews || []}
            deviceStats={deviceStats || []}
            topPages={topPages || []}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'manage' && <SiteManagementContainer />}
        {activeTab === 'featured' && <FeaturedSitesManagement />}
        {activeTab === 'site-stats' && <SiteStats />}
        {activeTab === 'blog-stats' && <BlogStats />}
        {activeTab === 'reviews' && <ReviewManagement />}
        {activeTab === 'blog' && <BlogManagement />}
        {activeTab === 'comments' && <BlogCommentManagement />}
        {activeTab === 'ai' && <AIAssistant />}
        {activeTab === 'ai-history' && <AnalysisHistory />}
        {activeTab === 'content-planner' && <ContentPlanner />}
        {activeTab === 'keywords' && <KeywordPerformance />}
        {activeTab === 'casino-content' && <CasinoContentManagement />}
        {activeTab === 'casino-analytics' && <CasinoContentAnalytics />}
        {activeTab === 'notifications' && <NotificationManagement />}
        {activeTab === 'carousel' && <CarouselSettings />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'health' && <SystemHealthDashboard />}
        {activeTab === 'logs' && <SystemLogsViewer />}
        {activeTab === 'news' && <NewsManagement />}
        {activeTab === 'realtime' && <RealtimeAnalyticsDashboard />}
        {activeTab === 'gsc' && <GSCSetupGuide />}
        {activeTab === 'bonus' && <BonusManagement />}
        {activeTab === 'cms' && <CMSContentManagement />}
        {activeTab === 'affiliate' && <AffiliateManagement />}
        {activeTab === 'bonus-requests' && <BonusRequestsManagement />}
        {activeTab === 'history' && <ChangeHistoryViewer tableFilter="betting_sites" limit={50} />}
        {activeTab === 'performance' && <PerformanceDashboard />}
      </Suspense>
    </AdminLayout>
  );
}
