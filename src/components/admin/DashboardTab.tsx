import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Eye, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Globe, 
  Settings, 
  MousePointer, 
  DollarSign, 
  Target,
  Clock,
  Activity,
  Plus,
  ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardWidgetGrid } from '@/components/dashboard/DashboardWidgetGrid';
import { WidgetCustomizer } from '@/components/dashboard/WidgetCustomizer';
import { SitePerformanceCards } from '@/components/dashboard/SitePerformanceCards';
import { MetricCard } from './dashboard/MetricCard';
import { QuickActionsBar } from './dashboard/QuickActionsBar';
import { SmartSuggestions } from './dashboard/SmartSuggestions';
import { TopPagesTable } from './dashboard/TopPagesTable';
import { DeviceDistribution } from './dashboard/DeviceDistribution';
import { TrendChart } from './dashboard/TrendChart';
import { WeeklyComparisonTable } from './dashboard/WeeklyComparisonTable';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer
} from '@/components/LazyChart';

interface DashboardStats {
  totalSites: number;
  activeSites: number;
  totalViews: number;
  totalClicks: number;
  ctr: string;
  pendingReviews: number;
  totalReviews: number;
  publishedBlogs: number;
  totalBlogPosts: number;
  totalRevenue: number;
}

interface DashboardTabProps {
  dashboardStats: DashboardStats;
  dailyPageViews: any[];
  deviceStats: any[];
  topPages: any[];
  weeklyComparison?: any[];
  monthlyTrend?: any[];
  customMetrics?: any;
  onNavigate?: (tab: string) => void;
}

