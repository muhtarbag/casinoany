// Image Sitemap
// Optimized for Google Images and Discover

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

    // Fetch casino logos
    const { data: sites, error: sitesError } = await supabase
      .from('betting_sites')
      .select('slug, name, logo_url')
      .eq('is_active', true)
      .not('logo_url', 'is', null)
      .limit(10000);

    // Fetch blog featured images
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('slug, title, featured_image')
      .eq('is_published', true)
      .not('featured_image', 'is', null)
      .limit(10000);

    if (sitesError || postsError) {
      throw sitesError || postsError;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${(sites || [])
  .map((site) => {
    return `  <url>
    <loc>https://${domain}/site/${site.slug}</loc>
    <image:image>
      <image:loc>${site.logo_url}</image:loc>
      <image:title>${site.name} Logo</image:title>
      <image:caption>CasinoAny'de ${site.name} - Güvenilir Casino Sitesi</image:caption>
    </image:image>
  </url>`;
  })
  .join('\n')}
${(posts || [])
  .map((post) => {
    return `  <url>
    <loc>https://${domain}/blog/${post.slug}</loc>
    <image:image>
      <image:loc>${post.featured_image}</image:loc>
      <image:title>${post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:title>
    </image:image>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=7200', // 2 hours
      },
    });
  } catch (error) {
    console.error('Sitemap-images error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: corsHeaders, status: 500 }
    );
  }
});
