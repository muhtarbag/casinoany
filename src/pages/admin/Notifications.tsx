import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';
import { LazyNotificationManagement } from '@/components/Performance/LazyAdminComponents';
import { UserNotificationManagement } from '@/components/admin/UserNotificationManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Users } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="user" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="user" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Kullanıcı Bildirimleri
          </TabsTrigger>
          <TabsTrigger value="site" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Site Bildirimleri
          </TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="mt-6">
          <UserNotificationManagement />
        </TabsContent>

        <TabsContent value="site" className="mt-6">
          <Suspense fallback={<LoadingState variant="skeleton" rows={8} />}>
            <LazyNotificationManagement />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
