import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduledPost {
  id: string;
  title: string;
  slug: string;
  scheduled_publish_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const startTime = Date.now();
    console.log('🚀 Starting scheduled posts publication check...');

    // Find posts that are scheduled to be published
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, scheduled_publish_at')
      .eq('is_published', false)
      .not('scheduled_publish_at', 'is', null)
      .lte('scheduled_publish_at', new Date().toISOString())
      .order('scheduled_publish_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching scheduled posts:', fetchError);
      throw fetchError;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log('✅ No posts scheduled for publication at this time.');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No posts to publish',
          published_count: 0,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`📝 Found ${scheduledPosts.length} post(s) ready to publish:`);
    scheduledPosts.forEach((post: ScheduledPost) => {
      console.log(`  - "${post.title}" (${post.slug}) scheduled for ${post.scheduled_publish_at}`);
    });

    // Publish all scheduled posts
    const postIds = scheduledPosts.map((p: ScheduledPost) => p.id);
    
    const { data: updatedPosts, error: updateError } = await supabase
      .from('blog_posts')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .in('id', postIds)
      .select('id, title, slug');

    if (updateError) {
      console.error('❌ Error publishing posts:', updateError);
      throw updateError;
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Successfully published ${updatedPosts?.length || 0} post(s) in ${duration}ms`);

    if (updatedPosts) {
      updatedPosts.forEach((post: { title: string; slug: string }) => {
        console.log(`  ✓ Published: "${post.title}" (${post.slug})`);
      });
    }

    // Log the operation
    try {
      await supabase.rpc('log_system_event', {
        p_log_type: 'scheduled_publish',
        p_severity: 'info',
        p_action: 'publish_scheduled_posts',
        p_details: {
          published_count: updatedPosts?.length || 0,
          post_ids: postIds,
          duration_ms: duration,
        },
      });
    } catch (logError) {
      console.error('⚠️ Failed to log event:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Published ${updatedPosts?.length || 0} post(s)`,
        published_count: updatedPosts?.length || 0,
        posts: updatedPosts,
        duration_ms: duration,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
