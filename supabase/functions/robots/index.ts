const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the actual domain from the request
    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || '';
    const baseUrl = origin || `https://${req.headers.get('host')}` || 'https://casinoany.com';

    const robotsTxt = `# robots.txt - CasinoAny.com
# Tüm arama motorları için geçerli kurallar

User-agent: *
Allow: /
Allow: /blog
Allow: /blog/*
Allow: /site/*
Allow: /about
Allow: /casino-siteleri
Allow: /spor-bahisleri
Allow: /bonus-kampanyalari
Allow: /mobil-bahis
Allow: /canli-casino

# Admin ve kullanıcı sayfalarını engelle
Disallow: /admin
Disallow: /admin/*
Disallow: /login
Disallow: /signup

# Yasal sayfalar - izin ver ama düşük öncelik
Allow: /privacy
Allow: /terms
Allow: /cookies
Allow: /kvkk

# Sitemap konumu
Sitemap: ${baseUrl}/sitemap.xml

# Google Bot için özel ayarlar
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Bing Bot için özel ayarlar
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Yandex Bot için özel ayarlar
User-agent: Yandex
Allow: /
Crawl-delay: 1

# Genel crawl delay
Crawl-delay: 1
`;

    return new Response(robotsTxt, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
