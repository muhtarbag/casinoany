import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrafficSources } from '@/hooks/queries/useTrafficQueries';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { subDays } from 'date-fns';

interface TrafficSourcesChartProps {
  siteId: string;
  days?: number;
}

export const TrafficSourcesChart = ({ siteId, days = 7 }: TrafficSourcesChartProps) => {
  const { data: trafficData, isLoading } = useTrafficSources(siteId, {
    start: subDays(new Date(), days),
    end: new Date(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trafik Kaynakları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const chartData = trafficData?.map((item) => ({
    date: new Date(item.metric_date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
    Organik: item.organic_views,
    Direkt: item.direct_views,
    Sosyal: item.social_views,
    Yönlendirme: item.referral_views,
  })) || [];

  const totalsBySource = trafficData?.reduce(
    (acc, item) => ({
      organic: acc.organic + item.organic_views,
      direct: acc.direct + item.direct_views,
      social: acc.social + item.social_views,
      referral: acc.referral + item.referral_views,
    }),
    { organic: 0, direct: 0, social: 0, referral: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trafik Kaynakları
        </CardTitle>
        <CardDescription>Son {days} günlük kaynak dağılımı</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Özet Kartlar */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalsBySource?.organic || 0}</div>
            <div className="text-xs text-muted-foreground">Organik</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalsBySource?.direct || 0}</div>
            <div className="text-xs text-muted-foreground">Direkt</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{totalsBySource?.social || 0}</div>
            <div className="text-xs text-muted-foreground">Sosyal</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{totalsBySource?.referral || 0}</div>
            <div className="text-xs text-muted-foreground">Yönlendirme</div>
          </div>
        </div>

        {/* Grafik */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Organik" fill="#3b82f6" />
            <Bar dataKey="Direkt" fill="#10b981" />
            <Bar dataKey="Sosyal" fill="#8b5cf6" />
            <Bar dataKey="Yönlendirme" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
