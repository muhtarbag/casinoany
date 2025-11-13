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
    const siteId = url.searchParams.get('siteId');
    const minRating = url.searchParams.get('minRating');

    console.log(`AI Reviews Request: siteId=${siteId}, minRating=${minRating}`);

    let query = supabaseClient
      .from('site_reviews')
      .select(`
        id,
        site_id,
        title,
        rating,
        comment,
        name,
        created_at,
        betting_sites (
          name,
          slug
        )
      `)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    if (minRating) {
      query = query.gte('rating', parseInt(minRating));
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Reviews fetch error:', error);
      throw error;
    }

    // Format reviews for AI
    const formattedReviews = reviews.map(review => {
      const site = Array.isArray(review.betting_sites) ? review.betting_sites[0] : review.betting_sites;
      return {
        id: review.id,
        siteId: review.site_id,
        siteName: site?.name,
        siteSlug: site?.slug,
        title: review.title,
        rating: review.rating,
        comment: review.comment,
        reviewerName: review.name,
        createdAt: review.created_at,
      };
    });

    // Calculate aggregate stats
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
      : 0;

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    console.log(`Returning ${formattedReviews.length} reviews to AI`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          reviews: formattedReviews,
          count: formattedReviews.length,
          statistics: {
            averageRating: avgRating,
            totalReviews: formattedReviews.length,
            ratingDistribution,
          },
          metadata: {
            lastUpdated: new Date().toISOString(),
          },
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI Reviews Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
