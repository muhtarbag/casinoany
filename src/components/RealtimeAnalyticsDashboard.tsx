import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, MousePointer, Users, Activity, TrendingUp, Circle } from 'lucide-react';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

export const RealtimeAnalyticsDashboard = () => {
  const { metrics, isConnected } = useRealtimeAnalytics();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'click':
        return <MousePointer className="w-4 h-4 text-green-500" />;
      case 'event':
        return <Activity className="w-4 h-4 text-purple-500" />;
      case 'conversion':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'view':
        return 'bg-blue-500/10 text-blue-500';
      case 'click':
        return 'bg-green-500/10 text-green-500';
      case 'event':
        return 'bg-purple-500/10 text-purple-500';
      case 'conversion':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Canlı Analytics</h2>
          <p className="text-muted-foreground">
            Gerçek zamanlı site istatistikleri ve kullanıcı aktiviteleri
          </p>
        </div>
        <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-2">
          <motion.div
            animate={{ scale: isConnected ? [1, 1.2, 1] : 1 }}
            transition={{ repeat: isConnected ? Infinity : 0, duration: 2 }}
          >
            <Circle className={`w-2 h-2 ${isConnected ? 'fill-green-500 text-green-500' : 'fill-gray-500 text-gray-500'}`} />
          </motion.div>
          {isConnected ? 'Canlı' : 'Bağlanıyor...'}
        </Badge>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görüntüleme</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div
              key={metrics.totalViews}
              initial={{ scale: 1.2, color: '#3b82f6' }}
              animate={{ scale: 1, color: 'inherit' }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold"
            >
              {metrics.totalViews.toLocaleString()}
            </motion.div>
            <p className="text-xs text-muted-foreground">
              Sayfa görüntülenmeleri
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div
              key={metrics.totalClicks}
              initial={{ scale: 1.2, color: '#10b981' }}
              animate={{ scale: 1, color: 'inherit' }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold"
            >
              {metrics.totalClicks.toLocaleString()}
            </motion.div>
            <p className="text-xs text-muted-foreground">
              Affiliate link tıklamaları
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div
              key={metrics.activeUsers}
              initial={{ scale: 1.2, color: '#8b5cf6' }}
              animate={{ scale: 1, color: 'inherit' }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold"
            >
              {metrics.activeUsers.toLocaleString()}
            </motion.div>
            <p className="text-xs text-muted-foreground">
              Son 5 dakika içinde
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dönüşüm Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalViews > 0 
                ? ((metrics.totalClicks / metrics.totalViews) * 100).toFixed(2)
                : '0.00'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Click-through rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Canlı Aktivite Akışı
          </CardTitle>
          <CardDescription>
            Gerçek zamanlı kullanıcı aktiviteleri ve site etkileşimleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <AnimatePresence mode="popLayout">
              {metrics.recentActivities.length > 0 ? (
                <div className="space-y-2">
                  {metrics.recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.details}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {activity.type === 'view' && 'Görüntüleme'}
                        {activity.type === 'click' && 'Tıklama'}
                        {activity.type === 'event' && 'Etkinlik'}
                        {activity.type === 'conversion' && 'Dönüşüm'}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <Activity className="w-12 h-12 mb-4 opacity-20" />
                  <p>Henüz aktivite bulunmuyor</p>
                  <p className="text-sm">Aktiviteler gerçek zamanlı olarak burada görünecek</p>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Connection Status */}
      {!isConnected && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Circle className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium">Canlı bağlantı kuruluyor...</p>
                <p className="text-xs text-muted-foreground">
                  WebSocket bağlantısı bekleniyor
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
