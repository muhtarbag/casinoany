import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QUERY_DEFAULTS, queryKeys } from '@/lib/queryClient';

export interface FooterLink {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  section: string;
  created_at: string;
  updated_at: string;
}

export const useFooterLinks = (section?: string) => {
  return useQuery({
    queryKey: [...queryKeys.footer.all, section],
    queryFn: async () => {
      let query = supabase
        .from('footer_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (section) {
        query = query.eq('section', section);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as FooterLink[];
    },
    ...QUERY_DEFAULTS.static,
  });
};

export const useAllFooterLinks = () => {
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'footer-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .order('section', { ascending: true })
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as FooterLink[];
    },
    ...QUERY_DEFAULTS.static,
  });
};

export const useCreateFooterLink = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newLink: Omit<FooterLink, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('footer_links')
        .insert([newLink])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.footer.all });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.all, 'footer-links'] });
      toast({
        title: 'Başarılı',
        description: 'Footer linki eklendi.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateFooterLink = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FooterLink> & { id: string }) => {
      const { data, error } = await supabase
        .from('footer_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.footer.all });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.all, 'footer-links'] });
      toast({
        title: 'Başarılı',
        description: 'Footer linki güncellendi.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteFooterLink = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('footer_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.footer.all });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.all, 'footer-links'] });
      toast({
        title: 'Başarılı',
        description: 'Footer linki silindi.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
