import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, TrendingUp, MessageSquare, FileText, AlertTriangle, Globe, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardWidgetGrid } from '@/components/dashboard/DashboardWidgetGrid';
import { WidgetCustomizer } from '@/components/dashboard/WidgetCustomizer';
import { SitePerformanceCards } from '@/components/dashboard/SitePerformanceCards';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  Legend, 
  ResponsiveContainer 
} from 'recharts';

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
}

interface DashboardTabProps {
  dashboardStats: DashboardStats;
  dailyPageViews: any[];
  deviceStats: any[];
  topPages: any[];
  onNavigate?: (tab: string) => void;
}

export function DashboardTab({ 
  dashboardStats, 
  dailyPageViews, 
  deviceStats, 
  topPages,
  onNavigate 
}: DashboardTabProps) {
  const [showCustomizer, setShowCustomizer] = useState(false);

  return (
    <div className="space-y-6">
      {/* Widget Customizer Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Genel sistem özeti ve istatistikler</p>
        </div>
        <Button variant="outline" onClick={() => setShowCustomizer(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Widget'ları Düzenle
        </Button>
      </div>

      {/* Stats Cards with Priority Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Site</CardTitle>
            <Globe className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{dashboardStats.totalSites}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.activeSites} aktif site
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görüntüleme</CardTitle>
            <Eye className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{dashboardStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">CTR: {dashboardStats.ctr}%</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${dashboardStats.pendingReviews > 5 ? 'border-l-warning' : 'border-l-success'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Yorumlar</CardTitle>
            <MessageSquare className={`h-4 w-4 ${dashboardStats.pendingReviews > 5 ? 'text-warning' : 'text-success'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboardStats.pendingReviews > 5 ? 'text-warning' : 'text-success'}`}>
              {dashboardStats.pendingReviews}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.pendingReviews > 5 ? '⚠️ Yüksek öncelik' : '✓ İyi durumda'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Yazıları</CardTitle>
            <FileText className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{dashboardStats.publishedBlogs}</div>
            <p className="text-xs text-muted-foreground">{dashboardStats.totalBlogPosts} toplam yazı</p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Alert Banner */}
      {dashboardStats.pendingReviews > 5 && (
        <div className="p-4 rounded-lg border border-warning bg-warning/10 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <h3 className="font-semibold text-warning">Dikkat: Bekleyen Yorumlar</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {dashboardStats.pendingReviews} yorum onay bekliyor. Kullanıcı deneyimi için hızlı aksiyon önerilir.
            </p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Daily Page Views */}
        <Card className="border-t-2 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Günlük Görüntülemeler
            </CardTitle>
            <CardDescription>Son 7 gün trendi</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyPageViews || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Stats */}
        <Card className="border-t-2 border-t-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              Cihaz Dağılımı
            </CardTitle>
            <CardDescription>Platform bazlı kullanım</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceStats || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(deviceStats || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={[
                        'hsl(var(--chart-1))', 
                        'hsl(var(--chart-4))', 
                        'hsl(var(--chart-3))'
                      ][index % 3]} 
                    />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="border-t-2 border-t-success">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              En Çok Ziyaret Edilen
            </CardTitle>
            <CardDescription>Popüler içerikler</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPages || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="path" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--chart-3))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Site Performance Analytics */}
      <SitePerformanceCards />

      {/* Widget Grid */}
      <DashboardWidgetGrid onNavigate={onNavigate} />

      {/* Widget Customizer Dialog */}
      <WidgetCustomizer open={showCustomizer} onOpenChange={setShowCustomizer} />
    </div>
  );
}
