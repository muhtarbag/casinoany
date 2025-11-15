import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HomepageData {
  featuredSites: any[];
  allSites: any[];
  banners: any[];
  searchHistory: any[];
  notifications: any[];
  success: boolean;
  cached?: boolean;
  timestamp: string;
}

export const useHomepageData = () => {
  return useQuery({
    queryKey: ['homepage-data'],
    queryFn: async (): Promise<HomepageData> => {
      const { data, error } = await supabase.functions.invoke('homepage-data', {
        method: 'GET',
      });

      if (error) {
        console.error('Error fetching homepage data:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch homepage data');
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
