import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to log API calls
async function logApiCall(
  supabaseClient: any,
  functionName: string,
  method: string,
  endpoint: string,
  statusCode: number,
  durationMs: number,
  requestBody: any = null,
  responseBody: any = null,
  errorMessage: string | null = null,
  userAgent: string | null = null,
  ipAddress: string | null = null
) {
  try {
    await supabaseClient
      .from('api_call_logs')
      .insert({
        function_name: functionName,
        method,
        endpoint,
        status_code: statusCode,
        duration_ms: durationMs,
        request_body: requestBody,
        response_body: responseBody,
        error_message: errorMessage,
        user_agent: userAgent,
        ip_address: ipAddress,
      });
  } catch (error) {
    console.error('Failed to log API call:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
  
  const userAgent = req.headers.get('user-agent');
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

  try {
    const url = new URL(req.url);
    const method = req.method;
    let requestBody = null;

    console.log(`AI Info Request: ${method} ${url.pathname}`);
    
    if (method === 'POST') {
      requestBody = await req.json();
    }

    // GET - Return all sites
    if (method === 'GET') {
      const { data: sites, error: sitesError } = await supabaseClient
        .from('betting_sites')
        .select(`
          id,
          name,
          slug,
          rating,
          bonus,
          features,
          pros,
          cons,
          expert_review,
          verdict,
          login_guide,
          withdrawal_guide,
          game_categories,
          faq,
          affiliate_link,
          email,
          whatsapp,
          telegram,
          twitter,
          instagram,
          facebook,
          youtube,
          is_featured
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (sitesError) {
        console.error('Sites fetch error:', sitesError);
        throw sitesError;
      }

      // Get stats for each site
      const { data: stats } = await supabaseClient
        .from('site_stats')
        .select('site_id, views, clicks');

      // Enrich sites with stats
      const enrichedSites = sites.map(site => {
        const siteStats = stats?.find(s => s.site_id === site.id);
        return {
          ...site,
          views: siteStats?.views || 0,
          clicks: siteStats?.clicks || 0,
          ctr: siteStats?.views ? ((siteStats.clicks / siteStats.views) * 100).toFixed(2) : '0',
        };
      });

      // Extract unique categories from features
      const allFeatures = sites.flatMap(site => site.features || []);
      const categories = [...new Set(allFeatures)];

      console.log(`Returning ${enrichedSites.length} sites to AI`);

      const duration = Date.now() - startTime;
      
      await logApiCall(
        supabaseClient,
        'ai-site-info',
        'GET',
        url.pathname,
        200,
        duration,
        null,
        { success: true, count: sites?.length || 0 },
        null,
        userAgent,
        ipAddress
      );

        const duration = Date.now() - startTime;
        
        await logApiCall(
          supabaseClient,
          'ai-site-info',
          'POST',
          url.pathname + '?action=recommend',
          200,
          duration,
          { userPreferences },
          { success: true, count: recommendedSites?.length || 0 },
          null,
          userAgent,
          ipAddress
        );

        return new Response(
          JSON.stringify({
            success: true,
            data: {
            sites: enrichedSites,
            totalSites: enrichedSites.length,
            categories,
            featuredSites: enrichedSites.filter(s => s.is_featured),
            topRated: enrichedSites.slice(0, 5),
            metadata: {
              lastUpdated: new Date().toISOString(),
              apiVersion: '1.0.0',
              description: 'Türkiye\'nin en güvenilir bahis siteleri listesi',
            },
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Search and filter
    if (method === 'POST') {
      const body = await req.json();
      const { query, minRating, features, sortBy = 'rating' } = body;

      console.log('AI Search query:', { query, minRating, features, sortBy });

      let queryBuilder = supabaseClient
        .from('betting_sites')
        .select('*')
        .eq('is_active', true);

      // Text search
      if (query) {
        queryBuilder = queryBuilder.or(
          `name.ilike.%${query}%,bonus.ilike.%${query}%,features.cs.{${query}}`
        );
      }

      // Rating filter
      if (minRating) {
        queryBuilder = queryBuilder.gte('rating', minRating);
      }

      // Features filter
      if (features && features.length > 0) {
        queryBuilder = queryBuilder.contains('features', features);
      }

      // Sort
      queryBuilder = queryBuilder.order(sortBy, { ascending: false });

      const { data: sites, error } = await queryBuilder;

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      console.log(`Search found ${sites.length} sites`);

      const duration = Date.now() - startTime;
      
      await logApiCall(
        supabaseClient,
        'ai-site-info',
        'POST',
        url.pathname,
        200,
        duration,
        { query, minRating, features, sortBy },
        { success: true, count: results?.length || 0 },
        null,
        userAgent,
        ipAddress
      );

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            sites,
            count: sites.length,
            query: requestBody,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  } catch (error) {
    console.error('AI Info Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const duration = Date.now() - startTime;
    
    await logApiCall(
      supabaseClient,
      'ai-site-info',
      req.method,
      new URL(req.url).pathname,
      500,
      duration,
      null,
      null,
      errorMessage,
      userAgent,
      ipAddress
    );
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
