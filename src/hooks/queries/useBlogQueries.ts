import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TypedDB, TypedRPC } from '@/lib/supabase-extended';
import { queryKeys, CACHE_TIMES, REFETCH_INTERVALS } from '@/lib/queryClient';
import { toast } from 'sonner';

// Blog posts listesi - Optimized caching
export const useBlogPosts = (filters?: {
  isPublished?: boolean;
  category?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.blog.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
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
    staleTime: CACHE_TIMES.LONG, // 15 minutes - blog content rarely changes
    gcTime: CACHE_TIMES.VERY_LONG, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Tek blog post
export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.blog.detail(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle(); // ✅ FIX: Use maybeSingle to prevent crash

      if (error) throw error;
      if (!data) throw new Error('Blog post not found');
      return data;
    },
    staleTime: CACHE_TIMES.LONG,
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false, // Blog content rarely changes
    enabled: !!slug,
  });
};

// Blog yorumları (profiller dahil) - Optimized
export const useBlogComments = (postId: string) => {
  return useQuery({
    queryKey: queryKeys.blog.comments(postId),
    queryFn: async () => {
      const { data: commentsData, error: commentsError } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Fetch profiles for authenticated users
      const userIds = commentsData
        .map((c: any) => c.user_id)
        .filter((id: string | null) => id !== null);

      let profilesData = [];
      if (userIds.length > 0) {
        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (profilesError) throw profilesError;
        profilesData = data || [];
      }

      // Combine comments with profiles
      const commentsWithProfiles = commentsData.map((comment: any) => {
        const profile = profilesData?.find((p: any) => p.id === comment.user_id);
        return {
          ...comment,
          profiles: profile ? { username: profile.username || 'Anonim' } : undefined,
        };
      });

      return commentsWithProfiles;
    },
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes - comments change moderately
    gcTime: CACHE_TIMES.LONG, // 15 minutes
    refetchOnWindowFocus: false,
    enabled: !!postId,
  });
};

// Blog stats
export const useBlogStats = () => {
  return useQuery({
    queryKey: queryKeys.blog.stats(),
    queryFn: async () => {
      const [postsRes, commentsRes] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('id, title, slug, view_count, created_at')
          .eq('is_published', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('blog_comments')
          .select('post_id')
          .eq('is_approved', true),
      ]);

      if (postsRes.error) throw postsRes.error;
      if (commentsRes.error) throw commentsRes.error;

      // Yorum sayılarını grupla
      const commentsByPost = (commentsRes.data || []).reduce((acc: any, comment: any) => {
        acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
        return acc;
      }, {});

      // Posts'a yorum sayılarını ekle
      return (postsRes.data || []).map((post: any) => ({
        ...post,
        comments_count: commentsByPost[post.id] || 0,
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// View count artırma
export const useIncrementBlogView = () => {
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await TypedRPC.incrementBlogViewCount(postId);
      
      if (error) throw error;
    },
    onError: () => {
      // Silent fail for analytics
    },
  });
};

// Yorum ekleme
export const useAddBlogComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comment: {
      post_id: string;
      name?: string;
      email?: string;
      comment: string;
      user_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('blog_comments')
        .insert(comment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.blog.comments(variables.post_id) 
      });
      toast.success('Yorumunuz onay bekliyor');
    },
    onError: (error: any) => {
      toast.error('Yorum eklenirken hata oluştu: ' + error.message);
    },
  });
};
