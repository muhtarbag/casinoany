import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * ✅ OPTIMIZE EDİLDİ: Global favorites hook
 * Tek query ile tüm favorileri çeker, kart başına query yapmaz
 */
export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Tek query - tüm favorileri Set olarak döner (O(1) lookup)
  const { data: favoritesSet, isLoading } = useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>();
      
      const { data, error } = await supabase
        .from('user_favorite_sites')
        .select('site_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return new Set(data?.map(f => f.site_id) || []);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - favoriler sık değişmez
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ siteId, isFavorite }: { siteId: string; isFavorite: boolean }) => {
      if (!user) {
        throw new Error('Favorilere eklemek için giriş yapmalısınız');
      }

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorite_sites')
          .delete()
          .eq('user_id', user.id)
          .eq('site_id', siteId);
        
        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorite_sites')
          .insert({
            user_id: user.id,
            site_id: siteId,
          });
        
        if (error) throw error;
      }

      return { siteId, isFavorite: !isFavorite };
    },
    onMutate: async ({ siteId, isFavorite }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['user-favorites', user?.id] });

      const previousFavorites = queryClient.getQueryData<Set<string>>(['user-favorites', user?.id]);

      queryClient.setQueryData<Set<string>>(['user-favorites', user?.id], (old) => {
        const newSet = new Set(old || []);
        if (isFavorite) {
          newSet.delete(siteId);
        } else {
          newSet.add(siteId);
        }
        return newSet;
      });

      return { previousFavorites };
    },
    onError: (error: any, _, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(['user-favorites', user?.id], context.previousFavorites);
      }
      toast.error(error.message || 'Bir hata oluştu');
    },
    onSuccess: (data) => {
      toast.success(data.isFavorite ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
    },
  });

  // Helper function - O(1) lookup
  const isFavorite = (siteId: string | undefined) => {
    if (!siteId) return false;
    if (!favoritesSet || !(favoritesSet instanceof Set)) return false;
    return favoritesSet.has(siteId);
  };

  return {
    favoritesSet: favoritesSet || new Set<string>(),
    isFavorite,
    toggleFavorite: toggleFavoriteMutation.mutate,
    isLoading,
    isToggling: toggleFavoriteMutation.isPending,
  };
};
