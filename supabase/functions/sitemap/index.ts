import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const baseUrl = 'https://casinoany.com';
    const today = new Date().toISOString().split('T')[0];

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/categories', priority: '0.9', changefreq: 'weekly' },
      { url: '/blog', priority: '0.9', changefreq: 'daily' },
      { url: '/news', priority: '0.9', changefreq: 'daily' },
      { url: '/complaints', priority: '0.8', changefreq: 'daily' },
      { url: '/hakkimizda', priority: '0.7', changefreq: 'monthly' },
      { url: '/iletisim', priority: '0.7', changefreq: 'monthly' },
      { url: '/gizlilik-politikasi', priority: '0.6', changefreq: 'monthly' },
      { url: '/kullanim-kosullari', priority: '0.6', changefreq: 'monthly' },
      { url: '/cerez-politikasi', priority: '0.6', changefreq: 'monthly' },
      { url: '/auth', priority: '0.5', changefreq: 'monthly' },
    ];

    // Fetch categories
    const { data: categories } = await supabaseClient
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('display_order');

    // Fetch casino sites
    const { data: sites } = await supabaseClient
      .from('betting_sites')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('display_order');

    // Fetch blog posts
    const { data: blogPosts } = await supabaseClient
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    // Fetch news articles
    const { data: newsArticles } = await supabaseClient
      .from('news_articles')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    // Fetch complaints
    const { data: complaints } = await supabaseClient
      .from('site_complaints')
      .select('slug, updated_at, site_id')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add categories
    categories?.forEach(cat => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/categories/${cat.slug}</loc>\n`;
      xml += `    <lastmod>${cat.updated_at?.split('T')[0] || today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += '  </url>\n';
    });

    // Add casino sites
    sites?.forEach(site => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/casino/${site.slug}</loc>\n`;
      xml += `    <lastmod>${site.updated_at?.split('T')[0] || today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += '  </url>\n';
    });

    // Add blog posts
    blogPosts?.forEach(post => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${post.updated_at?.split('T')[0] || today}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += '  </url>\n';
    });

    // Add news articles
    newsArticles?.forEach(news => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/news/${news.slug}</loc>\n`;
      xml += `    <lastmod>${news.updated_at?.split('T')[0] || today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += '  </url>\n';
    });

    // Add complaints with site context
    complaints?.forEach(complaint => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/complaints/${complaint.slug}</loc>\n`;
      xml += `    <lastmod>${complaint.updated_at?.split('T')[0] || today}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    return new Response(xml, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
