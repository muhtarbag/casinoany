// Blog Posts Sitemap
// Handles all published blog posts

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

    // Fetch all published blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at, view_count')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(50000);

    if (error) throw error;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${(posts || [])
  .map((post) => {
    const lastmod = post.updated_at
      ? new Date(post.updated_at).toISOString()
      : new Date().toISOString();
    
    // Higher priority for popular posts
    const priority = (post.view_count || 0) > 1000 ? '0.9' : 
                     (post.view_count || 0) > 500 ? '0.8' : '0.7';
    
    // Recent posts get higher changefreq
    const publishDate = new Date(post.published_at || post.updated_at);
    const daysSincePublish = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    const changefreq = daysSincePublish < 7 ? 'daily' : 
                       daysSincePublish < 30 ? 'weekly' : 'monthly';

    return `  <url>
    <loc>https://${domain}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
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
    console.error('Sitemap-blogs error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: corsHeaders, status: 500 }
    );
  }
});
