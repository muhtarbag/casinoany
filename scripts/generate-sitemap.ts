/**
 * Sitemap Generator
 * Generates sitemap.xml from Supabase data
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const SITE_URL = 'https://casinoany.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlTags = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urlTags}
</urlset>`;
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...\n');

  const urls: SitemapUrl[] = [];

  // Homepage - highest priority
  urls.push({
    loc: SITE_URL,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 1.0
  });

  // Static pages
  const staticPages = [
    { path: '/giris', priority: 0.8 },
    { path: '/kayit', priority: 0.8 },
    { path: '/iletisim', priority: 0.7 },
    { path: '/hakkimizda', priority: 0.6 },
    { path: '/gizlilik-politikasi', priority: 0.5 },
    { path: '/kullanim-kosullari', priority: 0.5 }
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${SITE_URL}${page.path}`,
      changefreq: 'monthly',
      priority: page.priority
    });
  });

  // Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .eq('is_active', true);

  if (categories) {
    categories.forEach(cat => {
      urls.push({
        loc: `${SITE_URL}/${cat.slug}`,
        lastmod: cat.updated_at ? new Date(cat.updated_at).toISOString().split('T')[0] : undefined,
        changefreq: 'weekly',
        priority: 0.9
      });
    });
    console.log(`✅ Added ${categories.length} categories`);
  }

  // Betting Sites
  const { data: sites } = await supabase
    .from('betting_sites')
    .select('slug, updated_at')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (sites) {
    sites.forEach(site => {
      urls.push({
        loc: `${SITE_URL}/site/${site.slug}`,
        lastmod: site.updated_at ? new Date(site.updated_at).toISOString().split('T')[0] : undefined,
        changefreq: 'weekly',
        priority: 0.8
      });
    });
    console.log(`✅ Added ${sites.length} betting sites`);
  }

  // Blog Posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (posts) {
    posts.forEach(post => {
      urls.push({
        loc: `${SITE_URL}/${post.slug}`,
        lastmod: post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : undefined,
        changefreq: 'monthly',
        priority: 0.7
      });
    });
    console.log(`✅ Added ${posts.length} blog posts`);
  }

  // Generate XML
  const xml = generateSitemapXML(urls);

  // Write to public directory
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml);

  console.log(`\n✅ Sitemap generated: ${sitemapPath}`);
  console.log(`📊 Total URLs: ${urls.length}`);
}

// Run
generateSitemap().catch(error => {
  console.error('❌ Sitemap generation failed:', error);
  process.exit(1);
});
