// Static Pages Sitemap
// Handles homepage, about, contact, terms, privacy, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const rateLimit = await checkRateLimit(supabase, ip, 'sitemap-pages', userAgent);
    if (!rateLimit.allowed) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: { ...corsHeaders, 'Retry-After': String(rateLimit.retryAfter || 60) }
      });
    }

    const { data: primaryDomain } = await supabase.rpc('get_primary_domain');
    const domain = primaryDomain || 'www.casinoany.com';

    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/about', priority: '0.8', changefreq: 'monthly' },
      { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
      { loc: '/privacy', priority: '0.5', changefreq: 'yearly' },
      { loc: '/terms', priority: '0.5', changefreq: 'yearly' },
      { loc: '/cookies', priority: '0.5', changefreq: 'yearly' },
      { loc: '/kvkk', priority: '0.5', changefreq: 'yearly' },
      { loc: '/casino-sites', priority: '0.9', changefreq: 'daily' },
      { loc: '/sports-betting', priority: '0.9', changefreq: 'daily' },
      { loc: '/live-casino', priority: '0.9', changefreq: 'daily' },
      { loc: '/mobile-betting', priority: '0.9', changefreq: 'daily' },
      { loc: '/deneme-bonusu', priority: '0.9', changefreq: 'daily' },
      { loc: '/bonus-campaigns', priority: '0.9', changefreq: 'daily' },
      { loc: '/blog', priority: '0.8', changefreq: 'daily' },
      { loc: '/news', priority: '0.8', changefreq: 'hourly' },
      { loc: '/complaints', priority: '0.7', changefreq: 'daily' },
      { loc: '/categories', priority: '0.8', changefreq: 'weekly' },
    ];

    const lastmod = new Date().toISOString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticPages
  .map(
    (page) => `  <url>
    <loc>https://${domain}${page.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap-pages error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: corsHeaders, status: 500 }
    );
  }
});
