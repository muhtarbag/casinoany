import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Gift, TrendingUp } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function GamificationDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['gamification-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: activeAchievements },
        { count: activeRewards },
        { count: totalRedemptions },
        { data: tierDistribution },
        { data: recentActivity }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('achievement_definitions').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('loyalty_rewards').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('user_reward_redemptions').select('*', { count: 'exact', head: true }),
        supabase
          .from('user_loyalty_points')
          .select('tier')
          .then(res => {
            const distribution = (res.data || []).reduce((acc: any, item) => {
              acc[item.tier] = (acc[item.tier] || 0) + 1;
              return acc;
            }, {});
            return { data: distribution };
          }),
        supabase
          .from('loyalty_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      return {
        totalUsers: totalUsers || 0,
        activeAchievements: activeAchievements || 0,
        activeRewards: activeRewards || 0,
        totalRedemptions: totalRedemptions || 0,
        tierDistribution: tierDistribution || {},
        recentActivity: recentActivity || []
      };
    }
  });

  if (isLoading) {
    return <LoadingState text="Gamification istatistikleri yükleniyor..." />;
  }

  const tierData = Object.entries(stats?.tierDistribution || {}).map(([name, value]) => ({
    name: name.toUpperCase(),
    value
  }));

  const COLORS = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gamification Yönetimi</h1>
        <p className="text-muted-foreground">Kullanıcı etkileşimi ve ödül sistemini yönetin</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Başarılar</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeAchievements}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Ödüller</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeRewards}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanımlar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRedemptions}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tiers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tiers">Tier Dağılımı</TabsTrigger>
          <TabsTrigger value="activity">Son Aktiviteler</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Tier Dağılımı</CardTitle>
              <CardDescription>Kullanıcıların sadakat seviyelerine göre dağılımı</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Son Puan Hareketleri</CardTitle>
              <CardDescription>Kullanıcıların son puan kazanma ve harcama işlemleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between border-b pb-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <Badge variant={activity.transaction_type === 'earn' ? 'default' : 'secondary'}>
                      {activity.transaction_type === 'earn' ? '+' : '-'}{activity.points} puan
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
