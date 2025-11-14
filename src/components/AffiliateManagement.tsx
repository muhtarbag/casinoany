import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  Calendar,
  Link as LinkIcon,
  Plus,
  ExternalLink,
  LineChart as LineChartIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AffiliateManagement() {
  const queryClient = useQueryClient();
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');

  // Fetch sites with affiliate contracts - NORMALIZED SCHEMA
  const { data: sites, isLoading: sitesLoading, error: sitesError, refetch } = useQuery({
    queryKey: ['affiliate-sites'],
    queryFn: async () => {
      console.log('🔍 Affiliate sites query başlatılıyor...');
      const { data, error } = await (supabase as any)
        .from('betting_sites')
        .select(`
          *,
          affiliate_data:site_affiliate_data(*)
        `)
        .not('site_affiliate_data.contract_date', 'is', null)
        .order('name');
      
      if (error) {
        console.error('❌ Affiliate sites query hatası:', error);
        throw error;
      }
      
      console.log('✅ Affiliate sites query başarılı. Site sayısı:', data?.length || 0);
      console.log('📋 Siteler:', data?.map((s: any) => s.name).join(', '));
      return data;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  // Fetch selected site details - NORMALIZED SCHEMA
  const { data: selectedSite } = useQuery({
    queryKey: ['site-details', selectedSiteId],
    queryFn: async () => {
      if (!selectedSiteId) return null;
      const { data, error } = await (supabase as any)
        .from('betting_sites')
        .select(`
          *,
          affiliate_data:site_affiliate_data(*),
          social_media:site_social_media(*)
        `)
        .eq('id', selectedSiteId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSiteId,
  });

  // Fetch payments for selected site
  const { data: payments } = useQuery({
    queryKey: ['affiliate-payments', selectedSiteId],
    queryFn: async () => {
      if (!selectedSiteId) return [];
      const { data, error } = await supabase
        .from('affiliate_payments')
        .select('*')
        .eq('site_id', selectedSiteId)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSiteId,
  });

  // Fetch metrics for selected site
  const { data: metrics } = useQuery({
    queryKey: ['affiliate-metrics', selectedSiteId],
    queryFn: async () => {
      if (!selectedSiteId) return [];
      const { data, error } = await supabase
        .from('affiliate_metrics')
        .select('*')
        .eq('site_id', selectedSiteId)
        .order('metric_date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSiteId,
  });

  // Add payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: async (payment: any) => {
      const { error } = await supabase
        .from('affiliate_payments')
        .insert([payment]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-payments'] });
      toast.success('Ödeme kaydı eklendi!');
    },
    onError: (error: any) => {
      toast.error('Hata: ' + error.message);
    },
  });

  // Calculate totals
  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.payment_amount), 0) || 0;
  const totalClicks = metrics?.reduce((sum, m) => sum + m.total_clicks, 0) || 0;
  const totalViews = metrics?.reduce((sum, m) => sum + m.total_views, 0) || 0;
  const totalConversions = metrics?.reduce((sum, m) => sum + m.total_conversions, 0) || 0;

  // Prepare chart data (reverse to show oldest to newest)
  const chartData = metrics
    ?.slice()
    .reverse()
    .map((m) => ({
      date: new Date(m.metric_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
      Tıklama: m.total_clicks,
      Görüntüleme: m.total_views,
      Gelir: Number(m.estimated_revenue || 0),
    })) || [];

  if (sitesLoading) {
    return <div className="flex justify-center p-8">Yükleniyor...</div>;
  }

  if (sitesError) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive mb-4">❌ Siteler yüklenirken hata oluştu</p>
          <Button onClick={() => refetch()} variant="outline">Tekrar Dene</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>🤝 Affiliate Yönetim Paneli</CardTitle>
              <CardDescription>
                Affiliate anlaşmalarınızı, ödemelerinizi ve performansınızı takip edin
              </CardDescription>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Site Seçin</Label>
                {sites && sites.length > 0 && (
                  <Badge variant="secondary">{sites.length} site</Badge>
                )}
              </div>
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Affiliate anlaşması olan bir site seçin..." />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {sites && sites.length > 0 ? (
                    sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                        {site.affiliate_contract_date && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({new Date(site.affiliate_contract_date).toLocaleDateString('tr-TR')})
                          </span>
                        )}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      <p className="mb-2">⚠️ Affiliate anlaşması olan site bulunamadı</p>
                      <p className="text-xs">Site Yönetimi'nden bir siteye "Anlaşma Tarihi" ekleyin</p>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedSiteId && selectedSite && (
              <div className="space-y-6 mt-6">
                {/* Site Info Card */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{selectedSite.name}</CardTitle>
                        <CardDescription className="mt-2">
                          Anlaşma Tarihi: {(selectedSite as any).affiliate_data?.contract_date ? new Date((selectedSite as any).affiliate_data.contract_date).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                        </CardDescription>
                      </div>
                      {(selectedSite as any).affiliate_data?.panel_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={(selectedSite as any).affiliate_data.panel_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Panel'i Aç
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Komisyon %</p>
                        <p className="text-xl font-bold">
                          {(selectedSite as any).affiliate_data?.commission_percentage || '-'}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Aylık Ödeme</p>
                        <p className="text-xl font-bold">
                          {(selectedSite as any).affiliate_data?.has_monthly_payment ? (
                            `${(selectedSite as any).affiliate_data?.monthly_payment || 0} TL`
                          ) : (
                            <Badge variant="secondary">Yok</Badge>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Panel Kullanıcı</p>
                        <p className="text-sm font-mono">{(selectedSite as any).affiliate_data?.panel_username || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Panel Şifre</p>
                        <p className="text-sm font-mono">
                          {(selectedSite as any).affiliate_data?.panel_password ? '••••••••' : '-'}
                        </p>
                      </div>
                    </div>
                    {(selectedSite as any).affiliate_data?.contract_terms && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Anlaşma Şartları:</p>
                        <p className="text-sm">{(selectedSite as any).affiliate_data.contract_terms}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                          <p className="text-2xl font-bold">{totalRevenue.toFixed(2)} TL</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Toplam Tıklama</p>
                          <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                        </div>
                        <MousePointer className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Toplam Görüntüleme</p>
                          <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                        </div>
                        <Eye className="w-8 h-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Conversion</p>
                          <p className="text-2xl font-bold">{totalConversions}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs for Performance Chart, Payments and Metrics */}
                <Tabs defaultValue="chart" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="chart">Performans Grafiği</TabsTrigger>
                    <TabsTrigger value="payments">Ödeme Geçmişi</TabsTrigger>
                    <TabsTrigger value="metrics">Metrikler</TabsTrigger>
                  </TabsList>

                  {/* Performance Chart Tab */}
                  <TabsContent value="chart" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LineChartIcon className="w-5 h-5" />
                          Performans Trendleri
                        </CardTitle>
                        <CardDescription>
                          Son 30 günün tıklama, görüntüleme ve gelir trendleri
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {chartData.length > 0 ? (
                          <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis 
                                  dataKey="date" 
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
                                    borderRadius: '8px'
                                  }}
                                />
                                <Legend />
                                <Line 
                                  yAxisId="left"
                                  type="monotone" 
                                  dataKey="Görüntüleme" 
                                  stroke="hsl(var(--primary))" 
                                  strokeWidth={2}
                                  dot={{ fill: 'hsl(var(--primary))' }}
                                />
                                <Line 
                                  yAxisId="left"
                                  type="monotone" 
                                  dataKey="Tıklama" 
                                  stroke="hsl(var(--chart-2))" 
                                  strokeWidth={2}
                                  dot={{ fill: 'hsl(var(--chart-2))' }}
                                />
                                <Line 
                                  yAxisId="right"
                                  type="monotone" 
                                  dataKey="Gelir" 
                                  stroke="hsl(var(--chart-3))" 
                                  strokeWidth={2}
                                  dot={{ fill: 'hsl(var(--chart-3))' }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                            <LineChartIcon className="w-16 h-16 mb-4 opacity-50" />
                            <p>Henüz metrik verisi bulunmuyor</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="payments" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Ödeme Geçmişi</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {payments && payments.length > 0 ? (
                            payments.map((payment) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                              >
                                <div>
                                  <p className="font-semibold">
                                    {new Date(payment.payment_date).toLocaleDateString('tr-TR')}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {payment.payment_type === 'monthly' ? 'Aylık Ödeme' : 
                                     payment.payment_type === 'commission' ? 'Komisyon' : 'Bonus'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-lg text-green-600">
                                    {payment.payment_amount} TL
                                  </p>
                                  <Badge variant={
                                    payment.payment_status === 'completed' ? 'default' :
                                    payment.payment_status === 'pending' ? 'secondary' : 'destructive'
                                  }>
                                    {payment.payment_status === 'completed' ? 'Tamamlandı' :
                                     payment.payment_status === 'pending' ? 'Bekliyor' : 'İptal'}
                                  </Badge>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-muted-foreground py-8">
                              Henüz ödeme kaydı yok
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="metrics" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Son 30 Gün Metrikleri</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {metrics && metrics.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2">Tarih</th>
                                    <th className="text-right py-2">Görüntüleme</th>
                                    <th className="text-right py-2">Tıklama</th>
                                    <th className="text-right py-2">Conversion</th>
                                    <th className="text-right py-2">Gelir (Tahmini)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {metrics.map((metric) => (
                                    <tr key={metric.id} className="border-b">
                                      <td className="py-2">
                                        {new Date(metric.metric_date).toLocaleDateString('tr-TR')}
                                      </td>
                                      <td className="text-right">{metric.total_views}</td>
                                      <td className="text-right">{metric.total_clicks}</td>
                                      <td className="text-right">{metric.total_conversions}</td>
                                      <td className="text-right font-semibold">
                                        {metric.estimated_revenue || 0} TL
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-center text-muted-foreground py-8">
                              Henüz metrik verisi yok
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}