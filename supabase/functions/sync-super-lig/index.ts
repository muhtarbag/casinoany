import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TheSportsDB API - Ücretsiz, Turkish Super Lig
const SUPER_LIG_ID = '4367'; // Turkish Super Lig ID
const API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';

interface Team {
  idTeam: string;
  strTeam: string;
  strTeamShort: string;
  strTeamBadge: string;
  strStadium: string;
  strManager: string;
  intFormedYear: string;
}

interface Standing {
  idTeam: string;
  intRank: string;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
}

interface Event {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string;
  intAwayScore: string;
  dateEvent: string;
  strTime: string;
  intRound: string;
  strStatus: string;
  strVenue: string;
  idHomeTeam: string;
  idAwayTeam: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting Super Lig data sync...');

    // 1. Fetch and sync teams
    console.log('Fetching teams...');
    const teamsResponse = await fetch(`${API_BASE}/lookup_all_teams.php?id=${SUPER_LIG_ID}`);
    const teamsData = await teamsResponse.json();
    const teams = teamsData.teams as Team[];

    const teamIdMap: Record<string, string> = {};

    for (const team of teams) {
      try {
        const { data: existingTeam } = await supabase
          .from('super_lig_teams')
          .select('id')
          .eq('name', team.strTeam)
          .maybeSingle();

        if (existingTeam) {
          teamIdMap[team.idTeam] = existingTeam.id;
          
          // Update existing team
          await supabase
            .from('super_lig_teams')
            .update({
              short_name: team.strTeamShort,
              logo_url: team.strTeamBadge,
              stadium: team.strStadium,
              coach: team.strManager,
              founded_year: team.intFormedYear ? parseInt(team.intFormedYear) : null,
            })
            .eq('id', existingTeam.id);
        } else {
          // Insert new team
          const { data: newTeam } = await supabase
            .from('super_lig_teams')
            .insert({
              name: team.strTeam,
              short_name: team.strTeamShort,
              logo_url: team.strTeamBadge,
              stadium: team.strStadium,
              coach: team.strManager,
              founded_year: team.intFormedYear ? parseInt(team.intFormedYear) : null,
            })
            .select('id')
            .single();

          if (newTeam) {
            teamIdMap[team.idTeam] = newTeam.id;
          }
        }
      } catch (error) {
        console.error(`Error syncing team ${team.strTeam}:`, error);
      }
    }

    console.log(`Synced ${teams.length} teams`);

