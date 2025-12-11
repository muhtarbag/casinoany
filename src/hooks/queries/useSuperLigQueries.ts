import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';

export const useSuperLigStandings = (season: string = '2024-2025') => {
  return useQuery({
    queryKey: queryKeys.superLig.standings(season),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('super_lig_standings')
        .select(`
          *,
          team:super_lig_teams(*)
        `)
        .eq('season', season)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
};

export const useSuperLigFixtures = (season: string = '2024-2025', week?: number) => {
  return useQuery({
    queryKey: queryKeys.superLig.fixtures(season, week),
    queryFn: async () => {
      let query = supabase
        .from('super_lig_fixtures')
        .select(`
          *,
          home_team:super_lig_teams!super_lig_fixtures_home_team_id_fkey(*),
          away_team:super_lig_teams!super_lig_fixtures_away_team_id_fkey(*)
        `)
        .eq('season', season)
        .order('match_date', { ascending: true });

      if (week !== undefined) {
        query = query.eq('week', week);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSuperLigTeams = () => {
  return useQuery({
    queryKey: queryKeys.superLig.teams,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('super_lig_teams')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 60 * 1000, // 1 saat
  });
};
