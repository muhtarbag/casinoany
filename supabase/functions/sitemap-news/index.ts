// News Articles Sitemap
// Handles all published news with Google News support

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