export function DashboardTab({ 
  dashboardStats, 
  dailyPageViews, 
  deviceStats, 
  topPages,
  weeklyComparison = [],
  monthlyTrend = [],
  customMetrics = { avgResponseTime: 187, peakTrafficHour: '14:00', conversionRate: 16.2, bounceRate: 45.3 },
  onNavigate 
}: DashboardTabProps) {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [chartsOpen, setChartsOpen] = useState(false);

  const totalTrend = monthlyTrend.length > 1 
    ? ((monthlyTrend[monthlyTrend.length - 1]?.value - monthlyTrend[0]?.value) / monthlyTrend[0]?.value * 100).toFixed(1)
    : '0';

  // Smart suggestions based on data
  const suggestions = useMemo(() => {
    const items = [];
    if (dashboardStats.pendingReviews > 5) {
      items.push({
        id: 'pending-reviews',
        message: `${dashboardStats.pendingReviews} yorum onay bekliyor. Kullanıcı deneyimi için hızlı aksiyon önerilir.`,
        action: () => onNavigate?.('yorumlar'),
        actionLabel: 'İncele',
        priority: 'high' as const
      });
    }
    if (dashboardStats.activeSites < dashboardStats.totalSites * 0.7) {
      items.push({
        id: 'inactive-sites',
        message: `${dashboardStats.totalSites - dashboardStats.activeSites} site inaktif. Aktif hale getirmek ister misin?`,
        action: () => onNavigate?.('manage'),
        actionLabel: 'Site Yönetimi',
        priority: 'medium' as const
      });
    }
    if (parseFloat(dashboardStats.ctr) < 2) {
      items.push({
        id: 'low-ctr',
        message: 'CTR ortalamanız düşük. Bonus kampanyalarını gözden geçirin.',
        action: () => onNavigate?.('bonus'),
        actionLabel: 'Bonuslar',
        priority: 'medium' as const
      });
    }
    return items;
  }, [dashboardStats, onNavigate]);

  const quickActions = useMemo(() => [
    {
      id: 'create-site',
      label: 'Yeni Site Ekle',
      icon: Plus,
      onClick: () => onNavigate?.('manage'),
      variant: 'primary' as const
    },
    {
      id: 'approve-reviews',
      label: 'Yorumları Onayla',
      icon: ThumbsUp,
      onClick: () => onNavigate?.('yorumlar'),
      variant: dashboardStats.pendingReviews > 0 ? 'warning' as const : 'default' as const
    },
    {
      id: 'create-blog',
      label: 'Blog Yaz',
      icon: FileText,
      onClick: () => onNavigate?.('blog'),
      variant: 'default' as const
    },
    {
      id: 'analytics',
      label: 'Analiz Görüntüle',
      icon: Activity,
      onClick: () => onNavigate?.('analytics'),
      variant: 'default' as const
    }
  ], [dashboardStats.pendingReviews, onNavigate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Genel Bakış</h2>
          <p className="text-muted-foreground">Sistem özeti ve performans metrikleri</p>
        </div>
        <Button variant="outline" onClick={() => setShowCustomizer(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Widget'ları Düzenle
        </Button>
      </div>

      {/* Smart Suggestions */}
      <SmartSuggestions suggestions={suggestions} />

      {/* 🔥 HERO METRICS (3 Kritik Metrik) */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          variant="hero"
          title="Toplam Gelir"
          value={`₺${dashboardStats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-success"
          borderColor="border-l-success"
          trend={{
            value: totalTrend,
            isPositive: parseFloat(totalTrend) > 0
          }}
          subtitle="Aylık tahmini"
          onClick={() => onNavigate?.('affiliate')}
        />
        <MetricCard
          variant="hero"
          title="Aktif Siteler"
          value={`${dashboardStats.activeSites}/${dashboardStats.totalSites}`}
          icon={Globe}
          iconColor="text-primary"
          borderColor="border-l-primary"
          subtitle="Online bahis siteleri"
          onClick={() => onNavigate?.('manage')}
        />
        <MetricCard
          variant="hero"
          title="Bekleyen İşlemler"
          value={dashboardStats.pendingReviews}
          icon={MessageSquare}
          iconColor="text-warning"
          borderColor="border-l-warning"
          subtitle="Onay bekleyen yorumlar"
          onClick={() => onNavigate?.('yorumlar')}
        />
      </div>

      {/* ⚡ QUICK ACTIONS BAR */}
      <QuickActionsBar actions={quickActions} />

      {/* 📊 SECONDARY METRICS (7 Compact Cards) */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          variant="compact"
          title="Toplam Görüntüleme"
          value={dashboardStats.totalViews.toLocaleString()}
          icon={Eye}
          iconColor="text-chart-1"
          borderColor="border-l-chart-1"
          onClick={() => onNavigate?.('analytics')}
        />
        <MetricCard
          variant="compact"
          title="Toplam Tıklama"
          value={dashboardStats.totalClicks.toLocaleString()}
          icon={MousePointer}
          iconColor="text-chart-2"
          borderColor="border-l-chart-2"
          onClick={() => onNavigate?.('analytics')}
        />
        <MetricCard
          variant="compact"
          title="CTR"
          value={`%${dashboardStats.ctr}`}
          icon={Target}
          iconColor="text-chart-3"
          borderColor="border-l-chart-3"
        />
        <MetricCard
          variant="compact"
          title="Blog Yazısı"
          value={dashboardStats.totalBlogPosts}
          icon={FileText}
          iconColor="text-chart-4"
          borderColor="border-l-chart-4"
          subtitle={`${dashboardStats.publishedBlogs} yayında`}
          onClick={() => onNavigate?.('blog')}
        />
        <MetricCard
          variant="compact"
          title="Yorumlar"
          value={dashboardStats.totalReviews}
          icon={MessageSquare}
          iconColor="text-chart-5"
          borderColor="border-l-chart-5"
          subtitle={`${dashboardStats.pendingReviews} onay bekliyor`}
          onClick={() => onNavigate?.('yorumlar')}
        />
        <MetricCard
          variant="compact"
          title="Ort. Yanıt Süresi"
          value={`${customMetrics.avgResponseTime}ms`}
          icon={Clock}
          iconColor="text-primary"
          borderColor="border-l-primary"
        />
        <MetricCard
          variant="compact"
          title="Dönüşüm Oranı"
          value={`%${customMetrics.conversionRate}`}
          icon={TrendingUp}
          iconColor="text-success"
          borderColor="border-l-success"
        />
      </div>

      {/* 📈 CHARTS & TRENDS (Collapsible) */}
      <Collapsible open={chartsOpen} onOpenChange={setChartsOpen}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Detaylı Analizler ve Grafikler</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              {chartsOpen ? 'Gizle' : 'Göster'}
              <ChevronDown className={`h-4 w-4 transition-transform ${chartsOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-6 mt-4">
          {/* Performans Kartları */}
          <SitePerformanceCards />

          {/* Analytics Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Günlük Görüntülemeler */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Günlük Görüntülemeler
                </CardTitle>
                <CardDescription>Son 7 gün</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dailyPageViews || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '11px' }}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-1))', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cihaz Dağılımı */}
            <DeviceDistribution data={deviceStats || []} />
          </div>

          {/* Bottom Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TopPagesTable data={topPages || []} />
            {monthlyTrend && monthlyTrend.length > 0 && (
              <TrendChart 
                data={monthlyTrend} 
                title="Aylık Trend"
                lines={[{ dataKey: 'value', stroke: 'hsl(var(--chart-1))', name: 'Değer' }]}
              />
            )}
            {weeklyComparison && weeklyComparison.length > 0 && (
              <WeeklyComparisonTable data={weeklyComparison} />
            )}
          </div>

          {/* Widget Grid */}
          <DashboardWidgetGrid />
        </CollapsibleContent>
      </Collapsible>

      {/* Widget Customizer */}
      <WidgetCustomizer 
        open={showCustomizer} 
        onOpenChange={setShowCustomizer} 
      />
    </div>
  );
}
