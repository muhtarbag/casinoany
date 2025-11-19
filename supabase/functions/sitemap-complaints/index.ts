// Complaints Sitemap
// Handles all site complaints

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

    const rateLimit = await checkRateLimit(supabase, ip, 'sitemap-complaints', userAgent);
    if (!rateLimit.allowed) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: { ...corsHeaders, 'Retry-After': String(rateLimit.retryAfter || 60) }
      });
    }

    const { data: primaryDomain } = await supabase.rpc('get_primary_domain');
    const domain = primaryDomain || 'www.casinoany.com';

    // Fetch all published complaints
    const { data: complaints, error } = await supabase
      .from('site_complaints')
      .select(`
        id,
        created_at,
        updated_at,
        status,
        betting_sites!inner(slug)
      `)
      .order('created_at', { ascending: false })
      .limit(50000);

    if (error) throw error;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${(complaints || [])
  .map((complaint: any) => {
    const lastmod = complaint.updated_at
      ? new Date(complaint.updated_at).toISOString()
      : new Date(complaint.created_at).toISOString();
    
    // Active complaints get higher priority
    const priority = complaint.status === 'resolved' ? '0.6' : '0.7';
    const changefreq = complaint.status === 'resolved' ? 'monthly' : 'weekly';

    return `  <url>
    <loc>https://${domain}/complaint/${complaint.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=7200',
      },
    });
  } catch (error) {
    console.error('Sitemap-complaints error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: corsHeaders, status: 500 }
    );
  }
});
