// Sitemap Cache Manager
// Manages in-memory cache for sitemap generation to reduce DB load

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache (resets on cold start)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCached(key: string) {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function checkRateLimit(supabase: any, ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = new Date();
  const { data: banned } = await supabase
    .from('api_rate_limits')
    .select('banned_until')
    .eq('ip_address', ip)
    .eq('function_name', 'sitemap-cache')
    .gte('banned_until', now.toISOString())
    .maybeSingle();

  if (banned) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((new Date(banned.banned_until).getTime() - now.getTime()) / 1000) 
    };
  }

  const windowStart = new Date(now.getTime() - 60000); // 1 minute window
  const { data: existing } = await supabase
    .from('api_rate_limits')
    .select('*')
    .eq('ip_address', ip)
    .eq('function_name', 'sitemap-cache')
    .gte('window_start', windowStart.toISOString())
    .maybeSingle();

  if (existing) {
    if (existing.request_count >= 30) { // Lower limit for cache endpoint
      await supabase
        .from('api_rate_limits')
        .update({ 
          banned_until: new Date(now.getTime() + 120000).toISOString(), // 2 min ban
          updated_at: now.toISOString() 
        })
        .eq('id', existing.id);
      return { allowed: false, retryAfter: 120 };
    }
    
    await supabase
      .from('api_rate_limits')
      .update({ 
        request_count: existing.request_count + 1,
        updated_at: now.toISOString() 
      })
      .eq('id', existing.id);
    return { allowed: true };
  }

  await supabase
    .from('api_rate_limits')
    .insert({ 
      ip_address: ip,
      function_name: 'sitemap-cache',
      request_count: 1,
      window_start: now.toISOString() 
    });
  return { allowed: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             req.headers.get('x-real-ip') || 
             'unknown';

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Rate limit check
    const rateLimit = await checkRateLimit(supabase, ip);
    if (!rateLimit.allowed) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Retry-After': String(rateLimit.retryAfter || 120),
          'Content-Type': 'application/json'
        }
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'stats';

    if (action === 'stats') {
      // Return cache statistics
      const stats = {
        entries: cache.size,
        cached_keys: Array.from(cache.keys()),
        cache_ttl_minutes: CACHE_TTL / 60000,
      };
      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'clear') {
      // Clear cache (admin only)
      cache.clear();
      return new Response(JSON.stringify({ message: 'Cache cleared' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'get') {
      const key = url.searchParams.get('key');
      if (!key) {
        return new Response(JSON.stringify({ error: 'Key required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const cached = getCached(key);
      if (cached) {
        return new Response(JSON.stringify({ cached: true, data: cached }), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Cache': 'HIT'
          }
        });
      }

      return new Response(JSON.stringify({ cached: false }), {
        status: 404,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Cache': 'MISS'
        }
      });
    }

    if (action === 'set') {
      const key = url.searchParams.get('key');
      if (!key) {
        return new Response(JSON.stringify({ error: 'Key required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const body = await req.json();
      setCache(key, body.data);

      return new Response(JSON.stringify({ message: 'Cached successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Cache manager error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
