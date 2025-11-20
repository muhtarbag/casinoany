import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserBehavior } from '@/hooks/queries/useTrafficQueries';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Monitor, Smartphone, Tablet } from 'lucide-react';
import { subDays } from 'date-fns';

interface UserBehaviorChartProps {
  siteId: string;
  days?: number;
}

export const UserBehaviorChart = ({ siteId, days = 7 }: UserBehaviorChartProps) => {
  const { data: behaviorData, isLoading } = useUserBehavior(siteId, {
    start: subDays(new Date(), days),
    end: new Date(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Davranışı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const chartData = behaviorData?.map((item) => ({
    date: new Date(item.metric_date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
    'Ort. Süre (sn)': Math.round(item.avg_session_duration || 0),
    'Bounce Rate (%)': Math.round(item.bounce_rate || 0),
    'Sayfa/Oturum': Number((item.pages_per_session || 0).toFixed(2)),
  })) || [];

  const latestData = behaviorData?.[0];
  const totalUsers = (latestData?.desktop_users || 0) + 
                     (latestData?.mobile_users || 0) + 
                     (latestData?.tablet_users || 0);

  const deviceStats = latestData ? [
    {
      name: 'Masaüstü',
      value: latestData.desktop_users || 0,
      percentage: totalUsers > 0 ? ((latestData.desktop_users || 0) / totalUsers * 100).toFixed(1) : '0',
      icon: Monitor,
      color: 'text-blue-600',
    },
    {
      name: 'Mobil',
      value: latestData.mobile_users || 0,
      percentage: totalUsers > 0 ? ((latestData.mobile_users || 0) / totalUsers * 100).toFixed(1) : '0',
      icon: Smartphone,
      color: 'text-green-600',
    },
    {
      name: 'Tablet',
      value: latestData.tablet_users || 0,
      percentage: totalUsers > 0 ? ((latestData.tablet_users || 0) / totalUsers * 100).toFixed(1) : '0',
      icon: Tablet,
      color: 'text-purple-600',
    },
  ] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Kullanıcı Davranış Analizi
        </CardTitle>
        <CardDescription>Son {days} günlük etkileşim metrikleri</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cihaz Dağılımı */}
        <div>
          <h3 className="text-sm font-medium mb-3">Cihaz Dağılımı</h3>
          <div className="grid grid-cols-3 gap-4">
            {deviceStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="text-center p-4 bg-muted/50 rounded-lg">
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">%{stat.percentage}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Davranış Grafikleri */}
        <div>
          <h3 className="text-sm font-medium mb-3">Etkileşim Trendleri</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Ort. Süre (sn)" 
                stroke="#3b82f6" 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="Bounce Rate (%)" 
                stroke="#ef4444" 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="Sayfa/Oturum" 
                stroke="#10b981" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Özet Metrikler */}
        {latestData && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(latestData.avg_session_duration || 0)}s
              </div>
              <div className="text-xs text-muted-foreground">Ort. Oturum Süresi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {latestData.bounce_rate?.toFixed(1) || '0'}%
              </div>
              <div className="text-xs text-muted-foreground">Bounce Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {latestData.pages_per_session?.toFixed(1) || '0'}
              </div>
              <div className="text-xs text-muted-foreground">Sayfa/Oturum</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
