import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteManagementContainer } from '@/features/sites/SiteManagementContainer';
import { BannerManagement } from '@/components/BannerManagement';
import { RecommendedSitesManagement } from '@/components/RecommendedSitesManagement';
import { FeaturedSitesManagement } from '@/components/FeaturedSitesManagement';
import { Globe, Star, Link2, Image, BarChart3 } from 'lucide-react';
import SiteAnalytics from './SiteAnalytics';

export default function SitesHub() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Siteler Hub</h1>
        <p className="text-muted-foreground">
          Tüm site yönetimi işlemlerini tek yerden yönetin
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Globe className="w-4 h-4" />
            Tüm Siteler
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Performans Analizi
          </TabsTrigger>
          <TabsTrigger value="featured" className="gap-2">
            <Star className="w-4 h-4" />
            Öne Çıkanlar
          </TabsTrigger>
          <TabsTrigger value="recommended" className="gap-2">
            <Link2 className="w-4 h-4" />
            Önerilen
          </TabsTrigger>
          <TabsTrigger value="banners" className="gap-2">
            <Image className="w-4 h-4" />
            Bannerlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <SiteManagementContainer />
        </TabsContent>

        <TabsContent value="analytics">
          <SiteAnalytics />
        </TabsContent>

        <TabsContent value="featured">
          <FeaturedSitesManagement />
        </TabsContent>

        <TabsContent value="recommended">
          <RecommendedSitesManagement />
        </TabsContent>

        <TabsContent value="banners">
          <BannerManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