    // 2. Fetch and sync standings
    console.log('Fetching standings...');
    try {
      const standingsResponse = await fetch(`${API_BASE}/lookuptable.php?l=${SUPER_LIG_ID}&s=2024-2025`);
      
      if (!standingsResponse.ok) {
        console.log(`Standings API returned status ${standingsResponse.status}, skipping...`);
      } else {
        const standingsText = await standingsResponse.text();
        
        if (!standingsText || standingsText.trim() === '' || standingsText.trim() === 'null') {
          console.log('No standings data available for 2024-2025 season, skipping...');
        } else {
          try {
            const standingsData = JSON.parse(standingsText);
            const standings = standingsData.table as Standing[];

            if (standings && standings.length > 0) {
              for (const standing of standings) {
                try {
                  const teamId = teamIdMap[standing.idTeam];
                  if (!teamId) continue;

                  await supabase
                    .from('super_lig_standings')
                    .upsert({
                      team_id: teamId,
                      season: '2024-2025',
                      position: parseInt(standing.intRank),
                      played: parseInt(standing.intPlayed),
                      won: parseInt(standing.intWin),
                      drawn: parseInt(standing.intDraw),
                      lost: parseInt(standing.intLoss),
                      goals_for: parseInt(standing.intGoalsFor),
                      goals_against: parseInt(standing.intGoalsAgainst),
                      goal_difference: parseInt(standing.intGoalDifference),
                      points: parseInt(standing.intPoints),
                    }, {
                      onConflict: 'team_id,season'
                    });
                } catch (error) {
                  console.error('Error syncing standing:', error);
                }
              }
              console.log(`Synced ${standings.length} standings`);
            } else {
              console.log('Standings array is empty or null');
            }
          } catch (parseError) {
            console.error('Error parsing standings JSON:', parseError);
            console.log('Standings response text:', standingsText.substring(0, 200));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching standings:', error);
      console.log('Continuing without standings data...');
    }

    // 3. Fetch and sync fixtures (last 15 and next 15 matches)
    console.log('Fetching fixtures...');
    
    let allMatches: Event[] = [];
    
    // Get last 15 matches
    try {
      const lastMatchesResponse = await fetch(`${API_BASE}/eventspastleague.php?id=${SUPER_LIG_ID}`);
      
      if (lastMatchesResponse.ok) {
        const lastMatchesText = await lastMatchesResponse.text();
        
        if (lastMatchesText && lastMatchesText.trim() !== '' && lastMatchesText.trim() !== 'null') {
          try {
            const lastMatchesData = JSON.parse(lastMatchesText);
            const lastMatches = (lastMatchesData.events || []).slice(0, 15) as Event[];
            allMatches = [...allMatches, ...lastMatches];
            console.log(`Fetched ${lastMatches.length} past matches`);
          } catch (parseError) {
            console.error('Error parsing past matches JSON:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching past matches:', error);
    }

    // Get next 15 matches
    try {
      const nextMatchesResponse = await fetch(`${API_BASE}/eventsnextleague.php?id=${SUPER_LIG_ID}`);
      
      if (nextMatchesResponse.ok) {
        const nextMatchesText = await nextMatchesResponse.text();
        
        if (nextMatchesText && nextMatchesText.trim() !== '' && nextMatchesText.trim() !== 'null') {
          try {
            const nextMatchesData = JSON.parse(nextMatchesText);
            const nextMatches = (nextMatchesData.events || []).slice(0, 15) as Event[];
            allMatches = [...allMatches, ...nextMatches];
            console.log(`Fetched ${nextMatches.length} upcoming matches`);
          } catch (parseError) {
            console.error('Error parsing upcoming matches JSON:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
    }

    for (const match of allMatches) {
      try {
        const homeTeamId = teamIdMap[match.idHomeTeam];
        const awayTeamId = teamIdMap[match.idAwayTeam];
        
        if (!homeTeamId || !awayTeamId) continue;

        // Determine status
        let status = 'scheduled';
        if (match.strStatus === 'FT') status = 'finished';
        else if (match.strStatus === 'LIVE') status = 'live';
        else if (match.strStatus === 'Postponed') status = 'postponed';

        const matchDate = match.dateEvent && match.strTime 
          ? new Date(`${match.dateEvent}T${match.strTime}`)
          : null;

        const { data: existingMatch } = await supabase
          .from('super_lig_fixtures')
          .select('id')
          .eq('home_team_id', homeTeamId)
          .eq('away_team_id', awayTeamId)
          .eq('week', parseInt(match.intRound || '0'))
          .eq('season', '2024-2025')
          .maybeSingle();

        if (existingMatch) {
          // Update existing match
          await supabase
            .from('super_lig_fixtures')
            .update({
              match_date: matchDate?.toISOString(),
              home_score: match.intHomeScore ? parseInt(match.intHomeScore) : null,
              away_score: match.intAwayScore ? parseInt(match.intAwayScore) : null,
              status: status,
              venue: match.strVenue,
            })
            .eq('id', existingMatch.id);
        } else {
          // Insert new match
          await supabase
            .from('super_lig_fixtures')
            .insert({
              season: '2024-2025',
              week: parseInt(match.intRound || '0'),
              home_team_id: homeTeamId,
              away_team_id: awayTeamId,
              match_date: matchDate?.toISOString(),
              home_score: match.intHomeScore ? parseInt(match.intHomeScore) : null,
              away_score: match.intAwayScore ? parseInt(match.intAwayScore) : null,
              status: status,
              venue: match.strVenue,
            });
        }
      } catch (error) {
        console.error('Error syncing match:', error);
      }
    }

    console.log(`Synced ${allMatches.length} fixtures`);

    // Get final standings count
    const { count: standingsCount } = await supabase
      .from('super_lig_standings')
      .select('*', { count: 'exact', head: true })
      .eq('season', '2024-2025');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Super Lig data synced successfully',
        stats: {
          teams: teams.length,
          standings: standingsCount || 0,
          fixtures: allMatches.length,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error syncing Super Lig data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        error: 'Failed to sync Super Lig data',
        details: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
