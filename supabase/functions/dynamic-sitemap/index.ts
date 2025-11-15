import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=UTF-8',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://casinoany.com';
    const currentDate = new Date().toISOString().split('T')[0];

    // Check if force refresh is requested
    const url = new URL(req.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';

    // Try to fetch sitemap from database first (if not force refreshing)
    if (!forceRefresh) {
      const { data: settingData } = await supabase
        .from('site_settings')
        .select('setting_value, updated_at')
        .eq('setting_key', 'sitemap_xml')
        .maybeSingle();

      // Check if cache is fresh (less than 6 hours old)
      if (settingData?.setting_value && settingData.updated_at) {
        const cacheAge = Date.now() - new Date(settingData.updated_at).getTime();
        const sixHours = 6 * 60 * 60 * 1000;
        
        if (cacheAge < sixHours) {
          console.log('✅ Serving cached sitemap from database');
          return new Response(settingData.setting_value, {
            headers: {
              ...corsHeaders,
              'Cache-Control': 'public, max-age=3600, s-maxage=21600', // 1h browser, 6h CDN
              'Last-Modified': new Date(settingData.updated_at).toUTCString(),
            }
          });
        }
      }
    }

    console.log('⚠️ Generating fresh sitemap...');

    // Fetch all active sites with logo for image sitemap
    const { data: sites, error: sitesError } = await supabase
      .from('betting_sites')
      .select('slug, updated_at, name, logo_url')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (sitesError) {
      console.error('Error fetching sites:', sitesError);
      throw sitesError;
    }

    // Fetch all published blog posts
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, title, featured_image, tags')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      throw postsError;
    }

    // Fetch all published news articles
    const { data: news, error: newsError } = await supabase
      .from('news_articles')
      .select('slug, updated_at, published_at, title')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(100); // Last 100 news articles

    if (newsError) {
      console.error('Error fetching news:', newsError);
    }

    // Build XML sitemap with namespaces
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Legal Pages -->
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/cookies</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/kvkk</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${posts?.[0]?.updated_at ? new Date(posts[0].updated_at).toISOString().split('T')[0] : currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/haberler</loc>
    <lastmod>${news?.[0]?.updated_at ? new Date(news[0].updated_at).toISOString().split('T')[0] : currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/casino-siteleri</loc>
    <lastmod>${sites?.[0]?.updated_at ? new Date(sites[0].updated_at).toISOString().split('T')[0] : currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/spor-bahisleri</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/bonus-kampanyalari</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/deneme-bonusu</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/mobil-bahis</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/canli-casino</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Betting Sites with Image Tags -->
  ${sites?.map(site => `
  <url>
    <loc>${baseUrl}/${site.slug}</loc>
    <lastmod>${new Date(site.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${site.logo_url ? `
    <image:image>
      <image:loc>${site.logo_url}</image:loc>
      <image:title>${site.name} Logo</image:title>
    </image:image>` : ''}
  </url>`).join('') || ''}

  <!-- Blog Posts with Images -->
  ${posts?.map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${post.featured_image ? `
    <image:image>
      <image:loc>${post.featured_image}</image:loc>
      <image:title>${post.title}</image:title>
    </image:image>` : ''}
  </url>`).join('') || ''}

  <!-- News Articles with Google News Tags -->
  ${news?.map(article => {
    const pubDate = new Date(article.published_at || article.updated_at);
    const isRecent = (Date.now() - pubDate.getTime()) < (2 * 24 * 60 * 60 * 1000); // 2 days
    return `
  <url>
    <loc>${baseUrl}/haberler/${article.slug}</loc>
    <lastmod>${new Date(article.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${isRecent ? '0.8' : '0.6'}</priority>${isRecent ? `
    <news:news>
      <news:publication>
        <news:name>CasinoAny</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${pubDate.toISOString()}</news:publication_date>
      <news:title>${article.title}</news:title>
    </news:news>` : ''}
  </url>`}).join('') || ''}

</urlset>`;

    // Store the generated sitemap in database for caching
    try {
      await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'sitemap_xml',
          setting_value: xml,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'setting_key'
        });
      console.log('✅ Sitemap cached in database');
    } catch (cacheError) {
      console.error('⚠️ Failed to cache sitemap:', cacheError);
      // Continue anyway - don't fail the request
    }

    console.log(`✅ Generated sitemap with ${sites?.length || 0} sites, ${posts?.length || 0} posts, ${news?.length || 0} news`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600, s-maxage=21600', // 1h browser, 6h CDN
        'X-Robots-Tag': 'noindex', // Don't index the sitemap itself
      },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>${errorMessage}</message>
  <timestamp>${new Date().toISOString()}</timestamp>
</error>`,
      { 
        headers: corsHeaders,
        status: 500 
      }
    );
  }
});
