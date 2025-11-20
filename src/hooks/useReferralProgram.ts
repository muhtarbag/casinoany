import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserReferral {
  id: string;
  user_id: string;
  referral_code: string;
  total_referrals: number;
  successful_referrals: number;
  total_points_earned: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralHistory {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'cancelled';
  points_awarded: number;
  created_at: string;
  completed_at?: string;
  referred_user?: {
    username?: string;
    email?: string;
  };
}

export const useReferralProgram = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's referral data
  const { data: referralData, isLoading: isLoadingReferral } = useQuery({
    queryKey: ['user-referral', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // If no referral data exists, create it
      if (!data) {
        const { data: newData, error: createError } = await supabase
          .from('user_referrals')
          .insert({
            user_id: user.id,
            referral_code: generateReferralCode()
          })
          .select()
          .single();

        if (createError) throw createError;
        return newData as UserReferral;
      }

      return data as UserReferral;
    },
    enabled: !!user,
  });

  // Fetch referral history
  const { data: referralHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['referral-history', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('referral_history')
        .select(`
          *,
          referred_user:profiles!referral_history_referred_id_fkey(username, email)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReferralHistory[];
    },
    enabled: !!user,
  });

  // Process referral code for new users
  const processReferralMutation = useMutation({
    mutationFn: async (referralCode: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('process_referral_signup', {
        p_referred_user_id: user.id,
        p_referral_code: referralCode
      });

      if (error) throw error;
      if (!data) throw new Error('Geçersiz davet kodu');
      
      return data;
    },
    onSuccess: () => {
      toast.success('Davet bonusu alındı!');
      queryClient.invalidateQueries({ queryKey: ['user-referral'] });
      queryClient.invalidateQueries({ queryKey: ['user-loyalty-points'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Davet işlenirken hata oluştu');
    }
  });

  // Generate referral link
  const getReferralLink = () => {
    if (!referralData?.referral_code) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/signup?ref=${referralData.referral_code}`;
  };

  // Copy referral link to clipboard
  const copyReferralLink = async () => {
    const link = getReferralLink();
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Davet linki kopyalandı!');
    } catch (error) {
      toast.error('Kopyalama başarısız');
    }
  };

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    const link = getReferralLink();
    const text = `Hey! Bu harika bahis sitelerine göz atmak için beni takip et. Kayıt olurken davet kodumu kullan: ${referralData?.referral_code}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text + '\n' + link)}`;
    window.open(url, '_blank');
  };

  // Share via Telegram
  const shareViaTelegram = () => {
    const link = getReferralLink();
    const text = `Bu harika bahis sitelerine göz at! Davet kodum: ${referralData?.referral_code}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Share via Email
  const shareViaEmail = () => {
    const link = getReferralLink();
    const subject = 'Sana özel davet!';
    const body = `Merhaba!\n\nBu harika bahis sitelerine göz atmak için beni takip et.\nDavet kodum: ${referralData?.referral_code}\n\nKayıt linki: ${link}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  return {
    referralData,
    referralHistory,
    isLoading: isLoadingReferral || isLoadingHistory,
    getReferralLink,
    copyReferralLink,
    shareViaWhatsApp,
    shareViaTelegram,
    shareViaEmail,
    processReferral: processReferralMutation.mutate,
    isProcessing: processReferralMutation.isPending
  };
};

// Helper function to generate referral code (fallback, server will generate the actual one)
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
