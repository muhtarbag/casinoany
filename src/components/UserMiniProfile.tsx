import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, MessageSquare, Star, Users } from 'lucide-react';
import { AchievementBadge } from './AchievementBadge';
import { useAchievements } from '@/hooks/useAchievements';

interface UserMiniProfileProps {
  userId: string;
  showStats?: boolean;
}

interface UserStats {
  review_count: number;
  avg_rating: number;
  complaint_count: number;
  referral_count: number;
}

const tierColors = {
  bronze: 'bg-amber-700',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-purple-500'
};

export const UserMiniProfile = ({ userId, showStats = true }: UserMiniProfileProps) => {
  // Fetch user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-mini-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch loyalty points
  const { data: loyaltyData } = useQuery({
    queryKey: ['user-loyalty-mini', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_loyalty_points')
        .select('total_points, tier')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Fetch user stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['user-stats-mini', userId],
    queryFn: async () => {
      const [reviewsRes, complaintsRes, referralsRes] = await Promise.all([
        supabase
          .from('site_reviews')
          .select('rating', { count: 'exact' })
          .eq('user_id', userId)
          .eq('is_approved', true),
        supabase
          .from('site_complaints')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('user_referrals')
          .select('successful_referrals')
          .eq('user_id', userId)
          .single()
      ]);

      const avgRating = reviewsRes.data && reviewsRes.data.length > 0
        ? reviewsRes.data.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsRes.data.length
        : 0;

      return {
        review_count: reviewsRes.count || 0,
        avg_rating: Math.round(avgRating * 10) / 10,
        complaint_count: complaintsRes.count || 0,
        referral_count: referralsRes.data?.successful_referrals || 0
      } as UserStats;
    },
    enabled: showStats,
  });

  // Fetch achievements
  const { recentAchievements, isLoading: isLoadingAchievements } = useAchievements(userId);

  if (isLoadingProfile) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* User Header */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.username?.charAt(0).toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{profile?.username || 'Anonim Kullanıcı'}</p>
            {loyaltyData && (
              <div className="flex items-center gap-2 text-sm">
                <Badge
                  variant="secondary"
                  className={tierColors[loyaltyData.tier as keyof typeof tierColors]}
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  {loyaltyData.tier}
                </Badge>
                <span className="text-muted-foreground">
                  {loyaltyData.total_points} puan
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {showStats && stats && !isLoadingStats && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{stats.review_count} yorum</span>
            </div>
            {stats.avg_rating > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-4 w-4" />
                <span>{stats.avg_rating.toFixed(1)} ort.</span>
              </div>
            )}
            {stats.referral_count > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{stats.referral_count} davet</span>
              </div>
            )}
          </div>
        )}

        {/* Recent Achievements */}
        {!isLoadingAchievements && recentAchievements.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Son Rozetler</p>
            <div className="flex gap-2">
              {recentAchievements.slice(0, 4).map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  icon={achievement.achievement?.icon || 'Award'}
                  name={achievement.achievement?.name || ''}
                  description={achievement.achievement?.description || ''}
                  color={achievement.achievement?.color || '#3b82f6'}
                  isEarned={true}
                  earnedAt={achievement.earned_at}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
