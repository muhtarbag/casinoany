import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const category = url.searchParams.get('category');

    console.log(`AI Blog Request: limit=${limit}, category=${category}`);

    let query = supabaseClient
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        tags,
        category,
        published_at,
        read_time,
        view_count,
        featured_image,
        meta_title,
        meta_description
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Blog fetch error:', error);
      throw error;
    }

    // Get related sites for each post
    const postsWithSites = await Promise.all(
      posts.map(async (post) => {
        const { data: relatedSites } = await supabaseClient
          .from('blog_post_related_sites')
          .select(`
            site_id,
            betting_sites (
              id,
              name,
              slug,
              rating,
              bonus
            )
          `)
          .eq('post_id', post.id);

        return {
          ...post,
          relatedSites: relatedSites?.map(rs => rs.betting_sites) || [],
        };
      })
    );

    console.log(`Returning ${postsWithSites.length} blog posts to AI`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          posts: postsWithSites,
          count: postsWithSites.length,
          metadata: {
            lastUpdated: new Date().toISOString(),
            categories: [...new Set(posts.map(p => p.category).filter(Boolean))],
          },
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI Blog Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
