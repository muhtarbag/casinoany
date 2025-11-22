/**
 * Generate Sitemap for SEO
 * Fetches all routes from Supabase and generates sitemap.xml
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const SITE_URL = process.env.SITE_URL || 'https://casinoany.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...\n');

  const urls: SitemapUrl[] = [];
  const now = new Date().toISOString();

  // Static routes
  const staticRoutes = [
    { path: '/', priority: 1.0, changefreq: 'daily' as const },
    { path: '/giris', priority: 0.8, changefreq: 'monthly' as const },
    { path: '/kayit', priority: 0.8, changefreq: 'monthly' as const },
    { path: '/iletisim', priority: 0.6, changefreq: 'monthly' as const },
    { path: '/hakkimizda', priority: 0.6, changefreq: 'monthly' as const },
    { path: '/gizlilik-politikasi', priority: 0.4, changefreq: 'yearly' as const },
    { path: '/kullanim-kosullari', priority: 0.4, changefreq: 'yearly' as const },
  ];

  staticRoutes.forEach(route => {
    urls.push({
      loc: `${SITE_URL}${route.path}`,
      lastmod: now,
      changefreq: route.changefreq,
      priority: route.priority,
    });
  });

  try {
    // Fetch categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true);

    if (categories) {
      categories.forEach(cat => {
        urls.push({
          loc: `${SITE_URL}/${cat.slug}`,
          lastmod: cat.updated_at || now,
          changefreq: 'weekly',
          priority: 0.8,
        });
      });
    }

    // Fetch betting sites
    const { data: sites } = await supabase
      .from('betting_sites')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (sites) {
      sites.forEach(site => {
        urls.push({
          loc: `${SITE_URL}/site/${site.slug}`,
          lastmod: site.updated_at || now,
          changefreq: 'weekly',
          priority: 0.9,
        });
      });
    }

    // Fetch blog posts
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (posts) {
      posts.forEach(post => {
        urls.push({
          loc: `${SITE_URL}/blog/${post.slug}`,
          lastmod: post.updated_at || now,
          changefreq: 'monthly',
          priority: 0.7,
        });
      });
    }

    console.log(`✅ Found ${urls.length} URLs\n`);
  } catch (error) {
    console.error('⚠️  Error fetching dynamic routes:', error);
    console.log('📝 Continuing with static routes only...\n');
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Write to dist folder
  const distPath = path.resolve(__dirname, '../dist/sitemap.xml');
  fs.writeFileSync(distPath, xml, 'utf-8');

  console.log('✅ Sitemap generated successfully!');
  console.log(`📍 Location: dist/sitemap.xml`);
  console.log(`📊 Total URLs: ${urls.length}`);
}

// Run
generateSitemap().catch(error => {
  console.error('❌ Failed to generate sitemap:', error);
  process.exit(1);
});
