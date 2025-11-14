import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBonusOffers = () => {
  return useQuery({
    queryKey: ['bonus-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bonus_offers')
        .select('*, betting_sites(name, logo_url, slug, affiliate_link)')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCMSContent = () => {
  return useQuery({
    queryKey: ['cms-content'],
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
  });
};
