import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  lifetime_points: number;
  tier: string;
  rank?: number;
  username?: string;
  avatar_url?: string;
}

export const useLeaderboard = (timeframe: 'all' | 'month' | 'week' = 'all', limit = 10) => {
  return useQuery({
    queryKey: ['leaderboard', timeframe, limit],
    queryFn: async () => {
      let query = supabase
        .from('user_loyalty_points')
        .select(`
          user_id,
          total_points,
          lifetime_points,
          tier,
          profiles:user_id(username, avatar_url)
        `)
        .order('total_points', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      // Add rank and flatten profile data
      return data.map((entry: any, index: number) => ({
        user_id: entry.user_id,
        total_points: entry.total_points,
        lifetime_points: entry.lifetime_points,
        tier: entry.tier,
        rank: index + 1,
        username: entry.profiles?.username || 'Anonim Kullanıcı',
        avatar_url: entry.profiles?.avatar_url
      })) as LeaderboardEntry[];
    },
    refetchInterval: 60000, // Refresh every minute
  });
};
