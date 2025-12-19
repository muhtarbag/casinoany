// Bot Analytics Tracker
// Tracks bot behavior and provides analytics dashboard

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BotVisit {
  user_agent: string;
  ip_address: string;
  path: string;
  timestamp: string;
}

const trustedBots = [
  'Googlebot',
  'Google-InspectionTool',
  'Bingbot',
  'YandexBot',
  'Slurp',
  'DuckDuckBot'
];

const blockedBots = [
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'BLEXBot',
  'GPTBot',
  'ChatGPT-User',
  'CCBot',
  'anthropic-ai',
  'Claude-Web'
];

function detectBotType(userAgent: string): 'trusted' | 'blocked' | 'unknown' {
  for (const bot of trustedBots) {
    if (userAgent.includes(bot)) return 'trusted';
  }
  for (const bot of blockedBots) {
    if (userAgent.includes(bot)) return 'blocked';
  }
  return 'unknown';
}

function getBotName(userAgent: string): string {
  const allBots = [...trustedBots, ...blockedBots];
  for (const bot of allBots) {
    if (userAgent.includes(bot)) return bot;
  }
  return 'Unknown Bot';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'track';

    if (action === 'track') {
      // Track a bot visit
      const body = await req.json() as BotVisit;
      const botType = detectBotType(body.user_agent);
      const botName = getBotName(body.user_agent);

      // Log to system_logs
      await supabase.rpc('log_system_event', {
        p_log_type: 'bot_visit',
        p_severity: botType === 'blocked' ? 'warning' : 'info',
        p_action: 'crawl',
        p_resource: body.path,
        p_details: {
          bot_type: botType,
          bot_name: botName,
          user_agent: body.user_agent,
          ip: body.ip_address
        }
      });

      return new Response(JSON.stringify({ 
        tracked: true,
        bot_type: botType,
        bot_name: botName
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'analytics') {
      // Get bot analytics
      const days = parseInt(url.searchParams.get('days') || '7');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: logs } = await supabase
        .from('system_logs')
        .select('*')
        .eq('log_type', 'bot_visit')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (!logs) {
        return new Response(JSON.stringify({ error: 'No data found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Aggregate statistics
      const stats = {
        total_visits: logs.length,
        by_bot_type: {} as Record<string, number>,
        by_bot_name: {} as Record<string, number>,
        top_paths: {} as Record<string, number>,
        trusted_bot_visits: 0,
        blocked_bot_visits: 0,
        unknown_bot_visits: 0,
      };

      logs.forEach(log => {
        const botType = (log.details as any)?.bot_type || 'unknown';
        const botName = (log.details as any)?.bot_name || 'Unknown';
        const path = log.resource || '/';

        stats.by_bot_type[botType] = (stats.by_bot_type[botType] || 0) + 1;
        stats.by_bot_name[botName] = (stats.by_bot_name[botName] || 0) + 1;
        stats.top_paths[path] = (stats.top_paths[path] || 0) + 1;

        if (botType === 'trusted') stats.trusted_bot_visits++;
        else if (botType === 'blocked') stats.blocked_bot_visits++;
        else stats.unknown_bot_visits++;
      });

      // Sort and limit top items
      stats.top_paths = Object.fromEntries(
        Object.entries(stats.top_paths)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
      );

      stats.by_bot_name = Object.fromEntries(
        Object.entries(stats.by_bot_name)
          .sort(([,a], [,b]) => b - a)
      );

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'recent') {
      // Get recent bot visits
      const limit = parseInt(url.searchParams.get('limit') || '50');

      const { data: logs } = await supabase
        .from('system_logs')
        .select('*')
        .eq('log_type', 'bot_visit')
        .order('created_at', { ascending: false })
        .limit(limit);

      const visits = logs?.map(log => ({
        timestamp: log.created_at,
        bot_name: (log.details as any)?.bot_name,
        bot_type: (log.details as any)?.bot_type,
        path: log.resource,
        ip: (log.details as any)?.ip,
      })) || [];

      return new Response(JSON.stringify({ visits }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Bot analytics error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
