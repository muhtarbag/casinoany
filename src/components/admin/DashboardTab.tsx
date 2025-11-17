import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, FileText, MessageSquare, MousePointerClick, FolderOpen } from 'lucide-react';

interface DashboardStats {
  totalSites: number;
  totalReviews: number;
  totalBlogPosts: number;
  totalComments: number;
  totalClicks: number;
}

interface DashboardTabProps {
  dashboardStats: DashboardStats;
  onNavigate?: (tab: string) => void;
}

/**
 * SIMPLIFIED DASHBOARD - Analytics Removed for Performance
 */
export function DashboardTab({ 
  dashboardStats,
  onNavigate 
}: DashboardTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Genel Bakış</h2>
        <p className="text-muted-foreground">Sistem özeti ve kritik metrikler</p>
      </div>

      {/* Critical Metrics Only */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate?.('manage')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Toplam Siteler</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalSites}</div>
            <p className="text-xs text-muted-foreground">Bahis siteleri</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate?.('yorumlar')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Toplam Yorumlar</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">Onaylanmış yorumlar</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate?.('blog')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Blog Yazıları</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalBlogPosts}</div>
            <p className="text-xs text-muted-foreground">Yayınlanmış içerik</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Blog Yorumları</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalComments}</div>
            <p className="text-xs text-muted-foreground">Tüm yorumlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Affiliate Tıklamalar</CardTitle>
            <MousePointerClick className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">Toplam tıklamalar</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate?.('content/categories')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hızlı Erişim</CardTitle>
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Kategori yönetimi</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Notice */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            ✅ Detaylı analytics performans optimizasyonu için devre dışı bırakıldı. 
            Sadece kritik metrikler gösteriliyor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
