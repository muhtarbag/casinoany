import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { 
  FileDown, 
  FileSpreadsheet, 
  Calendar as CalendarIcon,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SiteReportsExportProps {
  siteId: string;
  siteName: string;
  siteData: any;
}

export const SiteReportsExport = ({ siteId, siteName, siteData }: SiteReportsExportProps) => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [reportType, setReportType] = useState<'detailed' | 'summary'>('detailed');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch report data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['site-report-data', siteId, dateRange.from, dateRange.to],
    queryFn: async () => {
      // Get page views
      const { data: views, error: viewsError } = await supabase
        .from('page_views')
        .select('created_at, session_id, user_id, device_type, browser')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .ilike('page_path', `%${siteData.slug}%`);

      if (viewsError) throw viewsError;

      // Get conversions
      const { data: conversions, error: conversionsError } = await supabase
        .from('conversions')
        .select('created_at, conversion_type, conversion_value')
        .eq('site_id', siteId)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (conversionsError) throw conversionsError;

      // Get reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('site_reviews')
        .select('created_at, rating, comment')
        .eq('site_id', siteId)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (reviewsError) throw reviewsError;

      // Get complaints
      const { data: complaints, error: complaintsError } = await supabase
        .from('site_complaints')
        .select('created_at, title, severity, status')
        .eq('site_id', siteId)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (complaintsError) throw complaintsError;

      // Process data
      const uniqueSessions = new Set(views?.map(v => v.session_id).filter(Boolean));
      const uniqueUsers = new Set(views?.map(v => v.user_id).filter(Boolean));

      const deviceBreakdown = views?.reduce((acc: any, v) => {
        acc[v.device_type || 'unknown'] = (acc[v.device_type || 'unknown'] || 0) + 1;
        return acc;
      }, {});

      const dailyStats = views?.reduce((acc: any, v) => {
        const date = new Date(v.created_at).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = { views: 0, sessions: new Set(), users: new Set() };
        acc[date].views++;
        if (v.session_id) acc[date].sessions.add(v.session_id);
        if (v.user_id) acc[date].users.add(v.user_id);
        return acc;
      }, {});

      return {
        totalViews: views?.length || 0,
        uniqueSessions: uniqueSessions.size,
        uniqueUsers: uniqueUsers.size,
        totalConversions: conversions?.length || 0,
        conversionValue: conversions?.reduce((sum, c) => sum + (c.conversion_value || 0), 0) || 0,
        totalReviews: reviews?.length || 0,
        avgRating: reviews?.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
        totalComplaints: complaints?.length || 0,
        deviceBreakdown,
        dailyStats: Object.entries(dailyStats || {}).map(([date, data]: [string, any]) => ({
          date,
          views: data.views,
          sessions: data.sessions.size,
          users: data.users.size,
        })),
        reviews,
        complaints,
        conversions,
      };
    },
    enabled: !!siteId && !!siteData?.slug,
  });

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      let csvContent = '';
      
      if (reportType === 'summary') {
        // Summary report
        csvContent = 'Metrik,Değer\n';
        csvContent += `Toplam Görüntülenme,${reportData?.totalViews || 0}\n`;
        csvContent += `Benzersiz Oturum,${reportData?.uniqueSessions || 0}\n`;
        csvContent += `Benzersiz Kullanıcı,${reportData?.uniqueUsers || 0}\n`;
        csvContent += `Toplam Dönüşüm,${reportData?.totalConversions || 0}\n`;
        csvContent += `Dönüşüm Değeri,${reportData?.conversionValue || 0}\n`;
        csvContent += `Toplam Yorum,${reportData?.totalReviews || 0}\n`;
        csvContent += `Ortalama Puan,${reportData?.avgRating?.toFixed(2) || 0}\n`;
        csvContent += `Toplam Şikayet,${reportData?.totalComplaints || 0}\n`;
      } else {
        // Detailed daily report
        csvContent = 'Tarih,Görüntülenme,Oturum,Kullanıcı\n';
        reportData?.dailyStats?.forEach((day: any) => {
          csvContent += `${day.date},${day.views},${day.sessions},${day.users}\n`;
        });
      }

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${siteName}_rapor_${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Başarılı',
        description: 'Rapor CSV formatında indirildi',
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Rapor oluşturulamadı',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      // Create HTML table that Excel can read
      let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="UTF-8"></head>
        <body>
          <table>
            <tr><th colspan="4">${siteName} - Performans Raporu</th></tr>
            <tr><th colspan="4">Tarih Aralığı: ${format(dateRange.from, 'dd/MM/yyyy', { locale: tr })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: tr })}</th></tr>
            <tr><td></td></tr>
            <tr>
              <th style="background-color: #4472C4; color: white; font-weight: bold;">Metrik</th>
              <th style="background-color: #4472C4; color: white; font-weight: bold;">Değer</th>
            </tr>
            <tr><td>Toplam Görüntülenme</td><td>${reportData?.totalViews || 0}</td></tr>
            <tr><td>Benzersiz Oturum</td><td>${reportData?.uniqueSessions || 0}</td></tr>
            <tr><td>Benzersiz Kullanıcı</td><td>${reportData?.uniqueUsers || 0}</td></tr>
            <tr><td>Toplam Dönüşüm</td><td>${reportData?.totalConversions || 0}</td></tr>
            <tr><td>Dönüşüm Değeri</td><td>${reportData?.conversionValue || 0}</td></tr>
            <tr><td>Toplam Yorum</td><td>${reportData?.totalReviews || 0}</td></tr>
            <tr><td>Ortalama Puan</td><td>${reportData?.avgRating?.toFixed(2) || 0}</td></tr>
            <tr><td>Toplam Şikayet</td><td>${reportData?.totalComplaints || 0}</td></tr>
            <tr><td></td></tr>
            <tr>
              <th style="background-color: #4472C4; color: white; font-weight: bold;">Tarih</th>
              <th style="background-color: #4472C4; color: white; font-weight: bold;">Görüntülenme</th>
              <th style="background-color: #4472C4; color: white; font-weight: bold;">Oturum</th>
              <th style="background-color: #4472C4; color: white; font-weight: bold;">Kullanıcı</th>
            </tr>
      `;

      reportData?.dailyStats?.forEach((day: any) => {
        htmlContent += `<tr><td>${day.date}</td><td>${day.views}</td><td>${day.sessions}</td><td>${day.users}</td></tr>`;
      });

      htmlContent += '</table></body></html>';

      const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${siteName}_rapor_${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Başarılı',
        description: 'Rapor Excel formatında indirildi',
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Rapor oluşturulamadı',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Raporlama & Dışa Aktarma</h2>
        <p className="text-muted-foreground">
          Detaylı performans raporları oluşturun ve CSV/Excel formatında indirin
        </p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Rapor Ayarları</CardTitle>
          <CardDescription>
            Rapor için tarih aralığı ve format seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Başlangıç Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateRange.from && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, 'PPP', { locale: tr }) : 'Tarih seç'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateRange.to && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, 'PPP', { locale: tr }) : 'Tarih seç'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rapor Tipi</Label>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Özet Rapor</SelectItem>
                <SelectItem value="detailed">Detaylı Günlük Rapor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={exportToCSV}
              disabled={isExporting || isLoading}
              className="flex-1"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 mr-2" />
              )}
              CSV İndir
            </Button>
            <Button
              onClick={exportToExcel}
              disabled={isExporting || isLoading}
              variant="outline"
              className="flex-1"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Excel İndir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {reportData && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Rapor Önizleme</CardTitle>
            <CardDescription>
              Seçili tarih aralığı için özet veriler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Görüntülenme</span>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{reportData.totalViews}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Benzersiz Oturum</span>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{reportData.uniqueSessions}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Dönüşüm</span>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{reportData.totalConversions}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Ortalama Puan</span>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{reportData.avgRating?.toFixed(1) || '0.0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
