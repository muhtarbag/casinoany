import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BannerManagement from './BannerManagement';
import CampaignManagement from './CampaignManagement';

export default function AdvertisingManagement() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="banners" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="banners">Bannerlar</TabsTrigger>
          <TabsTrigger value="campaigns">Kampanyalar</TabsTrigger>
        </TabsList>

        <TabsContent value="banners">
          <BannerManagement />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
