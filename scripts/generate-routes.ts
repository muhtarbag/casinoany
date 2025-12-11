/**
 * Generate Routes for Prerendering
 * Fetches dynamic routes from Supabase for SSG
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // Load .env file


const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Only create supabase client if credentials are available
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export async function generateRoutes(): Promise<string[]> {
  const routes: string[] = [
    // Static routes
    '/',
    '/giris',
    '/kayit',
    '/iletisim',
    '/hakkimizda',
    '/gizlilik-politikasi',
    '/kullanim-kosullari',
    '/canli-bahis',
    '/free-spin',
    '/kacak-bahis',
    '/bonus-veren-siteler',
    '/en-iyi-casino',
    // Payment Methods
    '/odeme/havale-eft',
    '/odeme/kredi-karti',
    '/odeme/kripto-para',
    // Influencers
    '/fenomen/ekrem-abi',
    '/fenomen/dede',
    '/fenomen/roshtein',
    // Blog Posts
    '/guvenilir-bahis-siteleri-nasil-anlasilir',
    '/deneme-bonusu-veren-siteler-kazanc-taktikleri',
    '/canli-bahis-kazanma-stratejileri',
    '/slot-rtp-nedir-kazanma-oranlari',
    '/papara-ile-bahis-para-yatirma',
    '/blackjack-kart-sayma-taktikleri',
    '/kripto-para-bitcoin-bahis',
    '/belge-istemeyen-bahis-siteleri',
    '/vip-casino-uyeligi-avantajlari',
    '/sanal-bahis-hileleri-taktikleri',
  ];

  // Only fetch dynamic routes if Supabase is available
  if (!supabase) {
    console.log('ℹ️  Supabase credentials not found, using static routes only');
    return routes;
  }

  try {
    // Fetch active categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug')
      .eq('is_active', true);

    if (categories) {
      categories.forEach(cat => {
        routes.push(`/${cat.slug}`);
      });
    }

    // Fetch active betting sites (top 50 for prerendering)
    const { data: sites } = await supabase
      .from('betting_sites')
      .select('slug')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(50);

    if (sites) {
      sites.forEach(site => {
        routes.push(`/site/${site.slug}`);
        // Add AMP route for site
        routes.push(`/amp/${site.slug}`);
      });
    }

    // Fetch published blog posts (last 100)
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(100);

    if (posts) {
      posts.forEach(post => {
        routes.push(`/blog/${post.slug}`);
        // Add AMP route for blog post
        routes.push(`/amp/blog/${post.slug}`);
      });
    }

    console.log(`✅ Generated ${routes.length} routes for prerendering`);
    return routes;
  } catch (error) {
    console.error('❌ Error generating routes:', error);
    // Return static routes as fallback
    return routes;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  generateRoutes().then(routes => {
    console.log(JSON.stringify(routes, null, 2));
  });
}
