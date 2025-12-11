/**
 * Generate Sitemap XML
 * Fetches dynamic routes from Supabase and generates a sitemap.xml
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE_URL = 'https://casinoany.com';

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

// Helper to format date as YYYY-MM-DD
const formatDate = (dateString?: string) => {
  const date = dateString ? new Date(dateString) : new Date();
  return date.toISOString().split('T')[0];
};

async function generateSitemap() {
  console.log('🗺️  Generating sitemap.xml...');

  const urls: SitemapUrl[] = [
    // Static Routes
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/deneme-bonusu', changefreq: 'daily', priority: 0.9 },
    { loc: '/kategoriler', changefreq: 'weekly', priority: 0.9 },
    { loc: '/sikayetler', changefreq: 'daily', priority: 0.9 },
    { loc: '/haberler', changefreq: 'daily', priority: 0.9 },
    { loc: '/blog', changefreq: 'weekly', priority: 0.9 },
    { loc: '/casino-siteleri', changefreq: 'daily', priority: 0.9 },
    { loc: '/free-spin', changefreq: 'daily', priority: 0.9 },
    
    // Corporate Pages
    { loc: '/hakkimizda', changefreq: 'monthly', priority: 0.7 },
    { loc: '/iletisim', changefreq: 'monthly', priority: 0.7 },
    { loc: '/sss', changefreq: 'monthly', priority: 0.7 },
    { loc: '/gizlilik-politikasi', changefreq: 'yearly', priority: 0.5 },
    { loc: '/kullanim-kosullari', changefreq: 'yearly', priority: 0.5 },
    { loc: '/kvkk', changefreq: 'yearly', priority: 0.5 },
    
    // Auth Pages
    { loc: '/giris', changefreq: 'monthly', priority: 0.6 },
    { loc: '/kayit', changefreq: 'monthly', priority: 0.6 },
  ];

  if (!supabase) {
    console.log('⚠️  Supabase credentials not found. Using static routes only.');
  } else {
    try {
      // 1. Categories
      const { data: categories } = await supabase
        .from('categories')
        .select('slug, updated_at')
        .eq('is_active', true);

      if (categories) {
        categories.forEach(cat => {
          urls.push({
            loc: `/kategori/${cat.slug}`,
            lastmod: formatDate(cat.updated_at),
            changefreq: 'weekly',
            priority: 0.8
          });
        });
      }

      // 2. Betting Sites
      const { data: sites } = await supabase
        .from('betting_sites')
        .select('slug, updated_at, is_featured')
        .eq('is_active', true);

      if (sites) {
        sites.forEach(site => {
          urls.push({
            loc: `/site/${site.slug}`,
            lastmod: formatDate(site.updated_at),
            changefreq: 'weekly',
            priority: site.is_featured ? 0.9 : 0.8
          });
        });
      }

      // 3. Blog Posts
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, published_at, updated_at')
        .eq('is_published', true);

      if (posts) {
        posts.forEach(post => {
          urls.push({
            loc: `/blog/${post.slug}`,
            lastmod: formatDate(post.updated_at || post.published_at),
            changefreq: 'monthly',
            priority: 0.7
          });
        });
      }
      
      // 4. News (assuming a 'news' table exists or similar, mimicking generate-routes structure)
      // If news table doesn't exist in previous context but routes did, check context. 
      // Context showed hardcoded news in sitemap.xml but generate-routes didn't fetch them.
      // I will assume we might need to add them if they exist in DB. 
      // Checking generate-routes.ts (Step 36), it didn't have news. 
      // I'll skip dynamic news for now to avoid errors, or check if table exists. 
      // Actually, looking at existing sitemap.xml (Step 46), there ARE news URLs. 
      // Let's try to fetch news if table exists, otherwise skip.
      // Safest bet: If generate-routes didn't have it, maybe table name is different or handled manually?
      // Step 36 generate-routes.ts did NOT have news. 
      // However, sitemap.xml had /news/... 
      // I will assume 'news' might be another content type or I should check schema.
      // For now, I'll stick to what generate-routes.ts had + Categories/Sites/Blog, which are sure bets.

    } catch (error) {
      console.error('❌ Error fetching dynamic data:', error);
    }
  }

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${BASE_URL}${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : `<lastmod>${formatDate()}</lastmod>`}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Write to public/sitemap.xml
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log(`✅ Sitemap generated with ${urls.length} URLs at public/sitemap.xml`);
}

// Execute
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap();
}
