import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface LoyaltyPoints {
  id: string;
  user_id: string;
  total_points: number;
  lifetime_points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: 'earn' | 'spend' | 'bonus' | 'expire' | 'admin_adjustment';
  source: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  points_cost: number;
  reward_type: 'bonus' | 'cashback' | 'free_spin' | 'vip_access' | 'custom';
  reward_value?: string;
  image_url?: string;
  terms?: string;
  is_active: boolean;
  stock_quantity?: number;
  min_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  status: 'pending' | 'approved' | 'delivered' | 'rejected' | 'expired';
  redemption_code?: string;
  notes?: string;
  redeemed_at: string;
  processed_at?: string;
  expires_at?: string;
  reward?: LoyaltyReward;
}

export const useUserLoyaltyPoints = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's loyalty points
  const { data: loyaltyPoints, isLoading: isLoadingPoints } = useQuery({
    queryKey: ['user-loyalty-points', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Create initial record if doesn't exist
      if (!data) {
        const { data: newData, error: createError } = await supabase
          .from('user_loyalty_points')
          .insert({
            user_id: user.id,
            total_points: 0,
            lifetime_points: 0,
            tier: 'bronze'
          })
          .select()
          .single();

        if (createError) throw createError;
        return newData as LoyaltyPoints;
      }

      return data as LoyaltyPoints;
    },
    enabled: !!user,
  });

  // Fetch transaction history
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['loyalty-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as LoyaltyTransaction[];
    },
    enabled: !!user,
  });

  // Fetch available rewards
  const { data: rewards = [], isLoading: isLoadingRewards } = useQuery({
    queryKey: ['loyalty-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as LoyaltyReward[];
    },
  });

  // Fetch user's redemptions
  const { data: redemptions = [], isLoading: isLoadingRedemptions } = useQuery({
    queryKey: ['user-redemptions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_reward_redemptions')
        .select(`
          *,
          reward:loyalty_rewards(*)
        `)
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false });

      if (error) throw error;
      return data as RewardRedemption[];
    },
    enabled: !!user,
  });

  // Redeem reward mutation
  const redeemRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      if (!user) throw new Error('User not authenticated');

      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) throw new Error('Reward not found');

      if (!loyaltyPoints || loyaltyPoints.total_points < reward.points_cost) {
        throw new Error('Insufficient points');
      }

      // Check tier requirement
      const tierOrder = { bronze: 0, silver: 1, gold: 2, platinum: 3 };
      if (tierOrder[loyaltyPoints.tier] < tierOrder[reward.min_tier]) {
        throw new Error(`This reward requires ${reward.min_tier} tier or higher`);
      }

      // Insert redemption
      const { data, error } = await supabase
        .from('user_reward_redemptions')
        .insert({
          user_id: user.id,
          reward_id: rewardId,
          points_spent: reward.points_cost,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct points via transaction
      await supabase.from('loyalty_transactions').insert({
        user_id: user.id,
        points: -reward.points_cost,
        transaction_type: 'spend',
        source: 'reward_redemption',
        description: `Redeemed: ${reward.title}`,
        metadata: { reward_id: rewardId, redemption_id: data.id }
      });

      // Update total points
      await supabase
        .from('user_loyalty_points')
        .update({
          total_points: loyaltyPoints.total_points - reward.points_cost,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-loyalty-points'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-redemptions'] });
      toast.success('Ödül başarıyla kullanıldı!', {
        description: 'Talebiniz işleme alındı.'
      });
    },
    onError: (error: Error) => {
      toast.error('Ödül kullanılamadı', {
        description: error.message
      });
    }
  });

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return { name: 'Platinum', color: 'text-purple-600', nextTier: null, nextPoints: null };
      case 'gold':
        return { name: 'Gold', color: 'text-yellow-600', nextTier: 'Platinum', nextPoints: 10000 };
      case 'silver':
        return { name: 'Silver', color: 'text-gray-400', nextTier: 'Gold', nextPoints: 5000 };
      default:
        return { name: 'Bronze', color: 'text-orange-700', nextTier: 'Silver', nextPoints: 1000 };
    }
  };

  return {
    loyaltyPoints,
    transactions,
    rewards,
    redemptions,
    isLoading: isLoadingPoints || isLoadingTransactions || isLoadingRewards || isLoadingRedemptions,
    redeemReward: redeemRewardMutation.mutate,
    isRedeeming: redeemRewardMutation.isPending,
    getTierInfo
  };
};
