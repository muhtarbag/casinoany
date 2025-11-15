import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteManagementContainer } from '@/features/sites/SiteManagementContainer';
import { Globe, Star, Link2, Image } from 'lucide-react';

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

        <TabsContent value="featured">
          <div className="text-center py-12 text-muted-foreground">
            Öne çıkan siteler yönetimi (yakında)
          </div>
        </TabsContent>

        <TabsContent value="recommended">
          <div className="text-center py-12 text-muted-foreground">
            Önerilen siteler yönetimi (yakında)
          </div>
        </TabsContent>

        <TabsContent value="banners">
          <div className="text-center py-12 text-muted-foreground">
            Banner yönetimi (yakında)
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
