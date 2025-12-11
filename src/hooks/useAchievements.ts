import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AchievementDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'social' | 'loyalty' | 'activity' | 'special';
  requirement_type: 'count' | 'milestone' | 'special';
  requirement_value?: number;
  points_reward: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_code: string;
  earned_at: string;
  metadata?: any;
  achievement?: AchievementDefinition;
}

export const useAchievements = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  // Fetch all achievement definitions
  const { data: allAchievements = [], isLoading: isLoadingDefinitions } = useQuery({
    queryKey: ['achievement-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as AchievementDefinition[];
    },
  });

  // Fetch user's earned achievements
  const { data: userAchievements = [], isLoading: isLoadingUserAchievements } = useQuery({
    queryKey: ['user-achievements', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievement_definitions(*)
        `)
        .eq('user_id', targetUserId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!targetUserId,
  });

  // Calculate achievement stats
  const earnedCount = userAchievements.length;
  const totalCount = allAchievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  // Group achievements by category
  const achievementsByCategory = allAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push({
      ...achievement,
      isEarned: userAchievements.some(ua => ua.achievement_code === achievement.code),
      earnedAt: userAchievements.find(ua => ua.achievement_code === achievement.code)?.earned_at
    });
    return acc;
  }, {} as Record<string, any[]>);

  // Get recent achievements (last 5)
  const recentAchievements = userAchievements.slice(0, 5);

  return {
    allAchievements,
    userAchievements,
    earnedCount,
    totalCount,
    completionPercentage,
    achievementsByCategory,
    recentAchievements,
    isLoading: isLoadingDefinitions || isLoadingUserAchievements,
  };
};
