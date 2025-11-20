import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// İtibar skorunu getir
export const useReputationScore = (siteId: string) => {
  return useQuery({
    queryKey: ['reputation-score', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_reputation_scores')
        .select('*')
        .eq('site_id', siteId)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 dakika
    enabled: !!siteId,
  });
};

// Tüm site rozetlerini getir
export const useSiteBadges = (siteId: string) => {
  return useQuery({
    queryKey: ['site-badges', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_badges')
        .select('*')
        .eq('site_id', siteId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!siteId,
  });
};

// İtibar skoru hesapla
export const useCalculateReputationScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      const { data, error } = await supabase.rpc('calculate_reputation_score', {
        p_site_id: siteId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, siteId) => {
      queryClient.invalidateQueries({ queryKey: ['reputation-score', siteId] });
      toast.success('İtibar skoru güncellendi');
    },
    onError: () => {
      toast.error('İtibar skoru hesaplanamadı');
    },
  });
};

// This function has been removed - use individual site calculation instead
