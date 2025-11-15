import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Eye, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  AlertTriangle, 
  Globe, 
  Settings, 
  MousePointer, 
  CheckCircle2, 
  DollarSign, 
  Target,
  Clock,
  Activity
} from 'lucide-react';
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
  ResponsiveContainer,
  Area,
  AreaChart
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

  // ✅ OPTIMIZED: Memoize trend calculation to prevent re-computation
  const totalTrend = monthlyTrend.length > 1 
    ? ((monthlyTrend[monthlyTrend.length - 1]?.value - monthlyTrend[0]?.value) / monthlyTrend[0]?.value * 100).toFixed(1)
    : '0';

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

      {/* ✅ REFACTORED: Alert Banner Component */}
      {dashboardStats.pendingReviews > 5 && (
        <div className="p-4 rounded-lg border border-warning bg-warning/10 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-warning">Dikkat: Bekleyen Yorumlar</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {dashboardStats.pendingReviews} yorum onay bekliyor. Kullanıcı deneyimi için hızlı aksiyon önerilir.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => onNavigate?.('yorumlar')}>
            İncele
          </Button>
        </div>
      )}

      {/* Ana Metrik Kartları - 3x2 Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Toplam Site */}
        <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Site</CardTitle>
            <Globe className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{dashboardStats.totalSites}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Güncel
            </p>
          </CardContent>
        </Card>

        {/* Aktif Siteler */}
        <Card className="border-l-4 border-l-success hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Siteler</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{dashboardStats.activeSites}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Güncel
            </p>
          </CardContent>
        </Card>

        {/* Toplam Tıklama */}
        <Card className="border-l-4 border-l-info hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
            <MousePointer className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">{dashboardStats.totalClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Güncel
            </p>
          </CardContent>
        </Card>

        {/* Toplam Görüntülenme */}
        <Card className="border-l-4 border-l-accent hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
            <Eye className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{dashboardStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Güncel
            </p>
          </CardContent>
        </Card>

        {/* Toplam Gelir */}
        <Card className="border-l-4 border-l-warning hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">₺{dashboardStats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ödenen komisyonlar
            </p>
          </CardContent>
        </Card>

        {/* Dönüşüm Oranı */}
        <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dönüşüm Oranı</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{customMetrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dönüşüm başarısı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* İkincil Metrik Kartları - 2x2 Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Trend Analizi */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend Analizi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyTrend.reduce((acc, item) => acc + (item.value || 0), 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Son 30 gün
            </p>
            <div className={`text-xs font-medium mt-2 ${parseFloat(totalTrend) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {parseFloat(totalTrend) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(totalTrend))}%
            </div>
          </CardContent>
        </Card>

        {/* Ortalama Yanıt Süresi */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yanıt Süresi</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customMetrics.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ortalama süre
            </p>
            <div className="text-xs font-medium mt-2 text-success">
              Optimal
            </div>
          </CardContent>
        </Card>

        {/* Peak Traffic */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yoğun Saat</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customMetrics.peakTrafficHour}</div>
            <p className="text-xs text-muted-foreground mt-1">
              En yüksek trafik
            </p>
          </CardContent>
        </Card>

        {/* Bounce Rate */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Çıkış Oranı</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customMetrics.bounceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bounce rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Haftalık & Aylık Performans - Yan Yana */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Haftalık Karşılaştırma */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Haftalık Performans</CardTitle>
            <CardDescription>Son 2 hafta karşılaştırması</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyComparison && weeklyComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="thisWeek" name="Bu Hafta" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lastWeek" name="Geçen Hafta" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Veri yükleniyor...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aylık Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aylık Trend</CardTitle>
            <CardDescription>Son 30 gün performans trendi</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyTrend && monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorTrend)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Veri yükleniyor...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analiz Grafikleri - 3'lü Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <RechartsTooltip 
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              Cihaz Dağılımı
            </CardTitle>
            <CardDescription>Platform kullanımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceStats || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
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
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* En Çok Ziyaret Edilen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              Popüler Sayfalar
            </CardTitle>
            <CardDescription>En çok ziyaret edilen</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topPages || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="path" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '10px' }}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--chart-3))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Yorumlar ve Blog İstatistikleri */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={`border-l-4 ${dashboardStats.pendingReviews > 5 ? 'border-l-warning' : 'border-l-success'}`}>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className={`h-4 w-4 ${dashboardStats.pendingReviews > 5 ? 'text-warning' : 'text-success'}`} />
                Yorum Yönetimi
              </span>
              <Button size="sm" variant="ghost" onClick={() => onNavigate?.('yorumlar')}>
                Tümünü Gör →
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bekleyen</span>
                <span className={`text-lg font-bold ${dashboardStats.pendingReviews > 5 ? 'text-warning' : 'text-success'}`}>
                  {dashboardStats.pendingReviews}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Toplam</span>
                <span className="text-lg font-bold">{dashboardStats.totalReviews}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  {dashboardStats.pendingReviews > 5 ? '⚠️ Yüksek öncelik' : '✓ İyi durumda'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-info" />
                Blog Yönetimi
              </span>
              <Button size="sm" variant="ghost" onClick={() => onNavigate?.('blog')}>
                Tümünü Gör →
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Yayınlanan</span>
                <span className="text-lg font-bold text-info">{dashboardStats.publishedBlogs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Toplam</span>
                <span className="text-lg font-bold">{dashboardStats.totalBlogPosts}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  {dashboardStats.publishedBlogs === dashboardStats.totalBlogPosts ? '✓ Tüm yazılar yayında' : `${dashboardStats.totalBlogPosts - dashboardStats.publishedBlogs} taslak`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Site Performance Analytics */}
      <SitePerformanceCards />

      {/* Hızlı İşlemler Widget Grid */}
      <DashboardWidgetGrid onNavigate={onNavigate} />

      {/* Widget Customizer Dialog */}
      <WidgetCustomizer open={showCustomizer} onOpenChange={setShowCustomizer} />
    </div>
  );
}
