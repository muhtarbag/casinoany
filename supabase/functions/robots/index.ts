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

    const robotsTxt = `# CasinoAny - Türkiye'nin En İyi Casino ve Bahis Siteleri Karşılaştırma Platformu
# Son güncelleme: ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /

# Ana sitemap
Sitemap: https://${domain}/sitemap.xml

# Crawl rate - Arama motorlarına optimize
# Google
User-agent: Googlebot
Crawl-delay: 1

# Bing
User-agent: Bingbot
Crawl-delay: 2

# Yandex
User-agent: YandexBot
Crawl-delay: 3

# Yahoo
User-agent: Slurp
Crawl-delay: 3

# SEO Tool botlarını engelle
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: BLEXBot
Disallow: /

# Admin ve hassas sayfalar
Disallow: /admin/
Disallow: /login
Disallow: /signup
Disallow: /api/

# Tracking parametrelerini temizle
# Yandex için
User-agent: YandexBot
Clean-param: utm_source&utm_medium&utm_campaign&fbclid&gclid

# Önemli: CSS, JS ve görsellere izin ver
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
Allow: /banners/
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
