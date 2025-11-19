// Dynamic robots.txt with active domain sitemap URL
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/plain',
};

function isTrustedBot(userAgent: string): boolean {
  const trustedBots = [
    'Googlebot',
    'Google-InspectionTool',
    'Bingbot',
    'YandexBot',
    'AhrefsBot',
    'SemrushBot'
  ];
  return trustedBots.some(bot => userAgent.includes(bot));
}

async function checkRateLimit(supabase: any, ip: string, functionName: string, userAgent: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  // Whitelist trusted bots
  if (isTrustedBot(userAgent)) {
    return { allowed: true };
  }

  const now = new Date();
  const { data: banned } = await supabase.from('api_rate_limits').select('banned_until').eq('ip_address', ip).eq('function_name', functionName).gte('banned_until', now.toISOString()).maybeSingle();
  if (banned) return { allowed: false, retryAfter: Math.ceil((new Date(banned.banned_until).getTime() - now.getTime()) / 1000) };
  const windowStart = new Date(now.getTime() - 60000);
  const { data: existing } = await supabase.from('api_rate_limits').select('*').eq('ip_address', ip).eq('function_name', functionName).gte('window_start', windowStart.toISOString()).maybeSingle();
  if (existing) {
    if (existing.request_count >= 120) {
      await supabase.from('api_rate_limits').update({ banned_until: new Date(now.getTime() + 60000).toISOString(), updated_at: now.toISOString() }).eq('id', existing.id);
      return { allowed: false, retryAfter: 60 };
    }
    await supabase.from('api_rate_limits').update({ request_count: existing.request_count + 1, updated_at: now.toISOString() }).eq('id', existing.id);
    return { allowed: true };
  }
  await supabase.from('api_rate_limits').insert({ ip_address: ip, function_name: functionName, request_count: 1, window_start: now.toISOString() });
  return { allowed: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || '';

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rateLimit = await checkRateLimit(supabase, ip, 'robots', userAgent);
    if (!rateLimit.allowed) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: { ...corsHeaders, 'Retry-After': String(rateLimit.retryAfter || 60) }
      });
    }

    // Get primary active domain
    const { data: primaryDomain } = await supabase
      .rpc('get_primary_domain');

    const domain = primaryDomain || 'www.casinoany.com';

    // Multi-sitemap structure
    const sitemaps = [
      'sitemap.xml',
      'sitemap-pages.xml',
      'sitemap-casinos.xml',
      'sitemap-blogs.xml',
      'sitemap-bonuses.xml',
      'sitemap-news.xml',
      'sitemap-static.xml',
      'sitemap-images.xml',
    ];

    const robotsTxt = `# CasinoAny Robots.txt
User-agent: *
Allow: /

# Sitemaps
${sitemaps.map(s => `Sitemap: https://${domain}/${s}`).join('\n')}

# Admin areas
Disallow: /admin/
Disallow: /panel/
Disallow: /auth/
Disallow: /api/
`;

    return new Response(robotsTxt, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600',
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Robots.txt generation error:', errorMessage);
    
    // Fallback robots.txt
    const fallbackRobots = `User-agent: *
Allow: /
Sitemap: https://www.casinoany.com/sitemap.xml
`;

    return new Response(fallbackRobots, {
      headers: corsHeaders,
    });
  }
});
