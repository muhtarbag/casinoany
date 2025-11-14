import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSiteDetailedAnalytics } from '@/hooks/useSiteDetailedAnalytics';
import { useDataExport } from '@/hooks/useDataExport';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Eye, MousePointerClick, Target, DollarSign, CalendarIcon, RotateCcw, Download, X } from 'lucide-react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';

interface SiteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string | null;
  siteName: string;
  logoUrl: string | null;
  rating: number | null;
}

export function SiteDetailDialog({
  open,
  onOpenChange,
  siteId,
  siteName,
  logoUrl,
  rating,
}: SiteDetailDialogProps) {
  const { data: metrics, isLoading } = useSiteDetailedAnalytics(siteId);
  const { exportData, isExporting } = useDataExport();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Filter metrics based on date range
  const filteredMetrics = useMemo(() => {
    if (!metrics) return [];
    if (!dateRange.from || !dateRange.to) return metrics;

    return metrics.filter(metric => {
      const metricDate = parseISO(metric.date);
      return isWithinInterval(metricDate, { start: dateRange.from!, end: dateRange.to! });
    });
  }, [metrics, dateRange]);

  // Format data for display
  const displayMetrics = useMemo(() => {
    return filteredMetrics.map(m => ({
      ...m,
      displayDate: format(parseISO(m.date), 'dd MMM', { locale: tr }),
    }));
  }, [filteredMetrics]);

  const calculateTotal = (key: 'views' | 'clicks' | 'affiliateClicks' | 'revenue') => {
    if (!filteredMetrics) return 0;
    return filteredMetrics.reduce((sum, m) => sum + m[key], 0);
  };

  const calculateAverage = (key: 'views' | 'clicks' | 'affiliateClicks' | 'revenue') => {
    if (!filteredMetrics || filteredMetrics.length === 0) return 0;
    return calculateTotal(key) / filteredMetrics.length;
  };

  const resetFilters = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const handleExport = async (type: 'views' | 'clicks' | 'all') => {
    let data: any[] = [];
    let filename = '';

    if (type === 'all') {
      data = displayMetrics.map(m => ({
        tarih: m.displayDate,
        goruntulenme: m.views,
        tiklama: m.clicks,
        affiliate_tiklama: m.affiliateClicks,
        gelir: m.revenue,
      }));
      filename = `${siteName.replace(/\s+/g, '-')}-tum-veriler`;
    } else if (type === 'views') {
      data = displayMetrics.map(m => ({ tarih: m.displayDate, goruntulenme: m.views }));
      filename = `${siteName.replace(/\s+/g, '-')}-goruntulenme`;
    } else {
      data = displayMetrics.map(m => ({ tarih: m.displayDate, tiklama: m.clicks }));
      filename = `${siteName.replace(/\s+/g, '-')}-tiklama`;
    }

    await exportData({
      format: 'csv',
      filename: `${filename}-${format(new Date(), 'yyyy-MM-dd')}`,
      data,
    });
  };

  const hasActiveFilter = dateRange.from || dateRange.to;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-10">
          <div className="flex flex-wrap items-start gap-3 justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar className="h-12 w-12 border-2 border-background shadow-sm shrink-0">
                <AvatarImage src={logoUrl || ''} alt={siteName} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {siteName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-2xl truncate">{siteName}</DialogTitle>
                <DialogDescription className="mt-1">Son 30 günlük detaylı performans analizi</DialogDescription>
              </div>
            </div>
            {rating && (
              <Badge variant="outline" className="shrink-0 mt-1">
                ⭐ {rating.toFixed(1)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        ) : metrics ? (
          <div className="space-y-6">
            {/* Date Range Filter */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm font-medium mb-2">Tarih Aralığı Filtresi</p>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'justify-start text-left font-normal',
                              !dateRange.from && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from ? format(dateRange.from, 'dd MMM yyyy', { locale: tr }) : 'Başlangıç'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <span className="flex items-center text-muted-foreground">-</span>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'justify-start text-left font-normal',
                              !dateRange.to && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.to ? format(dateRange.to, 'dd MMM yyyy', { locale: tr }) : 'Bitiş'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                            disabled={(date) => date > new Date() || (dateRange.from ? date < dateRange.from : false)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {hasActiveFilter && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Filtreyi Temizle
                    </Button>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    <Badge variant="secondary">
                      {filteredMetrics.length} gün gösteriliyor
                    </Badge>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExport('views')}
                        disabled={isExporting || displayMetrics.length === 0}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Görüntülenme
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExport('clicks')}
                        disabled={isExporting || displayMetrics.length === 0}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Tıklama
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExport('all')}
                        disabled={isExporting || displayMetrics.length === 0}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Tümü
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Toplam Görüntüleme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateTotal('views').toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ort: {calculateAverage('views').toFixed(0)}/gün
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4" />
                    Toplam Tıklama
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateTotal('clicks').toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ort: {calculateAverage('clicks').toFixed(0)}/gün
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Affiliate Tıklama
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {calculateTotal('affiliateClicks').toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ort: {calculateAverage('affiliateClicks').toFixed(0)}/gün
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Toplam Gelir
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    ${calculateTotal('revenue').toFixed(0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ort: ${calculateAverage('revenue').toFixed(0)}/gün
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Views & Clicks Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Görüntülenme ve Tıklama Trendi</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={displayMetrics}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="displayDate" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="views"
                      name="Görüntüleme"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      name="Tıklama"
                      stroke="hsl(var(--accent))"
                      fillOpacity={1}
                      fill="url(#colorClicks)"
                    />
                    <Brush 
                      dataKey="displayDate" 
                      height={30} 
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--muted))"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Affiliate & Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Performans ve Gelir</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={displayMetrics}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="displayDate" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="affiliateClicks"
                      name="Affiliate Tıklama"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-1))' }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      name="Gelir ($)"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))' }}
                    />
                    <Brush 
                      dataKey="displayDate" 
                      height={30} 
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--muted))"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Veri bulunamadı</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
