// Deno edge function for keyword ranking tracking
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KeywordData {
  keyword: string;
  post_id: string;
  current_rank?: number;
  target_rank?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 🔐 JWT + Admin verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Admin verified:', user.email);

    const { action, data } = await req.json();
    console.log('Keyword tracker action:', action, 'by', user.email);

    if (action === 'track-keyword') {
      // Add new keyword to track
      const result = await trackNewKeyword(data);
      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'update-rankings') {
      // Update all keyword rankings (cron job calls this)
      const result = await updateAllRankings();
      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'get-performance-report') {
      // Get performance report for a post or all posts
      const result = await getPerformanceReport(data);
      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Keyword tracker error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function trackNewKeyword(data: KeywordData) {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Simulate initial ranking check (in production, use real SEO API)
  const estimatedRank = Math.floor(Math.random() * 100) + 1;
  const searchVolume = Math.floor(Math.random() * 5000) + 100;
  const difficulty = Math.floor(Math.random() * 100) + 1;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/seo_keywords`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      keyword: data.keyword,
      related_post_id: data.post_id,
      current_rank: estimatedRank,
      target_rank: data.target_rank || 10,
      search_volume: searchVolume,
      difficulty: difficulty,
      status: 'tracking',
      metadata: {
        first_tracked: new Date().toISOString(),
        tracking_history: [{
          date: new Date().toISOString(),
          rank: estimatedRank
        }]
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to track keyword: ${error}`);
  }

  return await response.json();
}

async function updateAllRankings() {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Get all tracked keywords
  const keywordsResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/seo_keywords?status=eq.tracking&select=*`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      }
    }
  );

  if (!keywordsResponse.ok) {
    throw new Error('Failed to fetch keywords');
  }

  const keywords = await keywordsResponse.json();
  const updates = [];

  for (const keyword of keywords) {
    // Simulate ranking change (in production, use real SEO API like SerpAPI or DataForSEO)
    const rankChange = Math.floor(Math.random() * 11) - 5; // -5 to +5
    const newRank = Math.max(1, Math.min(100, (keyword.current_rank || 50) + rankChange));
    
    // Update tracking history
    const history = keyword.metadata?.tracking_history || [];
    history.push({
      date: new Date().toISOString(),
      rank: newRank,
      change: rankChange
    });

    // Keep only last 30 days of history
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filteredHistory = history.filter((h: any) => 
      new Date(h.date) > thirtyDaysAgo
    );

    // Determine status based on performance
    let status = 'tracking';
    if (newRank <= keyword.target_rank) {
      status = 'achieved';
    } else if (newRank > (keyword.current_rank || 50)) {
      status = 'declining';
    } else if (newRank < (keyword.current_rank || 50)) {
      status = 'improving';
    }

    // Update keyword
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/seo_keywords?id=eq.${keyword.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          current_rank: newRank,
          status: status,
          metadata: {
            ...keyword.metadata,
            tracking_history: filteredHistory,
            last_updated: new Date().toISOString(),
            total_change: newRank - (filteredHistory[0]?.rank || newRank),
            average_rank: filteredHistory.reduce((sum: number, h: any) => sum + h.rank, 0) / filteredHistory.length
          }
        })
      }
    );

    if (updateResponse.ok) {
      updates.push({
        keyword: keyword.keyword,
        old_rank: keyword.current_rank,
        new_rank: newRank,
        change: rankChange,
        status: status
      });
    }
  }

  return {
    updated_count: updates.length,
    updates: updates,
    timestamp: new Date().toISOString()
  };
}

async function getPerformanceReport(data: any) {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  let query = `${SUPABASE_URL}/rest/v1/seo_keywords?select=*`;
  if (data?.post_id) {
    query += `&related_post_id=eq.${data.post_id}`;
  }

  const response = await fetch(query, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch performance data');
  }

  const keywords = await response.json();

  // Calculate performance metrics
  const totalKeywords = keywords.length;
  const achievedTargets = keywords.filter((k: any) => k.status === 'achieved').length;
  const improving = keywords.filter((k: any) => k.status === 'improving').length;
  const declining = keywords.filter((k: any) => k.status === 'declining').length;

  const averageRank = keywords.reduce((sum: number, k: any) => 
    sum + (k.current_rank || 0), 0) / (totalKeywords || 1);

  const topPerformers = keywords
    .filter((k: any) => k.current_rank && k.current_rank <= 10)
    .sort((a: any, b: any) => a.current_rank - b.current_rank)
    .slice(0, 5);

  const needsImprovement = keywords
    .filter((k: any) => k.current_rank && k.current_rank > 50)
    .sort((a: any, b: any) => b.current_rank - a.current_rank)
    .slice(0, 5);

  // Calculate trends
  const trends = keywords.map((k: any) => {
    const history = k.metadata?.tracking_history || [];
    if (history.length < 2) return null;

    const recentHistory = history.slice(-7); // Last 7 entries
    const avgRecent = recentHistory.reduce((sum: number, h: any) => sum + h.rank, 0) / recentHistory.length;
    const firstRank = recentHistory[0].rank;
    
    return {
      keyword: k.keyword,
      trend: avgRecent < firstRank ? 'up' : avgRecent > firstRank ? 'down' : 'stable',
      change: firstRank - avgRecent
    };
  }).filter(Boolean);

  return {
    summary: {
      total_keywords: totalKeywords,
      achieved_targets: achievedTargets,
      improving: improving,
      declining: declining,
      average_rank: Math.round(averageRank),
      success_rate: totalKeywords > 0 ? Math.round((achievedTargets / totalKeywords) * 100) : 0
    },
    top_performers: topPerformers,
    needs_improvement: needsImprovement,
    trends: trends,
    all_keywords: keywords
  };
}
