import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';
import { LazyNotificationManagement } from '@/components/Performance/LazyAdminComponents';
import { UserNotificationManagement } from '@/components/admin/UserNotificationManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Notifications() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 p-8"
      >
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-3xl blur-3xl" />
          <div className="relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
                <Bell className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Bildirim Yönetimi
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Kullanıcılarınızla etkili iletişim kurun
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-14 p-1 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger 
              value="user" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">Kullanıcı Bildirimleri</span>
            </TabsTrigger>
            <TabsTrigger 
              value="site" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Bell className="w-4 h-4" />
              <span className="font-medium">Site Bildirimleri</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="mt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <UserNotificationManagement />
            </motion.div>
          </TabsContent>

          <TabsContent value="site" className="mt-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Suspense fallback={<LoadingState variant="skeleton" rows={8} />}>
                <LazyNotificationManagement />
              </Suspense>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
