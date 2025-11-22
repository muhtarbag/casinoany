import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Trophy, TrendingUp, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QUERY_CONFIG } from '@/lib/queryConfig';

export default function UserStatsManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ OPTIMIZED: Non-blocking queries with independent loading states
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['user-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_loyalty_points')
        .select(`
          *,
          profiles:user_id(username, avatar_url, display_name)
        `)
        .order('lifetime_points', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    ...QUERY_CONFIG.dynamic, // 1 min cache for frequently changing data
  });

  const { data: referralStats, isLoading: isLoadingReferrals } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_referrals')
        .select(`
          *,
          profiles:user_id(username, avatar_url, display_name)
        `)
        .order('total_referrals', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data;
    },
    ...QUERY_CONFIG.dynamic,
  });

  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['user-achievements-stats'],
    queryFn: async () => {
      // ✅ OPTIMIZED: Reduced limit for faster initial load
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          user_id,
          profiles:user_id(username, avatar_url, display_name)
        `)
        .limit(100); // Reduced from 200
      
      if (error) throw error;
      
      // Group by user and count achievements
      const grouped = data.reduce((acc: any, item: any) => {
        const userId = item.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            profile: item.profiles,
            count: 0
          };
        }
        acc[userId].count++;
        return acc;
      }, {});
      
      return Object.values(grouped).sort((a: any, b: any) => b.count - a.count).slice(0, 30) as any[];
    },
    ...QUERY_CONFIG.dynamic,
  });

  // ✅ OPTIMIZED: Memoized filtering
  const filteredLeaderboard = useMemo(() => {
    if (!leaderboard || !searchTerm.trim()) return leaderboard;
    
    const searchLower = searchTerm.toLowerCase();
    return leaderboard.filter((user: any) => {
      const profile = user.profiles;
      return (
        profile?.username?.toLowerCase().includes(searchLower) ||
        profile?.display_name?.toLowerCase().includes(searchLower)
      );
    });
  }, [leaderboard, searchTerm]);

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-orange-100 text-orange-800 border-orange-300',
      silver: 'bg-gray-100 text-gray-800 border-gray-300',
      gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      platinum: 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[tier] || colors.bronze;
  };

  // ✅ OPTIMIZED: Show page immediately, individual sections can load independently
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kullanıcı İstatistikleri</h1>
        <p className="text-muted-foreground">Kullanıcıların gamification aktivitelerini takip edin</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Kullanıcı ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="points" className="space-y-4">
        <TabsList>
          <TabsTrigger value="points">
            <Trophy className="mr-2 h-4 w-4" />
            Puan Sıralaması
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <TrendingUp className="mr-2 h-4 w-4" />
            Referans Sıralaması
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="mr-2 h-4 w-4" />
            Başarı Sıralaması
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <Card>
            <CardHeader>
              <CardTitle>Puan Lider Tablosu</CardTitle>
              <CardDescription>En çok puan kazanan kullanıcılar</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sıra</TableHead>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Mevcut Puan</TableHead>
                      <TableHead>Toplam Kazanılan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeaderboard?.map((user: any, index: number) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-bold">#{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profiles?.avatar_url} />
                              <AvatarFallback>
                                {(user.profiles?.display_name || user.profiles?.username || 'U')[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.profiles?.display_name || user.profiles?.username || 'Anonim'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTierColor(user.tier)}>
                            {user.tier.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{user.current_points} puan</TableCell>
                        <TableCell className="text-muted-foreground">{user.lifetime_points} puan</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Referans Lider Tablosu</CardTitle>
              <CardDescription>En çok referans yapan kullanıcılar</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReferrals ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sıra</TableHead>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Toplam Referans</TableHead>
                      <TableHead>Başarılı</TableHead>
                      <TableHead>Kazanılan Puan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralStats?.map((user: any, index: number) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-bold">#{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profiles?.avatar_url} />
                              <AvatarFallback>
                                {(user.profiles?.display_name || user.profiles?.username || 'U')[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.profiles?.display_name || user.profiles?.username || 'Anonim'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.total_referrals}</TableCell>
                        <TableCell className="text-green-600 font-medium">{user.successful_referrals}</TableCell>
                        <TableCell>{user.total_points_earned} puan</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Başarı Lider Tablosu</CardTitle>
              <CardDescription>En çok başarı kazanan kullanıcılar</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAchievements ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sıra</TableHead>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Kazanılan Başarı</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(achievements) && achievements.map((user: any, index: number) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-bold">#{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profile?.avatar_url} />
                              <AvatarFallback>
                                {(user.profile?.display_name || user.profile?.username || 'U')[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.profile?.display_name || user.profile?.username || 'Anonim'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{user.count} başarı</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
