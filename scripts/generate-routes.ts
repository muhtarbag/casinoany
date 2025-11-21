/**
 * Generate Routes for Prerendering
 * Fetches dynamic routes from Supabase for SSG
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  ];

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
