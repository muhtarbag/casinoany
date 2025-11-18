// Casino Sites Sitemap
// Handles all betting_sites with pagination support (50k URL limit)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { data: primaryDomain } = await supabase.rpc('get_primary_domain');
    const domain = primaryDomain || 'www.casinoany.com';

    // Fetch all active casino sites (limit 50,000 for sitemap)
    const { data: sites, error } = await supabase
      .from('betting_sites')
      .select('slug, updated_at, rating')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(50000);

    if (error) throw error;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${(sites || [])
  .map((site) => {
    const lastmod = site.updated_at
      ? new Date(site.updated_at).toISOString()
      : new Date().toISOString();
    
    // Priority based on rating
    const priority = site.rating >= 4.5 ? '1.0' : 
                     site.rating >= 4.0 ? '0.9' : 
                     site.rating >= 3.5 ? '0.8' : '0.7';

    return `  <url>
    <loc>https://${domain}/site/${site.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap-casinos error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: corsHeaders, status: 500 }
    );
  }
});
