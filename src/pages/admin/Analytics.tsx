import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SiteStats from "@/components/SiteStats";
import { NotificationStats } from "@/components/notifications/NotificationStats";
import { SocialPlatformTrends } from "@/components/analytics/SocialPlatformTrends";
import { SiteSocialMediaCard } from "@/components/analytics/SiteSocialMediaCard";
import { SocialMediaStats } from "@/components/analytics/SocialMediaStats";
import { BarChart3, Bell, TrendingUp, Building2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Analytics() {
  // Fetch social media stats for trends from conversions table
  const { data: socialStats } = useQuery({
    queryKey: ['social-media-stats'],
    queryFn: async () => {
      // Get all active sites
      const { data: sites, error: sitesError } = await supabase
        .from('betting_sites')
        .select('id, name')
        .eq('is_active', true);

      if (sitesError) throw sitesError;
      if (!sites || sites.length === 0) return [];

      // Get all social media conversions
      const { data: conversions, error: convError } = await supabase
        .from('conversions')
        .select('site_id, conversion_type')
        .in('conversion_type', [
          'email_click',
          'whatsapp_click',
          'telegram_click',
          'twitter_click',
          'instagram_click',
          'facebook_click',
          'youtube_click'
        ]);

      if (convError) throw convError;

      // Aggregate social media clicks per site
      const statsMap = new Map();
      sites.forEach(site => {
        statsMap.set(site.id, {
          site_id: site.id,
          betting_sites: { name: site.name, is_active: true },
          email_clicks: 0,
          whatsapp_clicks: 0,
          telegram_clicks: 0,
          twitter_clicks: 0,
          instagram_clicks: 0,
          facebook_clicks: 0,
          youtube_clicks: 0,
        });
      });

      conversions?.forEach(conv => {
        if (!conv.site_id) return;
        const stats = statsMap.get(conv.site_id);
        if (!stats) return;

        switch (conv.conversion_type) {
          case 'email_click': stats.email_clicks++; break;
          case 'whatsapp_click': stats.whatsapp_clicks++; break;
          case 'telegram_click': stats.telegram_clicks++; break;
          case 'twitter_click': stats.twitter_clicks++; break;
          case 'instagram_click': stats.instagram_clicks++; break;
          case 'facebook_click': stats.facebook_clicks++; break;
          case 'youtube_click': stats.youtube_clicks++; break;
        }
      });

      return Array.from(statsMap.values());
    },
    staleTime: 30000,
    refetchOnMount: true,
  });

  // Fetch active sites with their social media stats for sorting from conversions
  const { data: activeSites } = useQuery({
    queryKey: ['active-sites-for-analytics'],
    queryFn: async () => {
      const { data: sites, error: sitesError } = await supabase
        .from('betting_sites')
        .select('id, name, slug')
        .eq('is_active', true);

      if (sitesError) throw sitesError;
      if (!sites || sites.length === 0) return [];

      // Fetch social media conversions
      const { data: conversions, error: convError } = await supabase
        .from('conversions')
        .select('site_id, conversion_type')
        .in('conversion_type', [
          'email_click',
          'whatsapp_click',
          'telegram_click',
          'twitter_click',
          'instagram_click',
          'facebook_click',
          'youtube_click'
        ]);

      if (convError) throw convError;

      // Calculate total clicks per site
      const clicksMap = new Map();
      conversions?.forEach(conv => {
        if (!conv.site_id) return;
        clicksMap.set(conv.site_id, (clicksMap.get(conv.site_id) || 0) + 1);
      });

      const sitesWithTotals = sites.map(site => ({
        ...site,
        totalClicks: clicksMap.get(site.id) || 0
      }));
      
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
          {socialStats && (
            <>
              <SocialMediaStats statsData={socialStats} />
              <SocialPlatformTrends statsData={socialStats} />
            </>
          )}
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
