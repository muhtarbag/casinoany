import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Eye, 
  MousePointerClick, 
  Heart, 
  MessageSquare,
  Star,
  Users,
  AlertTriangle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SitePerformanceChart } from './dashboard/SitePerformanceChart';
import { SiteMetricsGrid } from './dashboard/SiteMetricsGrid';
import { SiteActivityTimeline } from './dashboard/SiteActivityTimeline';
import { SiteComparisonCard } from './dashboard/SiteComparisonCard';
import { QuickActionsToolbar } from './dashboard/QuickActionsToolbar';
import { CriticalAlerts } from './dashboard/CriticalAlerts';
import { ActionableKPICard } from './dashboard/ActionableKPICard';
import { DashboardFilters, FilterState } from './filters/DashboardFilters';
import { ExportDialog } from './filters/ExportDialog';
import { ActivityFeed } from './notifications/ActivityFeed';
import { useSavedFilters } from '@/hooks/useSavedFilters';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useIsMobile } from '@/hooks/use-mobile';

import { SiteData, SiteWithStats } from '@/types/site';

interface SiteOwnerDashboardProps {
  siteId: string;
  siteName: string;
  siteData: SiteWithStats;
  onNavigate?: (tab: string) => void;
}

export const SiteOwnerDashboard = ({ siteId, siteName, siteData, onNavigate }: SiteOwnerDashboardProps) => {
  const isMobile = useIsMobile();
  const { savedFilters, saveFilter } = useSavedFilters();
  const [activeFilters, setActiveFilters] = useState<FilterState>({});

  // Enable real-time notifications
  useRealtimeNotifications({ siteId, enabled: true });

  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  // Fetch detailed analytics
  const { data: analytics } = useQuery({
    queryKey: ['site-analytics', siteId],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: dailyStats, error } = await supabase
        .from('page_views')
        .select('created_at, page_path, session_id, user_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .ilike('page_path', `%${siteData.slug}%`);

      if (error) throw error;

      const dailyData: Record<string, { views: number; sessions: Set<string>; users: Set<string> }> = {};
      
      dailyStats?.forEach(stat => {
        const date = new Date(stat.created_at).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { views: 0, sessions: new Set(), users: new Set() };
        }
        dailyData[date].views++;
        if (stat.session_id) dailyData[date].sessions.add(stat.session_id);
        if (stat.user_id) dailyData[date].users.add(stat.user_id);
      });

      const chartData = Object.entries(dailyData).map(([date, data]) => ({
        date,
        views: data.views,
        sessions: data.sessions.size,
        users: data.users.size,
      })).sort((a, b) => a.date.localeCompare(b.date));

      return chartData;
    },
    enabled: !!siteId && !!siteData?.slug,
  });

  // Calculate period comparisons
  const { data: comparison } = useQuery({
    queryKey: ['site-comparison', siteId],
    queryFn: async () => {
      const now = new Date();
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - 7);
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);

      const { count: thisWeekViews } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisWeekStart.toISOString())
        .ilike('page_path', `%${siteData.slug}%`);

      const { count: lastWeekViews } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastWeekStart.toISOString())
        .lt('created_at', thisWeekStart.toISOString())
        .ilike('page_path', `%${siteData.slug}%`);

      const { count: thisWeekConversions } = await supabase
        .from('conversions')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', siteId)
        .gte('created_at', thisWeekStart.toISOString());

      const { count: lastWeekConversions } = await supabase
        .from('conversions')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', siteId)
        .gte('created_at', lastWeekStart.toISOString())
        .lt('created_at', thisWeekStart.toISOString());

      const viewsChange = lastWeekViews && lastWeekViews > 0
        ? ((thisWeekViews || 0) - lastWeekViews) / lastWeekViews * 100
        : 0;

      const conversionsChange = lastWeekConversions && lastWeekConversions > 0
        ? ((thisWeekConversions || 0) - lastWeekConversions) / lastWeekConversions * 100
        : 0;

      return {
        thisWeek: { views: thisWeekViews || 0, conversions: thisWeekConversions || 0 },
        lastWeek: { views: lastWeekViews || 0, conversions: lastWeekConversions || 0 },
        changes: { views: viewsChange, conversions: conversionsChange }
      };
    },
    enabled: !!siteId && !!siteData?.slug,
  });

  // Fetch recent activity
  const { data: activity } = useQuery({
    queryKey: ['site-activity', siteId],
    queryFn: async () => {
      const [reviewsResult, complaintsResult] = await Promise.all([
        supabase
          .from('site_reviews')
          .select('id, rating, comment, created_at')
          .eq('site_id', siteId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('site_complaints')
          .select('id, title, severity, status, created_at')
          .eq('site_id', siteId)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      return {
        reviews: reviewsResult.data || [],
        complaints: complaintsResult.data || []
      };
    },
    enabled: !!siteId,
  });

  // Generate critical alerts based on data
  const criticalAlerts = useMemo(() => {
    const alerts = [];

    // Unanswered complaints
    const unansweredComplaints = activity?.complaints?.filter(c => c.status === 'pending').length || 0;
    if (unansweredComplaints > 0) {
      alerts.push({
        id: 'unanswered-complaints',
        type: 'error' as const,
        title: `${unansweredComplaints} cevaplanmamış şikayet`,
        description: 'Kullanıcı memnuniyeti için hızlı yanıt verin',
        action: 'complaints',
        actionLabel: 'Şikayetlere Git',
        priority: 10
      });
    }

    // Declining views
    if (comparison?.changes?.views != null && comparison.changes.views < -15) {
      alerts.push({
        id: 'declining-views',
        type: 'warning' as const,
        title: `Görüntülenme %${Math.abs(comparison.changes.views).toFixed(0)} düştü`,
        description: 'İçerik güncellemesi veya SEO optimizasyonu yapın',
        action: 'content',
        actionLabel: 'İçerik Güncelle',
        priority: 8
      });
    }

    // Low rating
    const avgRating = siteData?.avg_rating ?? 0;
    if (avgRating > 0 && avgRating < 3) {
      alerts.push({
        id: 'low-rating',
        type: 'warning' as const,
        title: 'Düşük ortalama puan',
        description: `Mevcut puan: ${Number(avgRating).toFixed(1)}. Kullanıcı deneyimini iyileştirin`,
        action: 'feedback',
        actionLabel: 'Geri Bildirimleri İncele',
        priority: 7
      });
    }

    // No recent activity
    const recentReviews = activity?.reviews?.filter(r => {
      const reviewDate = new Date(r.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reviewDate > weekAgo;
    }).length || 0;

    if (recentReviews === 0) {
      alerts.push({
        id: 'no-activity',
        type: 'info' as const,
        title: 'Son 7 günde yeni değerlendirme yok',
        description: 'Kullanıcı etkileşimini artırın',
        action: 'site-info',
        actionLabel: 'Site Bilgilerini Görüntüle',
        priority: 5
      });
    }

    return alerts;
  }, [activity, comparison, siteData]);

  const handleQuickAction = (action: string) => {
    if (onNavigate) {
      onNavigate(action);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{siteName}</h1>
          <p className="text-muted-foreground">Site performansınızı takip edin ve yönetin</p>
        </div>
        <ExportDialog siteId={siteId} siteName={siteName} />
      </div>

      {/* Filters */}
      <DashboardFilters
        onFilterChange={handleFilterChange}
        onSaveFilter={saveFilter}
        savedFilters={savedFilters}
      />

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <CriticalAlerts 
          alerts={criticalAlerts}
          onActionClick={handleQuickAction}
        />
      )}

      {/* Quick Actions Toolbar */}
      <QuickActionsToolbar onAction={handleQuickAction} />

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ActionableKPICard
          title="Toplam Görüntülenme"
          value={siteData?.stats?.views || 0}
          icon={Eye}
          trend={comparison ? {
            value: Math.abs(Math.round(comparison.changes.views)),
            isPositive: comparison.changes.views >= 0,
            label: 'Son 7 günde'
          } : undefined}
          action={{
            label: 'Detayları Gör',
            onClick: () => handleQuickAction('reports')
          }}
          variant={comparison?.changes.views && comparison.changes.views < -15 ? 'warning' : 'default'}
          insight={comparison?.changes.views && comparison.changes.views < -15 
            ? 'İçerik güncellemesi önerilir' 
            : undefined}
        />

        <ActionableKPICard
          title="Tıklanma"
          value={siteData?.stats?.clicks || 0}
          icon={MousePointerClick}
          action={{
            label: 'Dönüşümleri Analiz Et',
            onClick: () => handleQuickAction('reports')
          }}
          variant="default"
        />

        <ActionableKPICard
          title="Favoriler"
          value={siteData?.favoriteCount || 0}
          icon={Heart}
          variant="success"
          insight="Kullanıcı ilgisi yüksek"
        />

        <ActionableKPICard
          title="Şikayetler"
          value={siteData?.complaintsCount || 0}
          icon={MessageSquare}
          action={siteData?.complaintsCount > 0 ? {
            label: 'Şikayetleri Görüntüle',
            onClick: () => handleQuickAction('complaints')
          } : undefined}
          variant={siteData?.complaintsCount > 5 ? 'destructive' : 'default'}
          insight={activity?.complaints?.filter((c: any) => c.status === 'pending').length > 0 
            ? `${activity.complaints.filter((c: any) => c.status === 'pending').length} bekleyen yanıt` 
            : undefined}
        />

        <ActionableKPICard
          title="Ortalama Puan"
          value={siteData?.avg_rating ? siteData.avg_rating.toFixed(1) : 'N/A'}
          icon={Star}
          variant={siteData?.avg_rating >= 4 ? 'success' : siteData?.avg_rating < 3 ? 'warning' : 'default'}
          action={{
            label: 'Değerlendirmeleri Gör',
            onClick: () => handleQuickAction('feedback')
          }}
        />

        <ActionableKPICard
          title="Yorum Sayısı"
          value={siteData?.review_count || 0}
          icon={MessageSquare}
          variant="default"
        />

        <ActionableKPICard
          title="Haftalık Ziyaretçi"
          value={comparison?.thisWeek.views || 0}
          icon={Users}
          trend={comparison ? {
            value: Math.abs(Math.round(comparison.changes.views)),
            isPositive: comparison.changes.views >= 0,
            label: 'Geçen haftaya göre'
          } : undefined}
          variant="default"
        />

        <ActionableKPICard
          title="Dönüşüm Oranı"
          value={comparison?.thisWeek.conversions || 0}
          icon={AlertTriangle}
          trend={comparison ? {
            value: Math.abs(Math.round(comparison.changes.conversions)),
            isPositive: comparison.changes.conversions >= 0,
            label: 'Son 7 günde'
          } : undefined}
          variant="default"
        />
      </div>

      {/* Week Comparison & Activity Feed */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
        {comparison && (
          <SiteComparisonCard comparison={comparison} />
        )}
        <ActivityFeed siteId={siteId} limit={10} />
      </div>

      {/* Detailed Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detaylı Analiz</CardTitle>
          <CardDescription>Performans metrikleri, aktiviteler ve istatistikler</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance">Performans</TabsTrigger>
              <TabsTrigger value="activity">Aktivite</TabsTrigger>
              <TabsTrigger value="metrics">Metrikler</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="mt-6">
              {analytics && <SitePerformanceChart data={analytics} />}
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              {activity && <SiteActivityTimeline activity={activity} />}
            </TabsContent>

            <TabsContent value="metrics" className="mt-6">
              <SiteMetricsGrid siteId={siteId} siteData={siteData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
