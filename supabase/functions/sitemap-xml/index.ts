// Dynamic sitemap generator for Search Engine crawlers
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=UTF-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
  'X-Robots-Tag': 'noindex',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine base URL from request or env
    const requestUrl = new URL(req.url);
    const baseUrl = Deno.env.get('SITE_BASE_URL') || 
                    `${requestUrl.protocol}//${requestUrl.host}`;

    console.log('Generating sitemap for:', baseUrl);

    // Fetch all necessary data in parallel
    const [sitesResult, blogResult, newsResult, categoriesResult] = await Promise.all([
      supabase
        .from('betting_sites')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false }),
      
      supabase
        .from('blog_posts')
        .select('slug, updated_at, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false }),
      
      supabase
        .from('news_articles')
        .select('slug, updated_at, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false }),
      
      supabase
        .from('categories')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
    ]);

    const sites = sitesResult.data || [];
    const blogPosts = blogResult.data || [];
    const newsArticles = newsResult.data || [];
    const categories = categoriesResult.data || [];

    console.log(`Found: ${sites.length} sites, ${blogPosts.length} blog posts, ${newsArticles.length} news, ${categories.length} categories`);

    // Build XML sitemap
    const today = new Date().toISOString().split('T')[0];
    
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Homepage
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    sitemap += '  </url>\n';

    // Static pages
    const staticPages = [
      { path: '/blog', priority: '0.9', changefreq: 'daily' },
      { path: '/hakkimizda', priority: '0.7', changefreq: 'monthly' },
      { path: '/iletisim', priority: '0.6', changefreq: 'monthly' },
      { path: '/gizlilik', priority: '0.5', changefreq: 'yearly' },
      { path: '/kullanim-kosullari', priority: '0.5', changefreq: 'yearly' },
      { path: '/cerez-politikasi', priority: '0.5', changefreq: 'yearly' },
      { path: '/kvkk', priority: '0.5', changefreq: 'yearly' },
    ];

    staticPages.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.path}</loc>\n`;
      sitemap += `    <lastmod>${today}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });

    // Betting sites
    sites.forEach(site => {
      const lastmod = site.updated_at ? new Date(site.updated_at).toISOString().split('T')[0] : today;
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/site/${site.slug}</loc>\n`;
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      sitemap += '  </url>\n';
    });

    // Categories
    categories.forEach(category => {
      const lastmod = category.updated_at ? new Date(category.updated_at).toISOString().split('T')[0] : today;
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/kategori/${category.slug}</loc>\n`;
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.7</priority>\n';
      sitemap += '  </url>\n';
    });

    // Blog posts
    blogPosts.forEach(post => {
      const lastmod = post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : today;
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemap += '    <changefreq>monthly</changefreq>\n';
      sitemap += '    <priority>0.6</priority>\n';
      sitemap += '  </url>\n';
    });

    // News articles
    newsArticles.forEach(article => {
      const lastmod = article.updated_at ? new Date(article.updated_at).toISOString().split('T')[0] : today;
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/haber/${article.slug}</loc>\n`;
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemap += '    <changefreq>monthly</changefreq>\n';
      sitemap += '    <priority>0.6</priority>\n';
      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';

    console.log(`Sitemap generated successfully with ${sites.length + blogPosts.length + newsArticles.length + categories.length + staticPages.length + 1} URLs`);

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Last-Modified': new Date().toUTCString(),
        'Content-Length': sitemap.length.toString(),
      }
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // Return minimal valid sitemap as fallback
    const requestUrl = new URL(req.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    const today = new Date().toISOString().split('T')[0];
    
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      status: 200,
      headers: corsHeaders
    });
  }
});
