import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SiteStats from "@/components/SiteStats";
import { NotificationStats } from "@/components/notifications/NotificationStats";
import { SocialPlatformTrends } from "@/components/analytics/SocialPlatformTrends";
import { SiteSocialMediaCard } from "@/components/analytics/SiteSocialMediaCard";
import { BarChart3, Bell, TrendingUp, Building2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Analytics() {
  // Fetch social media stats for trends
  const { data: socialStats } = useQuery({
    queryKey: ['social-media-stats'],
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
          betting_sites!inner(name, is_active)
        `)
        .eq('betting_sites.is_active', true);

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000, // 30 saniye cache
    refetchOnMount: true,
  });

  // Fetch active sites with their social media stats for sorting
  const { data: activeSites } = useQuery({
    queryKey: ['active-sites-for-analytics'],
    queryFn: async () => {
      // First fetch all active sites
      const { data: sites, error: sitesError } = await supabase
        .from('betting_sites')
        .select('id, name, slug')
        .eq('is_active', true);

      if (sitesError) throw sitesError;
      if (!sites || sites.length === 0) return [];

      // Then fetch all stats for these sites
      const siteIds = sites.map(s => s.id);
      const { data: stats, error: statsError } = await supabase
        .from('site_stats')
        .select('site_id, email_clicks, whatsapp_clicks, telegram_clicks, twitter_clicks, instagram_clicks, facebook_clicks, youtube_clicks')
        .in('site_id', siteIds);

      if (statsError) throw statsError;

      // Create a map of site_id to stats
      const statsMap = new Map(
        (stats || []).map(stat => [stat.site_id, stat])
      );

      // Calculate total clicks and combine data
      const sitesWithTotals = sites.map(site => {
        const siteStats = statsMap.get(site.id);
        const totalClicks = (
          (siteStats?.email_clicks || 0) +
          (siteStats?.whatsapp_clicks || 0) +
          (siteStats?.telegram_clicks || 0) +
          (siteStats?.twitter_clicks || 0) +
          (siteStats?.instagram_clicks || 0) +
          (siteStats?.facebook_clicks || 0) +
          (siteStats?.youtube_clicks || 0)
        );
        return { ...site, totalClicks };
      });
      
      // Sort by total clicks (highest first)
      return sitesWithTotals.sort((a, b) => b.totalClicks - a.totalClicks);
    },
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sites" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Site Analitiği
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Sosyal Medya Trendleri
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
                <TrendingUp className="h-5 w-5" />
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

        {/* Social Media Analytics Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sosyal Medya Analitiği
              </CardTitle>
              <CardDescription>
                Platform bazında tıklama performansı ve engagement metrikleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              {socialStats && <SocialPlatformTrends statsData={socialStats} />}
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
