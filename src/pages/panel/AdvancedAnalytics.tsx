import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReputationScoreCard } from '@/components/panel/analytics/ReputationScoreCard';
import { SiteBadgesDisplay } from '@/components/panel/analytics/SiteBadgesDisplay';
import { SEOScoreCard } from '@/components/panel/analytics/SEOScoreCard';
import { TrafficSourcesChart } from '@/components/panel/analytics/TrafficSourcesChart';
import { PopularityMetricsCard } from '@/components/panel/analytics/PopularityMetricsCard';
import { KeywordTrackingTable } from '@/components/panel/analytics/KeywordTrackingTable';
import { UserBehaviorChart } from '@/components/panel/analytics/UserBehaviorChart';
import { Shield, TrendingUp, Search, Users } from 'lucide-react';

export const AdvancedAnalytics = () => {
  // Site owner'ın sitesini almak için gerçek implementasyonda useParams veya context kullanılacak
  const siteId = 'YOUR_SITE_ID'; // Dinamik olarak alınmalı

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gelişmiş Analitik</h1>
        <p className="text-muted-foreground">
          Sitenizin performansını, itibarını ve SEO durumunu detaylı olarak inceleyin
        </p>
      </div>

      <Tabs defaultValue="reputation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reputation" className="gap-2">
            <Shield className="h-4 w-4" />
            İtibar & Güven
          </TabsTrigger>
          <TabsTrigger value="traffic" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trafik Analizi
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" />
            SEO & İçerik
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Users className="h-4 w-4" />
            Sosyal Kanıt
          </TabsTrigger>
        </TabsList>

        {/* İtibar & Güven */}
        <TabsContent value="reputation" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ReputationScoreCard siteId={siteId} />
            <SiteBadgesDisplay siteId={siteId} />
          </div>
        </TabsContent>

        {/* Trafik Analizi */}
        <TabsContent value="traffic" className="space-y-6">
          <TrafficSourcesChart siteId={siteId} days={30} />
          <UserBehaviorChart siteId={siteId} days={14} />
        </TabsContent>

        {/* SEO & İçerik */}
        <TabsContent value="seo" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <SEOScoreCard siteId={siteId} />
          </div>
          <KeywordTrackingTable siteId={siteId} />
        </TabsContent>

        {/* Sosyal Kanıt */}
        <TabsContent value="social" className="space-y-6">
          <PopularityMetricsCard siteId={siteId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
