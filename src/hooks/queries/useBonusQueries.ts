import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_DEFAULTS, queryKeys } from '@/lib/queryClient';

export const useBonusOffers = () => {
  return useQuery({
    queryKey: [...queryKeys.sites.all, 'bonus-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bonus_offers')
        .select('*, betting_sites(name, logo_url, slug, affiliate_link)')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    // STANDARDIZED: Static content (bonus offers nadiren değişir)
    ...QUERY_DEFAULTS.static,
  });
};

export const useCMSContent = () => {
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'cms-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('setting_key', [
          'hero_title',
          'hero_description',
          'about_title',
          'about_description',
          'about_mission',
          'about_vision',
          'footer_description',
          'footer_email',
          'footer_telegram',
        ]);
      
      if (error) throw error;
      
      const contentMap: Record<string, string> = {};
      data?.forEach(item => {
        contentMap[item.setting_key] = item.setting_value;
      });
      return contentMap;
    },
    // STANDARDIZED: Content (CMS settings nadiren değişir)
    ...QUERY_DEFAULTS.content,
  });
};
