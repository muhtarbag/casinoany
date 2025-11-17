import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, CACHE_TIMES } from '@/lib/queryClient';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  icon: string;
  color: string;
  display_order: number;
  is_active: boolean;
  content: string | null;
  content_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithStats extends Category {
  site_count: number;
  blog_count: number;
}

export interface CategoryDetail extends Category {
  sites: any[];
  blogs: any[];
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  content?: string;
  icon?: string;
  color?: string;
  display_order?: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
  is_active?: boolean;
}

// ============================================
// QUERY KEYS
// ============================================

const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters?: any) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (slug: string) => [...categoryKeys.details(), slug] as const,
  stats: () => [...categoryKeys.all, 'stats'] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Tüm kategorileri getir
 */
export const useCategories = (filters?: {
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Category[];
    },
    staleTime: CACHE_TIMES.LONG,
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * İstatistiklerle birlikte kategorileri getir
 */
export const useCategoriesWithStats = () => {
  return useQuery({
    queryKey: categoryKeys.stats(),
    queryFn: async () => {
      // ✅ OPTIMIZED: Single parallel query instead of N+1
      const [
        { data: categories, error: catError },
        { data: siteCounts, error: siteError },
        { data: blogCounts, error: blogError }
      ] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true }),
        supabase
          .from('site_categories')
          .select('category_id'),
        supabase
          .from('blog_posts')
          .select('category_id')
          .eq('is_published', true)
      ]);

      if (catError) throw catError;
      if (siteError) throw siteError;
      if (blogError) throw blogError;

      // Count in memory instead of N database queries
      const siteCountMap = new Map<string, number>();
      siteCounts?.forEach((sc) => {
        siteCountMap.set(sc.category_id, (siteCountMap.get(sc.category_id) || 0) + 1);
      });

      const blogCountMap = new Map<string, number>();
      blogCounts?.forEach((bc) => {
        blogCountMap.set(bc.category_id, (blogCountMap.get(bc.category_id) || 0) + 1);
      });

      const categoriesWithStats = (categories || []).map((category) => ({
        ...category,
        site_count: siteCountMap.get(category.id) || 0,
        blog_count: blogCountMap.get(category.id) || 0,
      }));

      return categoriesWithStats as CategoryWithStats[];
    },
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Tek kategori detayı (slug ile)
 */
export const useCategory = (slug: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle(); // ✅ FIX: Use maybeSingle to prevent crash

      if (error) throw error;
      if (!data) throw new Error('Category not found');
      return data as Category;
    },
    staleTime: CACHE_TIMES.VERY_LONG,
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false, // Category detail rarely changes
    enabled: !!slug,
  });
};

/**
 * Kategori + ilişkili siteler + bloglar
 */
export const useCategoryWithRelations = (slug: string) => {
  return useQuery({
    queryKey: [...categoryKeys.detail(slug), 'relations'],
    queryFn: async () => {
      // 1. Kategori bilgisini al
      const { data: category, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (catError) throw catError;

      // 2. İlişkili siteleri al
      const { data: siteRelations, error: siteError } = await supabase
        .from('site_categories')
        .select(`
          display_order,
          betting_sites (*)
        `)
        .eq('category_id', category.id)
        .order('display_order', { ascending: true });

      if (siteError) throw siteError;

      const sites = (siteRelations || [])
        .map((rel: any) => rel.betting_sites)
        .filter(Boolean)
        .filter((site: any) => site.is_active);

      // 3. İlişkili blog yazılarını al
      const { data: blogs, error: blogError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category_id', category.id)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(10);

      if (blogError) throw blogError;

      return {
        ...category,
        sites: sites || [],
        blogs: blogs || [],
      } as CategoryDetail;
    },
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!slug,
  });
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Yeni kategori oluştur
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: input.name,
          slug: input.slug,
          description: input.description,
          meta_title: input.meta_title,
          meta_description: input.meta_description,
          icon: input.icon || 'folder',
          color: input.color || '#3b82f6',
          display_order: input.display_order || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Kategori başarıyla oluşturuldu');
    },
    onError: (error: any) => {
      toast.error('Kategori oluşturulamadı', {
        description: error.message,
      });
    },
  });
};

/**
 * Kategori güncelle
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCategoryInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Kategori başarıyla güncellendi');
    },
    onError: (error: any) => {
      toast.error('Kategori güncellenemedi', {
        description: error.message,
      });
    },
  });
};

/**
 * Kategori sil
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      // Önce ilişkili kayıtları kontrol et
      const { count: siteCount } = await supabase
        .from('site_categories')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);

      const { count: blogCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);

      if ((siteCount || 0) > 0 || (blogCount || 0) > 0) {
        throw new Error(
          'Bu kategoriye bağlı siteler veya blog yazıları var. Önce bunları kaldırın.'
        );
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Kategori başarıyla silindi');
    },
    onError: (error: any) => {
      toast.error('Kategori silinemedi', {
        description: error.message,
      });
    },
  });
};

/**
 * Site'ye kategoriler ata/güncelle
 */
export const useUpdateSiteCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      siteId,
      categoryIds,
    }: {
      siteId: string;
      categoryIds: string[];
    }) => {
      // 1. Mevcut ilişkileri sil
      const { error: deleteError } = await supabase
        .from('site_categories')
        .delete()
        .eq('site_id', siteId);

      if (deleteError) throw deleteError;

      // 2. Yeni ilişkileri ekle
      if (categoryIds.length > 0) {
        const insertData = categoryIds.map((categoryId, index) => ({
          site_id: siteId,
          category_id: categoryId,
          display_order: index,
        }));

        const { error: insertError } = await supabase
          .from('site_categories')
          .insert(insertData);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.list() });
      toast.success('Site kategorileri güncellendi');
    },
    onError: (error: any) => {
      toast.error('Site kategorileri güncellenemedi', {
        description: error.message,
      });
    },
  });
};

/**
 * Blog yazısına kategori ata
 */
export const useUpdateBlogCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      blogId,
      categoryId,
    }: {
      blogId: string;
      categoryId: string | null;
    }) => {
      const { error } = await supabase
        .from('blog_posts')
        .update({ category_id: categoryId })
        .eq('id', blogId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Blog kategorisi güncellendi');
    },
    onError: (error: any) => {
      toast.error('Blog kategorisi güncellenemedi', {
        description: error.message,
      });
    },
  });
};

/**
 * Kategori sıralamasını güncelle
 */
export const useUpdateCategoryOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categories: { id: string; display_order: number }[]) => {
      const updates = categories.map((cat) =>
        supabase
          .from('categories')
          .update({ display_order: cat.display_order })
          .eq('id', cat.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter((r) => r.error);

      if (errors.length > 0) {
        throw new Error('Bazı kategoriler güncellenemedi');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Kategori sıralaması güncellendi');
    },
    onError: (error: any) => {
      toast.error('Sıralama güncellenemedi', {
        description: error.message,
      });
    },
  });
};
