// Sitemap Index Engine
// Multi-sitemap architecture for enterprise SEO

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

    const sitemaps = [
      'sitemap-pages.xml',
      'sitemap-casinos.xml',
      'sitemap-blogs.xml',
      'sitemap-bonuses.xml',
      'sitemap-news.xml',
      'sitemap-static.xml',
      'sitemap-complaints.xml',
      'sitemap-images.xml',
    ];

    const lastmod = new Date().toISOString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sitemap) => `  <sitemap>
    <loc>https://${domain}/${sitemap}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap index error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>`,
      { headers: corsHeaders, status: 500 }
    );
  }
});
