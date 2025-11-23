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
  // ✅ FIXED: Fetch from conversions table (real data source)
  const { data: socialStats } = useQuery({
    queryKey: ['social-media-stats'],
    queryFn: async () => {
      // Get all sites
      const { data: sites, error: sitesError } = await supabase
        .from('betting_sites')
        .select('id, name, slug')
        .eq('is_active', true);

      if (sitesError) throw sitesError;
      if (!sites) return [];

      // Get social media clicks from conversions table
      const { data: conversions, error: conversionsError } = await supabase
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
        ])
        .not('site_id', 'is', null);

      if (conversionsError) throw conversionsError;

      // Aggregate clicks per site and platform
      const clicksBySite = conversions?.reduce((acc, conv) => {
        const siteId = conv.site_id!;
        if (!acc[siteId]) {
          acc[siteId] = {
            email_clicks: 0,
            whatsapp_clicks: 0,
            telegram_clicks: 0,
            twitter_clicks: 0,
            instagram_clicks: 0,
            facebook_clicks: 0,
            youtube_clicks: 0,
          };
        }
        
        // Map conversion_type to clicks field
        const platformMap: Record<string, keyof typeof acc[string]> = {
          'email_click': 'email_clicks',
          'whatsapp_click': 'whatsapp_clicks',
          'telegram_click': 'telegram_clicks',
          'twitter_click': 'twitter_clicks',
          'instagram_click': 'instagram_clicks',
          'facebook_click': 'facebook_clicks',
          'youtube_click': 'youtube_clicks',
        };
        
        const field = platformMap[conv.conversion_type];
        if (field) {
          acc[siteId][field]++;
        }
        
        return acc;
      }, {} as Record<string, any>) || {};

      // Combine sites with their click data
      return sites.map(site => ({
        site_id: site.id,
        site_name: site.name,
        betting_sites: { name: site.name, is_active: true },
        email_clicks: clicksBySite[site.id]?.email_clicks || 0,
        whatsapp_clicks: clicksBySite[site.id]?.whatsapp_clicks || 0,
        telegram_clicks: clicksBySite[site.id]?.telegram_clicks || 0,
        twitter_clicks: clicksBySite[site.id]?.twitter_clicks || 0,
        instagram_clicks: clicksBySite[site.id]?.instagram_clicks || 0,
        facebook_clicks: clicksBySite[site.id]?.facebook_clicks || 0,
        youtube_clicks: clicksBySite[site.id]?.youtube_clicks || 0,
      }));
    },
    staleTime: 30000,
    refetchOnMount: true,
  });

  // ✅ FIXED: Fetch active sites with their conversion stats
  const { data: activeSites } = useQuery({
    queryKey: ['active-sites-for-analytics'],
    queryFn: async () => {
      const { data: sites, error: sitesError } = await supabase
        .from('betting_sites')
        .select('id, name, slug')
        .eq('is_active', true);

      if (sitesError) throw sitesError;
      if (!sites) return [];

      // Get social clicks from conversions
      const { data: conversions, error: conversionsError } = await supabase
        .from('conversions')
        .select('site_id')
        .in('conversion_type', [
          'email_click',
          'whatsapp_click',
          'telegram_click',
          'twitter_click',
          'instagram_click',
          'facebook_click',
          'youtube_click'
        ])
        .not('site_id', 'is', null);

      if (conversionsError) throw conversionsError;

      // Count clicks per site
      const clicksBySite = conversions?.reduce((acc, conv) => {
        const siteId = conv.site_id!;
        acc[siteId] = (acc[siteId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Map sites with total clicks
      const sitesWithTotals = sites.map(site => ({
        id: site.id,
        name: site.name,
        slug: site.slug,
        totalClicks: clicksBySite[site.id] || 0
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
