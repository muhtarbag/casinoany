import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, CACHE_TIMES, REFETCH_INTERVALS } from '@/lib/queryClient';
import { toast } from 'sonner';

// News listesi query
export const useNewsArticles = (filters?: { 
  isPublished?: boolean;
  category?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.news.list(filters),
    queryFn: async () => {
      let query = (supabase as any)
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false });

      if (filters?.isPublished !== undefined) {
        query = query.eq('is_published', filters.isPublished);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.MEDIUM,
    refetchInterval: REFETCH_INTERVALS.NORMAL,
  });
};

// Tek news article query
export const useNewsArticle = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.news.detail(slug),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('news_articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: CACHE_TIMES.LONG,
    enabled: !!slug,
  });
};

// News delete mutation
export const useDeleteNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
      toast.success('Haber başarıyla silindi');
    },
    onError: (error: any) => {
      toast.error('Haber silinirken hata oluştu: ' + error.message);
    },
  });
};

// News publish toggle mutation
export const useToggleNewsPublish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { error } = await (supabase as any)
        .from('news_articles')
        .update({ is_published: !isPublished })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
      toast.success('Haber durumu güncellendi');
    },
    onError: (error: any) => {
      toast.error('Haber güncellenirken hata oluştu: ' + error.message);
    },
  });
};

// View count artırma
export const useIncrementNewsView = () => {
  return useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await (supabase as any)
        .rpc('increment_news_view_count', { article_id: articleId });
      
      if (error) throw error;
    },
    // View count için toast gösterme
    onError: () => {
      // Sessizce başarısız ol
      console.error('View count artırılamadı');
    },
  });
};
