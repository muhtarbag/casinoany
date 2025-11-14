import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminStats } from '@/hooks/admin/useAdminStats';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Eye, MousePointer, CheckSquare, TrendingUp, MessageSquare } from 'lucide-react';
import SiteStats from '@/components/SiteStats';
import BlogStats from '@/components/BlogStats';
import ReviewManagement from '@/components/ReviewManagement';
import { BlogManagement } from '@/components/BlogManagement';
import { BlogCommentManagement } from '@/components/BlogCommentManagement';
import { FeaturedSitesManagement } from '@/components/FeaturedSitesManagement';
import { AIAssistant } from '@/components/AIAssistant';
import { AnalysisHistory } from '@/components/AnalysisHistory';
import { ContentPlanner } from '@/components/ContentPlanner';
import { KeywordPerformance } from '@/components/KeywordPerformance';
import { SiteManagementContainer } from '@/features/sites/SiteManagementContainer';
import { CasinoContentManagement } from '@/components/CasinoContentManagement';
import { CasinoContentAnalytics } from '@/components/CasinoContentAnalytics';
import { NotificationManagement } from '@/components/NotificationManagement';
import { CarouselSettings } from '@/components/CarouselSettings';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { SystemHealthDashboard } from '@/components/SystemHealthDashboard';
import { SystemLogsViewer } from '@/components/SystemLogsViewer';
import { NewsManagement } from '@/components/NewsManagement';
import { RealtimeAnalyticsDashboard } from '@/components/RealtimeAnalyticsDashboard';
import GSCSetupGuide from '@/components/GSCSetupGuide';
import { BonusManagement } from '@/components/BonusManagement';
import { CMSContentManagement } from '@/components/CMSContentManagement';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
      toast.error('Bu sayfaya erişim yetkiniz yok.');
    }
  }, [user, isAdmin, authLoading, navigate]);

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
      <div className="space-y-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardStats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Toplam Site</h3>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalSites}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.activeSites} aktif
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Toplam Görüntülenme</h3>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    CTR: {dashboardStats.ctr}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Bekleyen Yorumlar</h3>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.pendingReviews}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.totalReviews} toplam yorum
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Blog Yazıları</h3>
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.publishedBlogs}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.totalBlogPosts} toplam yazı
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Günlük Görüntülenme</h3>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyPageViews || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Cihaz Dağılımı</h3>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deviceStats || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(deviceStats || []). map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold">En Çok Görüntülenen Sayfalar</h3>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topPages || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="path" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Site Management - Now using dedicated feature */}
        {activeTab === 'manage' && <SiteManagementContainer />}
        
        {/* Other tabs */}
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
      </div>
    </AdminLayout>
  );
}
