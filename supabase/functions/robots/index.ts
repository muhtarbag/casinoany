// Dynamic robots.txt with active domain sitemap URL
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/plain',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
