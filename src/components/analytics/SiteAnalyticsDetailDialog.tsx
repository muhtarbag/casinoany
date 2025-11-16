import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSiteDetailAnalytics } from '@/hooks/queries/useAnalyticsQueries';
import { LoadingState } from '@/components/ui/loading-state';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, DollarSign, MousePointer } from 'lucide-react';
import { useState } from 'react';

interface SiteAnalyticsDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string | null;
  siteName: string;
  logoUrl: string | null;
  rating: number | null;
  dateRange: { start: Date; end: Date };
}

export function SiteAnalyticsDetailDialog({
  open,
  onOpenChange,
  siteId,
  siteName,
  logoUrl,
  rating,
  dateRange,
}: SiteAnalyticsDetailDialogProps) {
  const [activeFilter, setActiveFilter] = useState('30d');
  const { data: analytics, isLoading } = useSiteDetailAnalytics(siteId, dateRange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={siteName}
                className="w-10 h-10 rounded-lg object-contain bg-muted p-1"
              />
            )}
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                {siteName}
                {rating && (
                  <Badge variant="secondary" className="text-xs">
                    ⭐ {rating}
                  </Badge>
                )}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Son 30 günlük performans analizi
              </p>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <LoadingState variant="skeleton" rows={4} />
        ) : !analytics ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Veri bulunamadı</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Date Range Filter */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tarih Aralığı Filtresi:</span>
              <div className="flex gap-2 ml-auto">
                {['7d', '30d', '90d'].map((filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter === '7d' && 'Son 7 Gün'}
                    {filter === '30d' && '30 Gün'}
                    {filter === '90d' && '90 Gün'}
                  </Button>
                ))}
              </div>
              <Badge className="ml-2">
                30 gün gösteriliyor
              </Badge>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MousePointer className="w-4 h-4" />
                    Toplam Görüntülenme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{analytics.totalViews}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ort: {Math.floor(analytics.totalViews / 30)}/gün
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MousePointer className="w-4 h-4" />
                    Toplam Tıklama
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{analytics.totalClicks}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ort: {Math.floor(analytics.totalClicks / 30)}/gün
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Affiliate Tıklama
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{analytics.totalConversions}</p>
                  <p className="text-xs text-success mt-1">
                    ↗ Yükseliş
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Toplam Gelir
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-success">
                    ${analytics.totalRevenue.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ort: ${(analytics.totalRevenue / 30).toFixed(2)}/gün
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for Different Views */}
            <Tabs defaultValue="trends" className="space-y-4">
              <TabsList>
                <TabsTrigger value="trends">📈 Görüntülenme ve Tıklama Trendi</TabsTrigger>
                <TabsTrigger value="revenue">💰 Affiliate Performans ve Gelir</TabsTrigger>
              </TabsList>

              <TabsContent value="trends">
                <Card>
                  <CardHeader>
                    <CardTitle>Görüntülenme ve Tıklama Trendi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="views" 
                          stroke="hsl(var(--primary))" 
                          name="Görüntülenme"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="clicks" 
                          stroke="hsl(var(--secondary))" 
                          name="Tıklama"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="revenue">
                <Card>
                  <CardHeader>
                    <CardTitle>Affiliate Performans ve Gelir</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="clicks" 
                          stroke="hsl(var(--chart-1))" 
                          name="Affiliate Tıklama"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="hsl(var(--success))" 
                          name="Gelir ($)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
