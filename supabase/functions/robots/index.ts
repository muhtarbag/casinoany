// Dynamic robots.txt with active domain sitemap URL
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/plain',
};

async function checkRateLimit(supabase: any, ip: string, functionName: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = new Date();
  const { data: banned } = await supabase.from('api_rate_limits').select('banned_until').eq('ip_address', ip).eq('function_name', functionName).gte('banned_until', now.toISOString()).maybeSingle();
  if (banned) return { allowed: false, retryAfter: Math.ceil((new Date(banned.banned_until).getTime() - now.getTime()) / 1000) };
  const windowStart = new Date(now.getTime() - 60000);
  const { data: existing } = await supabase.from('api_rate_limits').select('*').eq('ip_address', ip).eq('function_name', functionName).gte('window_start', windowStart.toISOString()).maybeSingle();
  if (existing) {
    if (existing.request_count >= 60) {
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

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rateLimit = await checkRateLimit(supabase, ip, 'robots');
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

    const robotsTxt = `# CasinoAny - Dynamic Robots.txt
# Güncelleme: ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /

# Multi-sitemap index
${sitemaps.map(s => `Sitemap: https://${domain}/${s}`).join('\n')}

# Crawl rate optimization
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 2

User-agent: YandexBot
Crawl-delay: 3

# Block SEO scrapers
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: BLEXBot
Disallow: /

# Sensitive paths
Disallow: /admin/
Disallow: /login
Disallow: /signup
Disallow: /api/

# Clean tracking params (Yandex specific)
User-agent: YandexBot
Clean-param: utm_source&utm_medium&utm_campaign&fbclid&gclid

# Allow all static assets for better indexing
Allow: /*.css$
Allow: /*.js$
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.png$
Allow: /*.gif$
Allow: /*.svg$
Allow: /*.webp$
Allow: /assets/
Allow: /public/
Allow: /logos/
Allow: /cdn/
Allow: /images/
`;

    return new Response(robotsTxt, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600',
      },
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
