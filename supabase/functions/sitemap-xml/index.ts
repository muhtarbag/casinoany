// Serve the stored sitemap from database
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=UTF-8',
  'Cache-Control': 'public, max-age=0, must-revalidate',
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rateLimit = await checkRateLimit(supabase, ip, 'sitemap-xml');
    if (!rateLimit.allowed) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: { ...corsHeaders, 'Retry-After': String(rateLimit.retryAfter || 60) }
      });
    }

    // Get sitemap from database
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value, updated_at')
      .eq('setting_key', 'sitemap_xml')
      .maybeSingle();

    if (error) throw error;

    // If no sitemap in database, trigger generation
    if (!data) {
      console.log('No sitemap in database, triggering generation...');
      
      // Call update-sitemap function
      const updateResponse = await fetch(`${supabaseUrl}/functions/v1/update-sitemap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({ trigger: 'first_generation' }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to generate sitemap');
      }

      // Fetch newly generated sitemap
      const { data: newData, error: newError } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'sitemap_xml')
        .single();

      if (newError) throw newError;

      return new Response(newData.setting_value, {
        headers: {
          ...corsHeaders,
          'Last-Modified': new Date().toUTCString(),
        }
      });
    }

    return new Response(data.setting_value, {
      headers: {
        ...corsHeaders,
        'Last-Modified': data.updated_at ? new Date(data.updated_at).toUTCString() : new Date().toUTCString(),
      }
    });

  } catch (error) {
    console.error('Sitemap error:', error);
    
    // Return basic sitemap as fallback
    const baseUrl = 'https://www.casinoany.com';
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      headers: corsHeaders
    });
  }
});
