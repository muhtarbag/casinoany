import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SiteStats from "@/components/SiteStats";
import { NotificationStats } from "@/components/notifications/NotificationStats";
import { SiteSocialMediaCard } from "@/components/analytics/SiteSocialMediaCard";
import { BarChart3, Bell, Building2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Analytics() {
  // ✅ Fetch active sites sorted by social media clicks
  const { data: activeSites } = useQuery({
    queryKey: ['active-sites-for-analytics-v2'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_stats')
        .select(`
          site_id,
          email_clicks,
          whatsapp_clicks,
          telegram_clicks,
          twitter_clicks,
          instagram_clicks,
          facebook_clicks,
          youtube_clicks,
          betting_sites!inner (
            name,
            slug,
            is_active
          )
        `)
        .eq('betting_sites.is_active', true);

      if (error) throw error;
      if (!data) return [];

      const sitesWithTotals = data.map(stat => {
        const site = (stat.betting_sites as any);
        const totalClicks = (stat.email_clicks || 0) + 
                           (stat.whatsapp_clicks || 0) + 
                           (stat.telegram_clicks || 0) + 
                           (stat.twitter_clicks || 0) + 
                           (stat.instagram_clicks || 0) + 
                           (stat.facebook_clicks || 0) + 
                           (stat.youtube_clicks || 0);
        
        return {
          id: stat.site_id,
          name: site?.name || 'Unknown',
          slug: site?.slug || '',
          totalClicks
        };
      });
      
      return sitesWithTotals
        .filter(site => site.totalClicks > 0)
        .sort((a, b) => b.totalClicks - a.totalClicks);
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analitik Verileri</h1>
        <p className="text-muted-foreground mt-2">
          Tüm site ve bildirim performans metriklerini görüntüleyin
        </p>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="sites" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sites" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Site Analitiği
          </TabsTrigger>
          <TabsTrigger value="site-social" className="gap-2">
            <Building2 className="h-4 w-4" />
            Site Bazında
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Bildirim Analitiği
          </TabsTrigger>
        </TabsList>

        {/* Site Analytics Tab */}
        <TabsContent value="sites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Site Performans Metrikleri
              </CardTitle>
              <CardDescription>
                Site görüntülenmeleri, tıklamaları ve CTR analizleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SiteStats />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Site-Specific Social Media Analytics Tab */}
        <TabsContent value="site-social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Site Bazında Sosyal Medya Analitiği
              </CardTitle>
              <CardDescription>
                Her site için sosyal medya platformlarının tıklama performansı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeSites?.map((site) => (
                  <SiteSocialMediaCard
                    key={site.id}
                    siteId={site.id}
                    siteName={site.name}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Analytics Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Bildirim Performans Metrikleri
              </CardTitle>
              <CardDescription>
                Bildirim görüntülenmeleri, tıklamaları ve etkileşim oranları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationStats />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
