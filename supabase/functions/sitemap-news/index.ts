// News Articles Sitemap
// Handles all published news with Google News support

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

    const rateLimit = await checkRateLimit(supabase, ip, 'sitemap-news', userAgent);
    if (!rateLimit.allowed) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: { ...corsHeaders, 'Retry-After': String(rateLimit.retryAfter || 60) }
      });
    }

    const { data: primaryDomain } = await supabase.rpc('get_primary_domain');
    const domain = primaryDomain || 'www.casinoany.com';

    // Fetch all published news articles
    const { data: news, error } = await supabase
      .from('news_articles')
      .select('slug, updated_at, published_at, title')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(50000);

    if (error) throw error;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${(news || [])
  .map((article) => {
    const lastmod = article.updated_at
      ? new Date(article.updated_at).toISOString()
      : new Date().toISOString();
    
    const publishDate = new Date(article.published_at || article.updated_at);
    
    // Recent news gets higher priority
    const daysSincePublish = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    const priority = daysSincePublish < 1 ? '1.0' :
                     daysSincePublish < 7 ? '0.9' : '0.8';

    return `  <url>
    <loc>https://${domain}/news/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>${priority}</priority>
    <news:news>
      <news:publication>
        <news:name>CasinoAny</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${publishDate.toISOString()}</news:publication_date>
      <news:title>${article.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</news:title>
    </news:news>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=1800', // 30 min for news
      },
    });
  } catch (error) {
    console.error('Sitemap-news error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: corsHeaders, status: 500 }
    );
  }
});
